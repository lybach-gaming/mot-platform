import { Test, TestingModule } from '@nestjs/testing';
import { LanguageService } from './language.service';
import { DatabaseService } from '../../core/database/database.service';
import { CategoryService } from '../category/category.service';

describe('LanguageService', () => {
  let service: LanguageService;
  let dbService: DatabaseService;
  let categoryService: CategoryService;

  // Mock transaction functions using jest.fn()
  const mockTransactionFn = jest.fn();
  const mockTableFn = jest.fn();
  const mockWhereFn = jest.fn();
  const mockFirstFn = jest.fn();
  const mockInsertFn = jest.fn();
  const mockUpdateFn = jest.fn();
  const mockDeleteFn = jest.fn();
  const mockLeftJoinFn = jest.fn();
  const mockSelectFn = jest.fn();
  const mockOrderByFn = jest.fn();
  const mockLimitFn = jest.fn();
  const mockOffsetFn = jest.fn();

  // Setup mock DB service with chainable methods
  const mockDbService = {
    connection: {
      transaction: jest.fn(() => mockTransactionFn),
      table: jest.fn(() => ({
        where: mockWhereFn.mockReturnThis(),
        whereIn: jest.fn().mockReturnThis(),
        first: mockFirstFn,
        insert: mockInsertFn,
        update: mockUpdateFn,
        del: mockDeleteFn,
        leftJoin: mockLeftJoinFn.mockReturnThis(),
        select: mockSelectFn.mockReturnThis(),
        orderBy: mockOrderByFn.mockReturnThis(),
        limit: mockLimitFn.mockReturnThis(),
        offset: mockOffsetFn.mockReturnThis(),
      })),
      raw: jest.fn((sql) => sql),
    },
  };

  const mockCategoryService = {
    deleteCategories: jest.fn(),
  };

  // Setup mock transaction object with proper function chains
  const mockTransaction = Object.assign(jest.fn(), {
    commit: jest.fn(),
    rollback: jest.fn(),
    table: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      whereIn: jest.fn().mockReturnThis(),
      first: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      del: jest.fn(),
    })),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguageService,
        { provide: DatabaseService, useValue: mockDbService },
        { provide: CategoryService, useValue: mockCategoryService },
      ],
    }).compile();

    service = module.get<LanguageService>(LanguageService);
    dbService = module.get<DatabaseService>(DatabaseService);
    categoryService = module.get<CategoryService>(CategoryService);

    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default transaction mock
    mockDbService.connection.transaction.mockResolvedValue(mockTransaction);
  });

  describe('createLanguage', () => {
    it('should create a language successfully', async () => {
      const createDto = {
        language: 'English',
        code: 'en',
        status: 1,
        type: 1,
      };

      // Mock transaction table chain
      mockTransaction.table.mockReturnValue({
        insert: jest.fn().mockResolvedValueOnce([1]),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValueOnce({ id: 1, ...createDto }),
      });

      const result = await service.createLanguage(createDto);

      expect(result).toEqual({
        error: false,
        message: expect.any(String),
        data: expect.objectContaining({ id: 1, ...createDto }),
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should handle creation failure', async () => {
      const createDto = {
        language: 'English',
        code: 'en',
        status: 1,
        type: 1,
      };

      mockTransaction.table.mockReturnValue({
        insert: jest.fn().mockResolvedValueOnce([]),
      });

      mockDbService.connection.transaction.mockResolvedValueOnce(
        mockTransaction
      );

      const result = await service.createLanguage(createDto);

      expect(result).toEqual({
        error: true,
        message: 'Failed to create language',
        data: null,
      });
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('editLanguage', () => {
    it('should edit a language successfully', async () => {
      const editDto = {
        language: 'English Updated',
        code: 'en',
        status: 0,
        type: 0,
      };
      const languageId = 1;

      mockTransaction.table.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValueOnce({ id: languageId }),
        update: jest.fn().mockResolvedValueOnce([1]),
      });

      mockDbService.connection.transaction.mockResolvedValueOnce(
        mockTransaction
      );

      const result = await service.editLanguage(languageId, editDto);

      expect(result).toEqual({
        error: false,
        message: expect.any(String),
        data: expect.objectContaining({ id: languageId }),
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  describe('getAllLanguages', () => {
    it('should return languages with pagination', async () => {
      const query = {
        limit: 10,
        offset: 0,
        search: 'eng',
        sortBy: 'id',
        order: 'DESC',
        status: 1,
        type: 1,
      };

      const mockLanguages = [
        { id: 1, language: 'English', code: 'en', status: 1, type: 1 },
      ];

      const mockQueryChain = {
        where: jest.fn().mockReturnThis(),
        whereIn: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
      };

      mockQueryChain.select.mockResolvedValueOnce(mockLanguages);
      mockDbService.connection.table.mockReturnValue(mockQueryChain);
      mockDbService.connection.raw.mockReturnValue([{ total: 1 }]);

      const result = await service.getAllLanguages(query);

      expect(result).toEqual({
        error: false,
        data: {
          languages: mockLanguages,
          total: 1,
        },
      });
    });
  });

  describe('deleteLanguages', () => {
    it('should delete languages and related data successfully', async () => {
      const ids = [1, 2];
      const mockCategories = [{ id: 1 }, { id: 2 }];

      // Setup proper transaction chain
      const mockTrxChain = {
        whereIn: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValueOnce(mockCategories),
        del: jest.fn().mockResolvedValueOnce(2),
      };

      mockTransaction.table.mockReturnValue(mockTrxChain);

      const result = await service.deleteLanguages(ids);

      expect(result).toEqual({
        error: false,
        message: expect.stringContaining('Deleted'),
        data: expect.objectContaining({
          deleted: expect.any(Array),
          missing: expect.any(Array),
        }),
      });
      expect(categoryService.deleteCategories).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });
});
