import { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, AlertTriangle } from 'lucide-react';
import * as api from '../api/client';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatNumber, formatLatency, formatPercentage, formatTimeBucket } from '../utils/formatters';
import { TIME_RANGES } from '../utils/constants';
import { Activity, Clock, Layers } from 'lucide-react';

const CHART_COLORS = {
  primary: 'hsl(245, 80%, 65%)',
  secondary: 'hsl(275, 75%, 65%)',
  success: 'hsl(152, 68%, 52%)',
  danger: 'hsl(0, 78%, 62%)',
  warning: 'hsl(38, 92%, 60%)',
  grid: 'hsl(225, 15%, 20%)',
  text: 'hsl(220, 15%, 65%)',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-card border border-border rounded-lg p-3 text-sm shadow-xl">
      <div className="text-text-secondary mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 font-medium" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('24h');
  const [dashData, setDashData] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const range = TIME_RANGES.find(r => r.value === timeRange);
      const startTime = Date.now() - (range?.ms || 24 * 60 * 60 * 1000);
      const params = { startTime, endTime: Date.now() };

      const [statsRes, dashRes] = await Promise.allSettled([
        api.getStats(params),
        api.getDashboard(params),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data);
      }
      if (dashRes.status === 'fulfilled' && dashRes.value.success) {
        setDashData(dashRes.value.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const timeSeries = (dashData?.recentActitivy || []).map(item => ({
    ...item,
    time: formatTimeBucket(item.timeBucket),
    avgLatencyNum: parseFloat(item.avgLatency),
  }));

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Analytics</h1>
          <p className="text-sm text-text-secondary mt-1">Detailed metrics and time series analysis</p>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-secondary p-1 border border-border rounded-lg">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer focus:outline-none ${
                timeRange === range.value
                  ? 'accent-gradient text-white accent-glow'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 mb-6 text-sm rounded-lg border bg-danger/10 border-danger/20 text-danger animate-fade-in">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          icon={<Activity size={20} />}
          label="Total Hits"
          value={loading ? '—' : formatNumber(stats?.totalHits)}
          subtitle={`${formatNumber(stats?.successHits || 0)} successful`}
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Error Rate"
          value={loading ? '—' : formatPercentage(stats?.errorRate)}
          subtitle={`${formatNumber(stats?.errorHits || 0)} errors`}
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Avg Latency"
          value={loading ? '—' : formatLatency(stats?.avgLatency)}
        />
        <StatCard
          icon={<Layers size={20} />}
          label="Services"
          value={loading ? '—' : formatNumber(stats?.uniqueServices)}
          subtitle={`${formatNumber(stats?.uniqueEndpoints || 0)} endpoints`}
        />
      </div>

      {/* Time Series — Hits & Errors */}
      <div className="bg-surface-card border border-border rounded-xl p-5 shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <h3 className="font-semibold text-text-primary">Hits & Errors Over Time</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : timeSeries.length === 0 ? (
          <div className="text-center py-10 text-text-secondary">
            No time series data for selected range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={timeSeries} margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="time" tick={{ fill: CHART_COLORS.text, fontSize: 12 }} />
              <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalHits"
                name="Total Hits"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: CHART_COLORS.primary }}
              />
              <Line
                type="monotone"
                dataKey="errorHits"
                name="Errors"
                stroke={CHART_COLORS.danger}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: CHART_COLORS.danger }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Latency Chart */}
      <div className="bg-surface-card border border-border rounded-xl p-5 shadow-lg mb-8">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <h3 className="font-semibold text-text-primary">Latency Over Time</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : timeSeries.length === 0 ? (
          <div className="text-center py-10 text-text-secondary">
            No latency data for selected range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeries} margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="time" tick={{ fill: CHART_COLORS.text, fontSize: 12 }} />
              <YAxis
                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                tickFormatter={(v) => `${v}ms`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgLatencyNum"
                name="Avg Latency (ms)"
                stroke={CHART_COLORS.warning}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: CHART_COLORS.warning }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
