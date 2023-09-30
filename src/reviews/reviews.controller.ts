import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Meta, MetaData} from 'src/common/decorators/meta.decorator';
import {PaginationQueryDto} from 'src/common/dto/pagination-query.dto';
import {CreateReviewDto} from './dto/create-review.dto';
import {UpdateReviewDto} from './dto/update-review.dto';
import {ReviewsService} from './reviews.service';
import {Review} from '@prisma/client';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  // Import logger from nest js but under the hood, pino will be used
  private readonly logger = new Logger(ReviewsController.name);

  constructor(private readonly reviewsService: ReviewsService) { }

  @ApiBearerAuth()
  @ApiResponse({status: 200, description: 'List of reviews.'})
  @Get()
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.reviewsService.findAll({...paginationQuery});
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Review> {
    return this.reviewsService.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  async create(
    @MetaData() meta: Meta,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const newReview = await this.reviewsService.create(createReviewDto);

    return newReview;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @MetaData() meta: Meta,
    @Param('id') id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    await this.reviewsService.update(id, updateReviewDto);
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@MetaData() meta: Meta, @Param('id') id: number) {
    await this.reviewsService.remove(id);
    return;
  }
}
