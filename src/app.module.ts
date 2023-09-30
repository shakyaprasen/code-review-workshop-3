import {Module, ValidationPipe} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {APP_PIPE} from '@nestjs/core';
import * as Joi from 'joi';
import {LoggerModule} from 'nestjs-pino';
import appConfig from './config/app.config';
import {ReviewsModule} from './reviews/reviews.module';
import {KafkaModule} from './kafka/kafka.module';
import {PrismaModule} from './prisma/prisma.module';

@Module({
  imports: [
    KafkaModule,
    PrismaModule,
    ConfigModule.forFeature(appConfig),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: (req, res) => ({
          context: 'HTTP',
        }),
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
              target: 'pino-pretty',
              options: {
                singleLine: true,
                colorize: true,
              },
            }
            : undefined,
      },
    }),

    ReviewsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule { }
