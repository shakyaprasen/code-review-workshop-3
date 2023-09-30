import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from 'src/config/app.config';
import kafkaConfig from './config/kafka.config';
import { KafkaService } from './kafka.service';

@Module({
  imports: [
    ConfigModule.forFeature(kafkaConfig),
    ConfigModule.forFeature(appConfig),
  ],
  controllers: [],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule {}
