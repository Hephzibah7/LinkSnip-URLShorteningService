import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Modal } from '../common/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { Download, Copy, Check, QrCode } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  title,
}) => {
  const { success, error: toastError } = useToast();
  const [dataUrl, setDataUrl] = useState<string>('');
  const [svgString, setSvgString] = useState<string>('');
  const [darkColor, setDarkColor] = useState<string>('#09090b');
  const [lightColor, setLightColor] = useState<string>('#ffffff');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && url) {
      generateQr();
    }
  }, [isOpen, url, darkColor, lightColor]);

  const generateQr = async () => {
    try {
      const pngUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: { dark: darkColor, light: lightColor },
        errorCorrectionLevel: 'H',
      });
      setDataUrl(pngUrl);

      const svg = await QRCode.toString(url, {
        type: 'svg',
        width: 400,
        margin: 2,
        color: { dark: darkColor, light: lightColor },
        errorCorrectionLevel: 'H',
      });
      setSvgString(svg);
    } catch (err) {
      console.error('QR generation error:', err);
    }
  };

  const handleDownloadPng = () => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `linksnip_qr_${title ? title.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'code'}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    success('QR Code PNG downloaded!');
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `linksnip_qr_${title ? title.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'code'}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    success('QR Code SVG downloaded!');
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      success('Short URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toastError('Failed to copy');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code Generator" maxWidth="480px">
      <div style={{ textAlign: 'center' }}>
        {/* QR Preview Box */}
        <div
          style={{
            background: lightColor,
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            display: 'inline-block',
            marginBottom: '16px',
          }}
        >
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="QR Code"
              style={{ width: '220px', height: '220px', display: 'block', borderRadius: '4px' }}
            />
          ) : (
            <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={48} className="animate-spin" />
            </div>
          )}
        </div>

        {/* URL display and copy button */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {url}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={handleCopyUrl} style={{ padding: '4px 8px' }}>
            {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
          </button>
        </div>

        {/* Color presets & Customizer */}
        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          <label className="form-label" style={{ fontSize: '0.84rem' }}>Color Customization</label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <input
                type="color"
                value={darkColor}
                onChange={(e) => setDarkColor(e.target.value)}
                style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>QR Color</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <input
                type="color"
                value={lightColor}
                onChange={(e) => setLightColor(e.target.value)}
                style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Background</span>
            </div>
          </div>
        </div>

        {/* Download Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button className="btn btn-primary" onClick={handleDownloadPng}>
            <Download size={16} /> Download PNG
          </button>
          <button className="btn btn-secondary" onClick={handleDownloadSvg}>
            <Download size={16} /> Download SVG
          </button>
        </div>
      </div>
    </Modal>
  );
};
