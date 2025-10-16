import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { QUERY_OPERATOR } from 'src/modules/shared/constants'

const filterDescription = `
- Filter equal: filters=[{field: "User.name", operator: "eq", data: "Enosta"}]
- Filter not equal: filters=[{field: "User.name", operator: "neq", data: "Enosta"}]
- Filter less than: filters=[{field: "User.age", operator: "lt", data: "40"}]
- Filter greater than: filters=[{field: "User.age", operator: "gt", data: "40"}]
- Filter less than and equal: filters=[{field: "User.age", operator: "lte", data: "40"}]
- Filter greater than and equal: filters=[{field: "User.age", operator: "gte", data: "40"}]
- Filter field in many choices: filters=[{field: "User.name", operator: "in", data: "EnouvoSpace,Enosta"}]
- Filter field not in many choices: filters=[{field: "User.name", operator: "nin", data: "EnouvoSpace,Enosta"}]
- Filter field by text: filters=[{field: "User.name", operator: "like", data: "Enosta"}]
- Filter array field with multiple selections: filters=[{field: "User.category", operator: "overlapArr", data: "IT,MARKETING"}]`

const paginationDescription = `
- Paginate with limit and page. Example: limit=10&page=1
`

const orderByDescription = `
- Order by fields. Use DESC for descending order. Example: orderBy="User.createdAt:DESC"
- Use NULLS_FIRST or NULLS_LAST to determine null value sorting. Example: orderBy="User.createdAt:DESC:NULLS_FIRST"
`

export class FilterDto {
  @ApiProperty({ description: 'Field to filter', example: 'User.name' })
  @IsString()
  field: string

  @ApiProperty({ description: 'Filter operator', enum: QUERY_OPERATOR, example: QUERY_OPERATOR.eq })
  @IsEnum(QUERY_OPERATOR)
  operator: QUERY_OPERATOR

  @ApiProperty({ description: 'Value to filter', example: 'Enosta', required: false })
  @IsOptional()
  @IsString()
  data?: string
}

export class QueryFilterDto {
  @ApiProperty({ default: 1, description: paginationDescription })
  @IsNumber()
  @Type(() => Number)
  page: number = 1

  @ApiProperty({ default: 10, description: paginationDescription })
  @IsNumber()
  @Type(() => Number)
  limit: number = 10

  @ApiProperty({ description: orderByDescription, required: false, example: 'User.createdAt:DESC' })
  @IsOptional()
  @IsString()
  orderBy?: string

  @ApiProperty({ description: 'General search query', required: false, example: 'abcxyz' })
  @IsOptional()
  @IsString()
  q?: string

  @ApiProperty({ description: 'List of filters', type: [FilterDto], required: false, example: [{ field: "User.name", operator: "eq", data: "Enosta" }] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  filters?: FilterDto[]

  @ApiProperty({ description: 'List of relations to include', type: [String], required: false, example: ['User.profile', 'User.posts'] })
  @IsOptional()
  relations?: string[]
}
