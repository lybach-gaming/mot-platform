import { Brackets, Repository, SelectQueryBuilder } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { forEach, isArray } from 'lodash'
import { CustomBaseEntity } from './base-entity'
import { FilterDto, QueryFilterDto } from './dto/request'
import { QUERY_OPERATOR } from '../constants'
import { capitalizeFirstLetter } from '../utils'

@Injectable()
export class BaseQueryFilter<E extends CustomBaseEntity> {
  private queryBuilder!: SelectQueryBuilder<E>

  constructor(
    @InjectRepository(CustomBaseEntity)
    private readonly repository: Repository<E>
  ) { }

  static attachFilters(sourceFilter: QueryFilterDto, filters: FilterDto[]) {
    if (isArray(sourceFilter.filters)) {
      sourceFilter.filters = sourceFilter.filters?.concat(filters)
    } else {
      sourceFilter.filters = filters
    }
    return sourceFilter
  }

  private filterBuilder(filters: FilterDto[]) {
    filters.forEach((value, index) => {
      const data = value.data
      const key = `${value.operator}${index}`

      switch (value.operator) {
        case QUERY_OPERATOR.in:
        case QUERY_OPERATOR.nin:
          this.queryBuilder.andWhere(
            new Brackets(qb => qb.where(`${value.field} ${value.operator === QUERY_OPERATOR.in ? 'IN' : 'NOT IN'} (:...${key})`, { [key]: data?.split(',') }))
          )
          break
        case QUERY_OPERATOR.eq:
          this.queryBuilder.andWhere(
            new Brackets(qb => qb.where(`${value.field} = :${key}`, { [key]: data }))
          )
          break
        case QUERY_OPERATOR.neq:
          this.queryBuilder.andWhere(
            new Brackets(qb => qb.where(`${value.field} != :${key}`, { [key]: data }))
          )
          break
        case QUERY_OPERATOR.lt:
          this.queryBuilder.andWhere(
            new Brackets(qb => qb.where(`${value.field} < :${key}`, { [key]: data }))
          )
          break
        case QUERY_OPERATOR.lte:
          this.queryBuilder.andWhere(
            new Brackets(qb => qb.where(`${value.field} <= :${key}`, { [key]: data }))
          )
          break
        case QUERY_OPERATOR.gt:
          this.queryBuilder.andWhere(
            new Brackets(qb => qb.where(`${value.field} > :${key}`, { [key]: data }))
          )
          break
        case QUERY_OPERATOR.gte:
          this.queryBuilder.andWhere(
            new Brackets(qb => qb.where(`${value.field} >= :${key}`, { [key]: data }))
          )
          break
        case QUERY_OPERATOR.like:
          this.queryBuilder.andWhere(
            new Brackets(qb => qb.where(`CAST(${value.field} AS Text) ILIKE :${key}`, { [key]: `%${data}%` }))
          )
          break
        case QUERY_OPERATOR.ilike:
          this.queryBuilder.andWhere(
            new Brackets(qb => qb.where(`CAST(${value.field} AS Text) ILIKE :${key}`, { [key]: `${data}` }))
          )
          break
        case QUERY_OPERATOR.isNull:
          this.queryBuilder.andWhere(`${value.field} IS NULL`)
          break
        case QUERY_OPERATOR.isNotNull:
          this.queryBuilder.andWhere(`${value.field} IS NOT NULL`)
          break
        case QUERY_OPERATOR.unaccentLike:
          this.queryBuilder.andWhere(
            new Brackets(qb => qb.where(`UNACCENT(CAST(${value.field} AS Text)) ILIKE UNACCENT(:${key})`, { [key]: `%${data}%` }))
          )
          break
        case QUERY_OPERATOR.overlapArr:
          this.queryBuilder.andWhere(
            new Brackets(qb => qb.where(`(${value.field})::varchar[] && ARRAY[:...${key}]::varchar[]`, { [key]: data?.split(',') }))
          )
          break
        case QUERY_OPERATOR.lowerLike:
          this.queryBuilder.andWhere(
            new Brackets(qb => qb.where(`LOWER(CAST(${value.field} AS Text)) ILIKE LOWER(:${key})`, { [key]: `%${data}%` }))
          )
          break
      }
    })
  }


  private orderByBuilder(orderBy: string) {
    if (!orderBy) return;
    const [field, sortBy = 'ASC', nulls] = orderBy.split(':');

    if (['ASC', 'DESC'].includes(sortBy.toUpperCase())) {
      const nullsOrder = ['NULLS FIRST', 'NULLS LAST'].includes(nulls?.replace('_', ' ').toUpperCase())
        ? (nulls.replace('_', ' ').toUpperCase() as 'NULLS FIRST' | 'NULLS LAST')
        : undefined;

      this.queryBuilder.orderBy(field, sortBy.toUpperCase() as 'ASC' | 'DESC', nullsOrder);
    }
  }

  private joinBuilder(relations: string[]) {
    const joinedRelations = new Set<string>(); // Track joined paths

    forEach(relations, (expression: string) => {
      const parts = expression.split('.'); // Handle nested joins
      let path = this.queryBuilder.alias; // Start from root alias
      let alias = '';

      for (const part of parts) {
        alias = capitalizeFirstLetter(part); // Keep alias simple (e.g., "referral" or "user")
        const joinPath = `${path}.${part}`; // Full join path

        // Ensure we don’t duplicate joins
        if (!joinedRelations.has(joinPath) &&
          !this.queryBuilder.expressionMap.joinAttributes.some(j => j.relationPropertyPath === joinPath)) {
          this.queryBuilder.leftJoinAndSelect(joinPath, alias);
          joinedRelations.add(joinPath); // Mark as joined
        }

        path = alias; // Move deeper for nested joins
      }
    });
  }


  public applyFilters(queryParams: QueryFilterDto): SelectQueryBuilder<E> {
    this.queryBuilder = this.repository.createQueryBuilder('entity')

    if (queryParams.relations) {
      this.joinBuilder(queryParams.relations)
    }
    if (queryParams.filters) {
      this.filterBuilder(queryParams.filters)
    }
    if (queryParams.orderBy) {
      this.orderByBuilder(queryParams.orderBy)
    }

    return this.queryBuilder
  }
}
