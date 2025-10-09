import { Test, TestingModule } from '@nestjs/testing';
import { LanguageService } from './language.service';
import { DatabaseService } from '../../core/database/database.service';
import { CategoryService } from '../category/category.service';
import { Logger } from '@nestjs/common';

describe('LanguageService', () => {
  let service: LanguageService;
  let dbService: DatabaseService;
  let categoryService: CategoryService;

  const mockDbService = {
    connection: {
      transaction: jest.fn(),
      table: jest.fn(),
      raw: jest.fn((sql) => sql),
    },
  };

  const mockCategoryService = {
    deleteCategories: jest.fn(),
  };

  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
    table: jest.fn(),
  };

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLanguage', () => {
    it('should create a language successfully', async () => {
      const createDto = {
        language: 'English',
        code: 'en',
        status: 1,
        type: 1,
      };

      mockTransaction.table.mockReturnValue({
        insert: jest.fn().mockResolvedValueOnce([1]),
        where: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValueOnce({ id: 1, ...createDto }),
        }),
      });

      mockDbService.connection.transaction.mockResolvedValueOnce(
        mockTransaction
      );

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

      mockDbService.connection.table.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        whereIn: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        count: jest.fn().mockResolvedValueOnce([{ total: 1 }]),
        select: jest.fn().mockResolvedValueOnce(mockLanguages),
      });

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

      mockTransaction.table.mockReturnValue({
        whereIn: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValueOnce(mockCategories),
        del: jest.fn().mockResolvedValueOnce(2),
      });

      mockDbService.connection.transaction.mockResolvedValueOnce(
        mockTransaction
      );

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
