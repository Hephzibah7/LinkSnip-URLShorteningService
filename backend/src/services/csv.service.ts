import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export interface BulkLinkCsvRow {
  url: string;
  title?: string;
  customAlias?: string;
  tags?: string; // Comma-separated tag names
  expiresAt?: string; // ISO date string
  maxClicks?: string | number;
}

export interface ParsedCsvResult {
  validRows: BulkLinkCsvRow[];
  invalidRows: { row: number; data: any; reason: string }[];
  totalRows: number;
}

export class CsvService {
  /**
   * Parses CSV buffer or string for bulk link creation
   */
  parseBulkCsv(content: Buffer | string): ParsedCsvResult {
    const rawRecords: any[] = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const validRows: BulkLinkCsvRow[] = [];
    const invalidRows: { row: number; data: any; reason: string }[] = [];

    rawRecords.forEach((record, index) => {
      const rowNumber = index + 2; // Header is row 1
      const url = record.url || record.URL || record.originalUrl || record.destination;

      if (!url) {
        invalidRows.push({ row: rowNumber, data: record, reason: 'Missing URL column' });
        return;
      }

      try {
        new URL(url); // Validate URL format
      } catch {
        invalidRows.push({ row: rowNumber, data: record, reason: `Invalid URL format: "${url}"` });
        return;
      }

      validRows.push({
        url: url.trim(),
        title: record.title || record.Title || undefined,
        customAlias: record.customAlias || record.alias || record.Alias || undefined,
        tags: record.tags || record.Tags || undefined,
        expiresAt: record.expiresAt || record.ExpiresAt || undefined,
        maxClicks: record.maxClicks || record.MaxClicks || undefined,
      });
    });

    return {
      validRows,
      invalidRows,
      totalRows: rawRecords.length,
    };
  }

  /**
   * Generates a CSV string from click event records for export
   */
  exportAnalyticsToCsv(clickEvents: any[]): string {
    const records = clickEvents.map((event) => ({
      Timestamp: event.timestamp ? new Date(event.timestamp).toISOString() : '',
      IP_Address: event.ipAddress || 'Unknown',
      Country: event.country || 'Unknown',
      Country_Code: event.countryCode || 'XX',
      City: event.city || 'Unknown',
      Referrer_Domain: event.referrerDomain || 'Direct',
      Referrer_URL: event.referrer || '',
      Device_Type: event.deviceType || 'Desktop',
      Operating_System: event.os || 'Unknown',
      Browser: event.browser || 'Unknown',
      Is_Bot: event.isBot ? 'Yes' : 'No',
    }));

    return stringify(records, { header: true });
  }

  /**
   * Generates a CSV template for bulk link uploads
   */
  getBulkTemplateCsv(): string {
    const templateData = [
      {
        url: 'https://example.com/summer-sale',
        title: 'Summer Sale 2026',
        customAlias: 'summer-sale',
        tags: 'Marketing,Campaign',
        expiresAt: '2026-12-31T23:59:59Z',
        maxClicks: '1000',
      },
      {
        url: 'https://docs.github.com/en/get-started',
        title: 'GitHub Quickstart Guide',
        customAlias: '',
        tags: 'Tech,Docs',
        expiresAt: '',
        maxClicks: '',
      },
    ];

    return stringify(templateData, { header: true });
  }
}

export const csvService = new CsvService();
