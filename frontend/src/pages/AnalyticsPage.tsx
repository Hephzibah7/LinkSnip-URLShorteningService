import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api/analytics.api.js';
import { useToast } from '../context/ToastContext.js';
import { AnalyticsData } from '../types/index.js';
import { ClicksChart } from '../components/analytics/ClicksChart.js';
import { ReferrersList } from '../components/analytics/ReferrersList.js';
import { GeoBreakdown } from '../components/analytics/GeoBreakdown.js';
import { DeviceDonut } from '../components/analytics/DeviceDonut.js';
import { MousePointerClick, Globe, Layers, Activity, RefreshCw } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { error: toastError } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getUserOverview();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to load analytics overview');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px' }} />
        <div>Aggregating cross-link analytics...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Account Analytics Overview</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Aggregated performance, engagement patterns, and traffic distribution across all your links
        </p>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box">
            <MousePointerClick size={22} />
          </div>
          <div>
            <div className="metric-value">{data?.totalClicks || 0}</div>
            <div className="metric-label">Total Clicks Across Links</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box">
            <Activity size={22} />
          </div>
          <div>
            <div className="metric-value">{data?.activeLinks || 0}</div>
            <div className="metric-label">Active Links</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box">
            <Globe size={22} />
          </div>
          <div>
            <div className="metric-value">{data?.topCountries?.length || 0}</div>
            <div className="metric-label">Global Geographies</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box">
            <Layers size={22} />
          </div>
          <div>
            <div className="metric-value">{data?.topReferrers?.length || 0}</div>
            <div className="metric-label">Traffic Referrers</div>
          </div>
        </div>
      </div>

      {/* Account Clicks Over Time */}
      <ClicksChart data={data?.clicksOverTime || []} totalClicks={data?.totalClicks} />

      {/* Breakdown Triad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <ReferrersList referrers={data?.topReferrers || []} />
        <GeoBreakdown countries={data?.topCountries || []} cities={data?.topCities || []} />
        <DeviceDonut
          devices={data?.deviceBreakdown || []}
          osList={data?.osBreakdown || []}
          browsers={data?.browserBreakdown || []}
        />
      </div>
    </div>
  );
};
