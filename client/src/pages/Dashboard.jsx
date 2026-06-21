import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { Activity, AlertTriangle, Clock, Layers } from 'lucide-react';
import * as api from '../api/client';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatNumber, formatLatency, formatPercentage, formatTimeBucket } from '../utils/formatters';
import { TIME_RANGES } from '../utils/constants';

const CHART_COLORS = {
  primary: 'hsl(245, 80%, 65%)',
  secondary: 'hsl(275, 75%, 65%)',
  success: 'hsl(152, 68%, 52%)',
  danger: 'hsl(0, 78%, 62%)',
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

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('24h');

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const range = TIME_RANGES.find(r => r.value === timeRange);
      const startTime = Date.now() - (range?.ms || 24 * 60 * 60 * 1000);
      const res = await api.getDashboard({ startTime, endTime: Date.now() });
      if (res.success) setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const stats = data?.stats;
  const topEndpoints = data?.topEndpoints || [];
  const recentActivity = (data?.recentActitivy || []).map(item => ({
    ...item,
    time: formatTimeBucket(item.timeBucket),
  }));

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Real-time overview of your API performance</p>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-secondary p-1 border border-border rounded-lg">
          {TIME_RANGES.slice(0, 4).map((range) => (
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
        <div className="flex items-center gap-2.5 p-3.5 mb-6 text-sm rounded-lg border bg-danger/10 border-danger/20 text-danger">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Stat Cards */}
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
          subtitle="Response time"
        />
        <StatCard
          icon={<Layers size={20} />}
          label="Endpoints"
          value={loading ? '—' : formatNumber(stats?.uniqueEndpoints)}
          subtitle={`${formatNumber(stats?.uniqueServices || 0)} services`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Endpoints */}
        <div className="bg-surface-card border border-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <h3 className="font-semibold text-text-primary">Top Endpoints</h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : topEndpoints.length === 0 ? (
            <div className="text-center py-10 text-text-secondary">
              No endpoint data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topEndpoints} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
                <XAxis type="number" tick={{ fill: CHART_COLORS.text, fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="endpoint"
                  width={140}
                  tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                  tickFormatter={(v) => v.length > 20 ? v.slice(0, 20) + '…' : v}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalHits" name="Hits" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                <Bar dataKey="errorHits" name="Errors" fill={CHART_COLORS.danger} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-surface-card border border-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <h3 className="font-semibold text-text-primary">Recent Activity</h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-10 text-text-secondary">
              No recent activity data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={recentActivity} margin={{ left: 0, right: 20 }}>
                <defs>
                  <linearGradient id="hitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.danger} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={CHART_COLORS.danger} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="time" tick={{ fill: CHART_COLORS.text, fontSize: 12 }} />
                <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="totalHits"
                  name="Hits"
                  stroke={CHART_COLORS.primary}
                  fill="url(#hitGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="errorHits"
                  name="Errors"
                  stroke={CHART_COLORS.danger}
                  fill="url(#errorGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
