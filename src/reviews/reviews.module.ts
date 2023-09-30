import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtMiddleware } from 'src/common/middlewares/jwt.middleware';
import reviewsConfig from './config/reviews.config';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import prismaConfig from 'src/prisma/prisma.config';
import { KafkaModule } from 'src/kafka/kafka.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forFeature(reviewsConfig),
    PrismaModule,
    KafkaModule,
    ConfigModule.forFeature(prismaConfig),
    JwtModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, JwtService],
})
export class ReviewsModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        { method: RequestMethod.GET, path: '/reviews/:id' },
        { method: RequestMethod.POST, path: 'reviews' },
        { method: RequestMethod.PATCH, path: '/reviews/:id' },
        { method: RequestMethod.DELETE, path: '/reviews/:id' },
      );
  }
}
