import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { QueryFilterDto } from './dto/request';
import { BaseQueryFilter } from './base-query-filter';
import { PaginationDto } from '../dto/pagination';
import { CustomBaseEntity } from './base-entity';

export abstract class BaseService<T extends CustomBaseEntity> {
  protected queryFilter: BaseQueryFilter<T>;

  protected constructor(protected readonly repository: Repository<T>) {
    this.queryFilter = new BaseQueryFilter<T>(repository);
  }

  async create(entity: T): Promise<T> {
    if (await this.isExist(entity)) {
      throw new BadRequestException('Record already exists');
    }
    return await this.repository.save(entity);
  }

  async findWithQueryBuilder<K>(
    queryParams: Partial<QueryFilterDto>,
    mapperFn: (entity: T) => Promise<K>,
    withPagination = true,
    fetchInRaw = false
  ): Promise<PaginationDto<K> | K[]> {
    const queryBuilder = this.queryFilter.applyFilters(queryParams as QueryFilterDto);

    let total = 0;

    // Get total count before applying pagination
    if (withPagination) {
      total = await queryBuilder.getCount();
    }

    // Apply pagination
    if (withPagination && queryParams.page && queryParams.limit) {
      const { page, limit } = queryParams;
      if (!fetchInRaw) {
        queryBuilder.skip((page - 1) * limit).take(limit);
      }
    }
    let results;
    if (!fetchInRaw) {
      results = await queryBuilder.getMany();
    } else {
      if (withPagination && queryParams.page && queryParams.limit) {
        results = await queryBuilder.limit(queryParams.limit).offset((queryParams.page - 1) * queryParams.limit).getRawMany();
      } else {
        results = await queryBuilder.getRawMany();
      }
    }
    // Use an arrow function to bind 'this' to the method
    const mappedResults = await Promise.all(
      results.map(entity => mapperFn.call(this, entity))  // Ensures 'this' is correctly bound to the service class
    );

    // Return paginated results
    return withPagination
      ? new PaginationDto(mappedResults, total, queryParams.page, queryParams.limit)
      : mappedResults;
  }

  async isExist(conditions: Partial<T>): Promise<boolean> {
    return !!(await this.repository.findOne({ where: conditions as FindOptionsWhere<T> }));
  }

  async findOne(options: FindOneOptions<T>): Promise<T> {
    const record = await this.repository.findOne(options);
    if (!record) {
      throw new NotFoundException('Record not found');
    }
    return record;
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async update(id: string, entity: QueryDeepPartialEntity<T>, options?: FindOneOptions<T>): Promise<T> {
    const existing = await this.findOne({ where: { id } as unknown as FindOptionsWhere<T>, ...options });

    Object.assign(existing, entity);
    return await this.repository.save(existing);
  }

  async delete(id: string): Promise<void> {
    await this.findOne({ where: { id } as FindOptionsWhere<T> });
    await this.repository.delete(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.findOne({ where: { id } as FindOptionsWhere<T> });
    await this.repository.softDelete(id);
  }


  async restore(id: string): Promise<void> {
    const record = await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      withDeleted: true
    });
    if (!record) {
      throw new NotFoundException('Record not found');
    }
    await this.repository.restore(id);
  }

}
