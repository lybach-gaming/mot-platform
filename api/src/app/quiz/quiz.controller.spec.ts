import { Test, TestingModule } from '@nestjs/testing';
import { GetDetailQuizzesDto } from './dto/get-detail-quizzes.dto';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

describe('QuizController', () => {
  let controller: QuizController;

  const mockQuizService = {
    getDetailQuizzes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        {
          provide: QuizService,
          useValue: mockQuizService,
        },
      ],
    }).compile();

    controller = module.get<QuizController>(QuizController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDetailQuizzes (GET)', () => {
    it('should return quiz details from GET endpoint', async () => {
      const dto: GetDetailQuizzesDto = { slug_quizzes: 'test-quiz' };
      const userId = 1;
      const mockResponse = { error: false, data: { id: 1, name: 'Test Quiz' } };

      mockQuizService.getDetailQuizzes.mockResolvedValue(mockResponse);

      const result = await controller.getDetailQuizzes(dto, userId);

      expect(result).toEqual(mockResponse);
      expect(mockQuizService.getDetailQuizzes).toHaveBeenCalledWith(dto);
    });
  });

  describe('getDetailQuizzesPost (POST)', () => {
    it('should return quiz details from POST endpoint', async () => {
      const dto: GetDetailQuizzesDto = { slug_quizzes: 'test-quiz' };
      const userId = 1;
      const mockResponse = { error: false, data: { id: 1, name: 'Test Quiz' } };

      mockQuizService.getDetailQuizzes.mockResolvedValue(mockResponse);

      const result = await controller.getDetailQuizzesPost(dto, userId);

      expect(result).toEqual(mockResponse);
      expect(mockQuizService.getDetailQuizzes).toHaveBeenCalledWith(dto);
    });
  });
});
