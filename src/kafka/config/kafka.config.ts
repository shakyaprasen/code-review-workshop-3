import { registerAs } from '@nestjs/config';
import { getEnvValue } from 'src/common/utils/secret.utils';

export default registerAs('kafka', () => ({
  kafkaUserName: getEnvValue('KAFKA_USERNAME'),
  kafkaPassword: getEnvValue('KAFKA_PASSWORD'),
  brokerUrl: process.env.KAFKA_BROKER_URLS
    ? process.env.KAFKA_BROKER_URLS.split(',')
    : [],
}));
