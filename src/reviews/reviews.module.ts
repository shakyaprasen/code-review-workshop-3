import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationMiddleware } from 'src/common/middlewares/authentication.middleware';
import reviewsConfig from './config/reviews.config';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import prismaConfig from 'src/prisma/prisma.config';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forFeature(reviewsConfig),
    PrismaModule,
    KafkaModule,
    ConfigModule.forFeature(prismaConfig),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer
      .apply(AuthenticationMiddleware)
      .forRoutes(
        { method: RequestMethod.GET, path: '/reviews' },
        { method: RequestMethod.GET, path: '/reviews/:id' },
        { method: RequestMethod.POST, path: 'reviews' },
        { method: RequestMethod.PATCH, path: '/reviews/:id' },
        { method: RequestMethod.DELETE, path: '/reviews/:id' },
      );
  }
}
