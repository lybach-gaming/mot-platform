import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversionEntity, ClickEntity, ImpressionEntity, CampaignEntity } from '../entities';
import { DateRangeService } from './date-range.service';
import { TimePeriod } from '../types/period.types';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(ConversionEntity)
    private conversionRepo: Repository<ConversionEntity>,
    @InjectRepository(ClickEntity)
    private clickRepo: Repository<ClickEntity>,
    @InjectRepository(ImpressionEntity)
    private impressionRepo: Repository<ImpressionEntity>,
    @InjectRepository(CampaignEntity)
    private campaignRepo: Repository<CampaignEntity>,
    private dateRangeService: DateRangeService
  ) {}

  async exportToCSV(
    projectId: number,
    period: TimePeriod,
    fields: string[],
    customFrom?: Date,
    customTo?: Date
  ): Promise<string> {
    const range = this.dateRangeService.getPeriodRange(period, customFrom, customTo);
    const { startDate, endDate } = range;

    const data = await this.fetchDataForExport(projectId, startDate, endDate, fields);

    return this.convertToCSV(data, fields);
  }

  private async fetchDataForExport(
    projectId: number,
    startDate: Date,
    endDate: Date,
    fields: string[]
  ): Promise<Record<string, any>[]> {
    const conversions = await this.conversionRepo
      .createQueryBuilder('conv')
      .leftJoinAndSelect('conv.affiliate', 'affiliate')
      .leftJoinAndSelect('conv.campaign', 'campaign')
      .leftJoinAndSelect('conv.user', 'user')
      .where('conv.project_id = :projectId', { projectId })
      .andWhere('conv.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('conv.created_at', 'DESC')
      .getMany();

    return conversions.map(conv => ({
      date: conv.createdAt.toISOString().split('T')[0],
      affiliateId: conv.affiliateId,
      campaignId: conv.campaignId,
      campaignName: conv.campaign?.name || 'N/A',
      userId: conv.userId,
      orderValue: conv.orderValue,
      commissionRate: conv.commissionRate,
      commissionAmount: conv.commissionAmount,
      country: conv.country || 'N/A'
    }));
  }

  private convertToCSV(data: Record<string, any>[], fields: string[]): string {
    if (data.length === 0) {
      return fields.join(',') + '\n';
    }

    const headers = fields.map(field => this.formatHeader(field)).join(',');

    const rows = data.map(row => {
      return fields.map(field => {
        const value = row[field];
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    return headers + '\n' + rows.join('\n');
  }

  private formatHeader(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
