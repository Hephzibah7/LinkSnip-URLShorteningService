import React from 'react';
import { ClickEventItem } from '../../types/index.js';
import { Monitor, Smartphone, Tablet, Bot } from 'lucide-react';

interface ClickLogsTableProps {
  logs: ClickEventItem[];
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export const ClickLogsTable: React.FC<ClickLogsTableProps> = ({
  logs,
  page,
  totalPages,
  onPageChange,
}) => {
  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'Mobile':
        return <Smartphone size={14} />;
      case 'Tablet':
        return <Tablet size={14} />;
      case 'Bot':
        return <Bot size={14} />;
      default:
        return <Monitor size={14} />;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Real-Time Click Stream</h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Detailed log of visitors and redirection requests
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Location</th>
              <th>Referrer</th>
              <th>Platform & Device</th>
              <th>Browser</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No click events logged yet
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.84rem', fontFamily: 'var(--font-mono)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{log.country || 'Unknown'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{log.city || 'Unknown City'}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.referrerDomain || 'Direct'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getDeviceIcon(log.deviceType)}
                      <span style={{ fontSize: '0.86rem' }}>{log.os || 'Unknown OS'}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    {log.browser || 'Unknown'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {log.ipAddress || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
