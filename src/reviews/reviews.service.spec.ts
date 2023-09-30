import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    const review: TestingModule = await Test.createTestingModule({
      providers: [ReviewsService],
    }).compile();

    service = review.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
