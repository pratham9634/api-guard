import { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, AlertTriangle, Activity, Clock, Layers, Key, Terminal, ShieldAlert, List, Building2 } from 'lucide-react';
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
  const [reports, setReports] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const range = TIME_RANGES.find(r => r.value === timeRange);
      const startTime = Date.now() - (range?.ms || 24 * 60 * 60 * 1000);
      const params = { startTime, endTime: Date.now() };

      const [statsRes, dashRes, reportsRes] = await Promise.allSettled([
        api.getStats(params),
        api.getDashboard(params),
        api.getReports(params),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data);
      }
      if (dashRes.status === 'fulfilled' && dashRes.value.success) {
        setDashData(dashRes.value.data);
      }
      if (reportsRes.status === 'fulfilled' && reportsRes.value.success) {
        setReports(reportsRes.value.data);
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
      <div className="bg-surface-card border border-border rounded-xl p-5 shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <h3 className="font-semibold text-text-primary">Latency Over Time (Average)</h3>
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
          <ResponsiveContainer width="100%" height={260}>
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

      {/* Advanced Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Donut Chart: HTTP Status Codes */}
        <div className="lg:col-span-5 bg-surface-card border border-border rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
            <ShieldAlert className="text-accent-primary" size={20} />
            <h3 className="font-semibold text-text-primary">Response Code Distribution</h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-10"><LoadingSpinner /></div>
          ) : !reports || 
              (reports.statusDistribution.success === 0 && 
               reports.statusDistribution.redirect === 0 && 
               reports.statusDistribution.clientError === 0 && 
               reports.statusDistribution.serverError === 0) ? (
            <div className="text-center py-10 text-text-secondary">No response code data available</div>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Success (2xx)', value: reports.statusDistribution.success, color: CHART_COLORS.success },
                      { name: 'Redirect (3xx)', value: reports.statusDistribution.redirect, color: 'hsl(210, 90%, 65%)' },
                      { name: 'Client Errors (4xx)', value: reports.statusDistribution.clientError, color: CHART_COLORS.warning },
                      { name: 'Server Errors (5xx)', value: reports.statusDistribution.danger, color: CHART_COLORS.danger },
                    ].filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {[
                      { name: 'Success (2xx)', value: reports.statusDistribution.success, color: CHART_COLORS.success },
                      { name: 'Redirect (3xx)', value: reports.statusDistribution.redirect, color: 'hsl(210, 90%, 65%)' },
                      { name: 'Client Errors (4xx)', value: reports.statusDistribution.clientError, color: CHART_COLORS.warning },
                      { name: 'Server Errors (5xx)', value: reports.statusDistribution.danger, color: CHART_COLORS.danger },
                    ].filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Latency Percentiles Line Chart */}
        <div className="lg:col-span-7 bg-surface-card border border-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
            <BarChart3 className="text-accent-primary" size={20} />
            <h3 className="font-semibold text-text-primary">Latency Percentiles (p50 / p95 / p99)</h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-10"><LoadingSpinner /></div>
          ) : !reports || reports.latencyPercentilesTimeSeries.length === 0 ? (
            <div className="text-center py-10 text-text-secondary">No percentile series data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart 
                data={reports.latencyPercentilesTimeSeries.map(item => ({
                  ...item,
                  time: formatTimeBucket(item.timeBucket),
                }))} 
                margin={{ left: 0, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="time" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} />
                <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 11 }} tickFormatter={(v) => `${v}ms`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="p50" name="p50 (Median)" stroke={CHART_COLORS.success} strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="p95" name="p95" stroke={CHART_COLORS.warning} strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="p99" name="p99" stroke={CHART_COLORS.danger} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* API Key Performance Table */}
      <div className="bg-surface-card border border-border rounded-xl p-5 shadow-lg mb-6 overflow-hidden animate-fade-in">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
          <Key className="text-accent-primary" size={20} />
          <h3 className="font-semibold text-text-primary">API Key Performance</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><LoadingSpinner /></div>
        ) : !reports || reports.apiKeyPerformance.length === 0 ? (
          <div className="text-center py-10 text-text-secondary">No API Key usage data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-text-secondary border-b border-border text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Key Name</th>
                  <th className="pb-3 font-semibold">Environment</th>
                  <th className="pb-3 font-semibold text-right">Total Hits</th>
                  <th className="pb-3 font-semibold text-right">Error Rate</th>
                  <th className="pb-3 font-semibold text-right">Avg Latency</th>
                </tr>
              </thead>
              <tbody>
                {reports.apiKeyPerformance.map((item, idx) => {
                  const errRate = item.totalHits > 0 ? (item.errorHits / item.totalHits) * 100 : 0;
                  return (
                    <tr key={idx} className="border-b border-border/40 hover:bg-surface-secondary/20 transition-colors">
                      <td className="py-3.5 font-medium text-text-primary">{item.name}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                          item.environment === 'production' 
                            ? 'bg-danger-bg border-danger/20 text-danger' 
                            : 'bg-info-bg border-info/20 text-info'
                        }`}>
                          {item.environment}
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-text-primary font-mono">{formatNumber(item.totalHits)}</td>
                      <td className={`py-3.5 text-right font-semibold font-mono ${errRate > 5 ? 'text-danger' : errRate > 0 ? 'text-warning' : 'text-success'}`}>
                        {formatPercentage(errRate)}
                      </td>
                      <td className="py-3.5 text-right text-text-primary font-mono">{formatLatency(item.avgLatency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Traffic Profiling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in">
        {/* IPs */}
        <div className="bg-surface-card border border-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
            <Building2 className="text-accent-primary" size={20} />
            <h3 className="font-semibold text-text-primary">Top Client IP Addresses</h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-6"><LoadingSpinner /></div>
          ) : !reports || reports.ips.length === 0 ? (
            <div className="text-center py-6 text-text-secondary">No traffic IP data available</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {reports.ips.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-surface-secondary/40 border border-border/40 rounded-lg hover:border-border transition-colors">
                  <span className="font-mono text-sm text-text-primary font-medium">{item.ip}</span>
                  <span className="px-2.5 py-0.5 bg-surface-input border border-border rounded-full text-xs text-text-secondary font-mono">
                    {formatNumber(item.count)} hits
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Agents */}
        <div className="bg-surface-card border border-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
            <List className="text-accent-primary" size={20} />
            <h3 className="font-semibold text-text-primary">Top Client User-Agents</h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-6"><LoadingSpinner /></div>
          ) : !reports || reports.userAgents.length === 0 ? (
            <div className="text-center py-6 text-text-secondary">No client runtime data available</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {reports.userAgents.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-surface-secondary/40 border border-border/40 rounded-lg hover:border-border transition-colors gap-4">
                  <span className="text-sm text-text-primary truncate font-medium" title={item.userAgent}>
                    {item.userAgent}
                  </span>
                  <span className="px-2.5 py-0.5 bg-surface-input border border-border rounded-full text-xs text-text-secondary font-mono shrink-0">
                    {formatNumber(item.count)} hits
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
