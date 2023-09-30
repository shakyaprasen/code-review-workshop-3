import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import prismaConfig from 'src/prisma/prisma.config';
import { ConfigType } from '@nestjs/config';
import { KafkaService } from 'src/kafka/kafka.service';
import { BROADCAST_TOPICS } from 'src/kafka/kafka.constants';

@Injectable()
export class ReviewsService {
  private readonly logger;
  constructor(
    private readonly prisma: PrismaService,
    @Inject(prismaConfig.KEY)
    private readonly configService: ConfigType<typeof prismaConfig>,
    private readonly kafkaService: KafkaService,
  ) {
    this.logger = new Logger(ReviewsService.name);
  }

  findAll(params: PaginationQueryDto) {
    const { limit, offset } = params;

    return this.prisma.review.findMany({
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: number): Promise<any> {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    return review;
  }

  async create(createReviewDto: CreateReviewDto) {
    await this.prisma.review.create({ data: { ...createReviewDto } });
    this.kafkaService.sendMessage(
      [
        {
          type: BROADCAST_TOPICS.WIDGET_CREATED,
          data: createReviewDto,
        },
      ],
      BROADCAST_TOPICS.WIDGET_CREATED,
    );
  }

  async update(id: number, updateReviewDto: UpdateReviewDto) {
    try {
      const review = await this.prisma.review.update({
        where: { id },
        data: updateReviewDto,
      });
      return review;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Review with id ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.review.delete({ where: { id } });
  }
}
