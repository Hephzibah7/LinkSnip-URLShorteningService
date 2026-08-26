import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ClicksChartProps {
  data: { date: string; clicks: number }[];
  totalClicks?: number;
}

export const ClicksChart: React.FC<ClicksChartProps> = ({ data, totalClicks }) => {
  const [range, setRange] = useState<'7' | '14' | '30' | 'all'>('14');

  // Filter data based on selected range
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    if (range === 'all') return data;
    const days = parseInt(range, 10);
    return data.slice(-days);
  }, [data, range]);

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">Clicks Over Time</h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Historical engagement trends and traffic volume
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {(['7', '14', '30', 'all'] as const).map((r) => (
            <button
              key={r}
              className={`btn btn-sm ${range === r ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setRange(r)}
            >
              {r === 'all' ? 'All Time' : `${r}D`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#09090b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#09090b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e4e4e7' }}
                tickFormatter={(val) => {
                  const parts = val.split('-');
                  return `${parts[1]}/${parts[2]}`;
                }}
              />
              <YAxis
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [`${value} clicks`, 'Clicks']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#09090b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#clickGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            No click data recorded yet
          </div>
        )}
      </div>
    </div>
  );
};
