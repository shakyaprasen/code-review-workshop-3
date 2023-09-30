import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import prismaConfig from 'src/prisma/prisma.config';
import { ConfigType } from '@nestjs/config';
import { KafkaService } from 'src/kafka/kafka.service';
import { BROADCAST_TOPICS } from 'src/kafka/kafka.constants';

@Injectable()
export class WidgetsService {
  private readonly logger;
  constructor(
    private readonly prisma: PrismaService,
    @Inject(prismaConfig.KEY)
    private readonly configService: ConfigType<typeof prismaConfig>,
    private readonly kafkaService: KafkaService,
  ) {
    this.logger = new Logger(WidgetsService.name);
  }

  findAll(params: PaginationQueryDto) {
    const { limit, offset } = params;

    return this.prisma.widget.findMany({
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: number): Promise<any> {
    const widget = await this.prisma.widget.findUnique({ where: { id } });
    if (!widget) {
      throw new NotFoundException(`Widget with id ${id} not found`);
    }
    return widget;
  }

  async create(createWidgetDto: CreateWidgetDto) {
    await this.prisma.widget.create({ data: { ...createWidgetDto } });
    this.kafkaService.sendMessage(
      [
        {
          type: BROADCAST_TOPICS.WIDGET_CREATED,
          data: createWidgetDto,
        },
      ],
      BROADCAST_TOPICS.WIDGET_CREATED,
    );
  }

  async update(id: number, updateWidgetDto: UpdateWidgetDto) {
    try {
      const widget = await this.prisma.widget.update({
        where: { id },
        data: updateWidgetDto,
      });
      return widget;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Widget with id ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.widget.delete({ where: { id } });
  }
}
