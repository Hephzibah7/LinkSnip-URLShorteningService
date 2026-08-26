import React from 'react';
import { Globe, Share2, Compass } from 'lucide-react';

interface ReferrersListProps {
  referrers: { referrer: string; count: number; percentage: number }[];
}

export const ReferrersList: React.FC<ReferrersListProps> = ({ referrers }) => {
  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} /> Top Traffic Referrers
        </h3>
      </div>

      {referrers.length === 0 ? (
        <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          No referrer data available
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {referrers.map((item, index) => (
            <div key={index}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {item.referrer === 'Direct' ? <Share2 size={13} /> : <Globe size={13} />}
                  {item.referrer}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong>{item.count}</strong> clicks ({item.percentage}%)
                </span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${item.percentage}%`,
                    background: '#18181b',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
