import React from 'react';
import { MapPin } from 'lucide-react';

interface GeoBreakdownProps {
  countries: { country: string; code: string; count: number; percentage: number }[];
  cities: { city: string; country: string; count: number }[];
}

export const GeoBreakdown: React.FC<GeoBreakdownProps> = ({ countries, cities }) => {
  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} /> Geographic Distribution
        </h3>
      </div>

      {countries.length === 0 ? (
        <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          No geographic data recorded
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {countries.slice(0, 5).map((item, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.86rem' }}>
                  <span style={{ fontWeight: 600 }}>{item.country}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.percentage}%`,
                      background: '#3f3f46',
                      borderRadius: '999px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {cities.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Top Cities
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {cities.slice(0, 8).map((city, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '4px 10px',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {city.city} ({city.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
