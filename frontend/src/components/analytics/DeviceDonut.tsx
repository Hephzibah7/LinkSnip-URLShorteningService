import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Smartphone, Monitor, Tablet } from 'lucide-react';

interface DeviceDonutProps {
  devices: { device: string; count: number; percentage: number }[];
  osList: { os: string; count: number; percentage: number }[];
  browsers: { browser: string; count: number; percentage: number }[];
}

const MONO_COLORS = ['#09090b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8'];

export const DeviceDonut: React.FC<DeviceDonutProps> = ({
  devices,
  osList,
  browsers,
}) => {
  const [tab, setTab] = useState<'device' | 'os' | 'browser'>('device');

  const currentData = tab === 'device' ? devices : tab === 'os' ? osList : browsers;

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <h3 className="card-title">Platforms & Devices</h3>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className={`btn btn-sm ${tab === 'device' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('device')}
          >
            Device
          </button>
          <button
            className={`btn btn-sm ${tab === 'os' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('os')}
          >
            OS
          </button>
          <button
            className={`btn btn-sm ${tab === 'browser' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('browser')}
          >
            Browser
          </button>
        </div>
      </div>

      {currentData.length === 0 ? (
        <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          No platform data recorded
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentData}
                  dataKey="count"
                  nameKey={tab === 'device' ? 'device' : tab === 'os' ? 'os' : 'browser'}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {currentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={MONO_COLORS[index % MONO_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} clicks`, name]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentData.slice(0, 5).map((item: any, idx) => {
              const label = item.device || item.os || item.browser;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        backgroundColor: MONO_COLORS[idx % MONO_COLORS.length],
                      }}
                    />
                    <span style={{ fontWeight: 600 }}>{label}</span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
