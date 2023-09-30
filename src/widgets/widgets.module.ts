import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationMiddleware } from 'src/common/middlewares/authentication.middleware';
import widgetsConfig from './config/widgets.config';
import { WidgetsController } from './widgets.controller';
import { WidgetsService } from './widgets.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import prismaConfig from 'src/prisma/prisma.config';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forFeature(widgetsConfig),
    PrismaModule,
    KafkaModule,
    ConfigModule.forFeature(prismaConfig),
  ],
  controllers: [WidgetsController],
  providers: [WidgetsService],
})
export class WidgetsModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer
      .apply(AuthenticationMiddleware)
      .forRoutes(
        { method: RequestMethod.GET, path: '/widgets' },
        { method: RequestMethod.GET, path: '/widgets/:id' },
        { method: RequestMethod.POST, path: 'widgets' },
        { method: RequestMethod.PATCH, path: '/widgets/:id' },
        { method: RequestMethod.DELETE, path: '/widgets/:id' },
      );
  }
}
