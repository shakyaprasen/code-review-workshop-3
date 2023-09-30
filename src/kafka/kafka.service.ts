import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import {
  circuitBreaker,
  ConsecutiveBreaker,
  ExponentialBackoff,
  handleAll,
  retry,
  wrap,
} from 'cockatiel';
import {
  Consumer,
  Kafka,
  KafkaConfig,
  KafkaMessage,
  logLevel,
  Message,
  Producer,
} from 'kafkajs';

import { ConfigType } from '@nestjs/config';
import kafkaConfig from './config/kafka.config';
import { BROADCAST_TOPICS, INCOMING_TOPICS } from './kafka.constants';
import appConfig from 'src/config/app.config';

import { formattedLog } from 'src/common/utils/index.utils';
import { randomUUID } from 'crypto';

@Injectable()
export class KafkaService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  retryEl = retry(handleAll, {
    maxAttempts: 20,
    backoff: new ExponentialBackoff(),
  });

  circuitBreakerEl = circuitBreaker(handleAll, {
    halfOpenAfter: 2 * 1000,
    breaker: new ConsecutiveBreaker(5),
  });

  retryWithBreaker = wrap(this.retryEl, this.circuitBreakerEl);

  async onApplicationBootstrap() {
    this.connect();
  }

  onApplicationShutdown(signal: string) {
    this.disconnect();
  }
  private logger: Logger;

  constructor(
    @Inject(kafkaConfig.KEY)
    private readonly configService: ConfigType<typeof kafkaConfig>,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {
    this.logger = new Logger(KafkaService.name);
  }

  private getKafkaConfig(): KafkaConfig {
    if (this.appConfiguration.environment === 'docker-compose') {
      return {
        logLevel: logLevel.ERROR,
        clientId: randomUUID(),
        connectionTimeout: 3000,
        authenticationTimeout: 15000,
        requestTimeout: 25000,
        brokers: ['reviews_kafka:9092'],
      };
    }

    return {
      logLevel: logLevel.ERROR,
      clientId: randomUUID(),
      ssl: true,
      connectionTimeout: 3000,
      authenticationTimeout: 15000,
      requestTimeout: 25000,
      sasl: {
        mechanism: 'scram-sha-512', // scram-sha-256 or scram-sha-512
        username: this.configService.kafkaUserName,
        password: this.configService.kafkaPassword,
      },
      brokers: this.configService.brokerUrl,
    };
  }

  private kafka: Kafka;
  private consumer: Consumer;
  private producer: Producer;

  public async connect() {
    this.kafka = new Kafka(this.getKafkaConfig());
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({
      groupId: `bl-ms-export-consumer-v1`,
      maxBytes: 4000,
      sessionTimeout: 300000,
    });
    await this.producer.connect();
    await this.consumer.connect();

    await this.consumer.subscribe({
      topics: [...Object.values(INCOMING_TOPICS)],
      fromBeginning: true,
    });

    await this.consumer.run({
      autoCommitThreshold: 1,
      autoCommit: true,
      partitionsConsumedConcurrently: 5, // Default: 1
      eachMessage: async ({ message }) => {
        const parsedMessage = this.parseMessage(message);
        try {
          switch (
            parsedMessage.type
            // Handle based on messages type
          ) {
          }
        } catch (error) {
          // If processing any message failed, send the message to a dead letter queue.
          // Logs are already handled inside each function.
          this.sendDLXMessage(parsedMessage);
        }
      },
    });
  }

  public async hasConnected() {
    return !!this.producer;
  }

  public async disconnect() {
    await this.consumer.disconnect();
    await this.producer.disconnect();
  }

  public async sendMessage<T>(messages: Array<T>, topic: BROADCAST_TOPICS) {
    const formattedMessages: Message[] = messages.map((message) => ({
      value: JSON.stringify(message),
    }));

    try {
      this.retryWithBreaker.execute(() =>
        this.producer.send({ topic, messages: formattedMessages }),
      );
    } catch (error) {
      this.logger.error(
        formattedLog({
          type: 'error',
          context: 'kafka.service',
          message: `Could not send producer message.`,
        }),
        error?.stack,
      );
    }
  }

  public async sendDLXMessage(messages: Message[]) {
    try {
      this.producer.send({
        topic: BROADCAST_TOPICS.DLX_LOGS,
        messages,
      });
    } catch (error) {
      this.logger.error(
        formattedLog({
          type: 'error',
          context: 'kafka.service',
          message: `Could not send message to dead letter queue.`,
        }),
        error?.stack,
      );
    }
  }

  private parseMessage(message: KafkaMessage | null): any {
    if (!message.value) {
      throw new Error('Null kafka message value');
    }
    const messageObj = JSON.parse(message.value.toString('utf8'));
    return messageObj;
  }
}
