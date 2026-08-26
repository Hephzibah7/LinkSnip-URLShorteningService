import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export class QrService {
  /**
   * Generates a Data URL (PNG format) for a given URL or text
   */
  async generateDataUrl(url: string, options?: QRCodeOptions): Promise<string> {
    const opts = {
      width: options?.width || 320,
      margin: options?.margin || 2,
      color: {
        dark: options?.color?.dark || '#09090b', // Sleek black/gray theme default
        light: options?.color?.light || '#ffffff',
      },
      errorCorrectionLevel: 'M' as const,
    };
    return QRCode.toDataURL(url, opts);
  }

  /**
   * Generates an SVG string for a given URL or text
   */
  async generateSvg(url: string, options?: QRCodeOptions): Promise<string> {
    const opts = {
      width: options?.width || 320,
      margin: options?.margin || 2,
      color: {
        dark: options?.color?.dark || '#09090b',
        light: options?.color?.light || '#ffffff',
      },
      errorCorrectionLevel: 'M' as const,
    };
    return QRCode.toString(url, { ...opts, type: 'svg' });
  }
}

export const qrService = new QrService();
