import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, CheckCircle2, Play, AlertTriangle } from 'lucide-react';

const ENDPOINTS = [
  { path: '/api/v1/auth/login', method: 'POST', status: 200, latency: 45 },
  { path: '/api/v1/users/profile', method: 'GET', status: 200, latency: 28 },
  { path: '/api/v1/payments/charge', method: 'POST', status: 201, latency: 184 },
  { path: '/api/v1/analytics/report', method: 'GET', status: 403, latency: 12 },
  { path: '/api/v1/data/sync', method: 'PUT', status: 500, latency: 312 },
];

export default function PlaygroundPreview() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [status, setStatus] = useState(200);
  const [isSending, setIsSending] = useState(false);
  const [showResponse, setShowResponse] = useState(true);
  const [logs, setLogs] = useState([
    { id: 1, time: '19:24:01', method: 'GET', path: '/api/v1/users/profile', status: 200, latency: 28 },
    { id: 2, time: '19:24:45', method: 'POST', path: '/api/v1/auth/login', status: 200, latency: 45 },
    { id: 3, time: '19:25:12', method: 'POST', path: '/api/v1/payments/charge', status: 201, latency: 184 },
  ]);
  const [chartBars, setChartBars] = useState([35, 60, 45, 90, 50, 75, 40, 85, 65, 78]);

  const handleSend = () => {
    if (isSending) return;
    setIsSending(true);
    setShowResponse(false);

    // Simulated latency based on selected endpoint
    setTimeout(() => {
      setIsSending(false);
      setShowResponse(true);

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      
      const newLog = {
        id: Date.now(),
        time: timeStr,
        method: selectedEndpoint.method,
        path: selectedEndpoint.path,
        status: status,
        latency: selectedEndpoint.latency,
      };

      setLogs(prev => [newLog, ...prev.slice(0, 5)]);

      // Update chart bars by adding a new value and sliding
      setChartBars(prev => {
        const next = [...prev.slice(1)];
        // Spiked latency/height if error status is selected
        const barHeight = status >= 400 ? 95 : Math.floor(Math.random() * 40) + 45;
        next.push(barHeight);
        return next;
      });
    }, 850);
  };

  const getStatusColor = (code) => {
    if (code >= 500) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (code >= 400) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <section id="playground" className="py-24 relative overflow-hidden">
      <div className="landing-container">
        {/* Header */}
        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                        border border-success/30 bg-success-bg
                        text-success text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Live Playground
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-4">
            Try It <span className="gradient-text">Right Now</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Test how API Guard intercepts, monitors, and graphs hits instantly without writing a single line of setup.
          </p>
        </div>

        {/* Playground Window */}
        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto relative z-10 items-stretch">
          {/* Controls & Terminal (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col glass-landing border border-border/30 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/20 bg-surface-secondary/40">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500/80" />
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80" />
                <div className="w-3.5 h-3.5 rounded-full bg-green-500/80" />
                <span className="text-xs text-text-secondary font-mono ml-2 font-medium">playground_session.sh</span>
              </div>
              <div className="text-xs font-semibold text-accent-primary flex items-center gap-1.5">
                <Terminal size={14} />
                Interactive Shell
              </div>
            </div>

            {/* Config Panel */}
            <div className="p-6 border-b border-border/10 bg-surface-secondary/20 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Select API Endpoint
                </label>
                <div className="relative">
                  <select
                    value={selectedEndpoint.path}
                    onChange={(e) => {
                      const ep = ENDPOINTS.find(item => item.path === e.target.value);
                      setSelectedEndpoint(ep);
                      setStatus(ep.status);
                    }}
                    className="w-full bg-surface-elevated text-text-primary text-sm rounded-xl px-4 py-3
                             border border-border/50 focus:outline-none focus:border-accent-primary
                             appearance-none cursor-pointer"
                  >
                    {ENDPOINTS.map(ep => (
                      <option key={ep.path} value={ep.path}>
                        {ep.method} {ep.path}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary text-xs">
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Simulated Status Code
                </label>
                <div className="flex gap-2">
                  {[200, 201, 403, 500].map(code => (
                    <button
                      key={code}
                      onClick={() => setStatus(code)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer
                        ${status === code
                          ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                          : 'border-border bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface-card'
                        }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Code Output / Terminal Area */}
            <div className="flex-1 p-6 font-mono text-sm leading-relaxed bg-surface-primary text-text-primary flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center gap-2 text-text-tertiary mb-3 select-none">
                  <span>$</span>
                  <span className="text-xs">cURL request simulator</span>
                </div>
                <div className="text-success break-all select-all">
                  curl -X {selectedEndpoint.method} "https://api-guard.dev/api/hit" \<br />
                  &nbsp;&nbsp;-H "x-api-key: ak_sandbox_g78f1k2..." \<br />
                  &nbsp;&nbsp;-d '{`{`}'<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"endpoint": "{selectedEndpoint.path}",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"method": "{selectedEndpoint.method}",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"statusCode": {status},<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"latency": {selectedEndpoint.latency}<br />
                  &nbsp;&nbsp;{`}`}
                </div>
              </div>

              <div className="mt-6 border-t border-border/20 pt-4">
                <div className="text-text-tertiary text-xs mb-2 select-none">RESPONSE</div>
                <div className="min-h-[60px] flex items-center">
                  <AnimatePresence mode="wait">
                    {isSending ? (
                      <motion.div
                        key="sending"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 text-accent-primary text-sm font-medium"
                      >
                        <span className="w-4 h-4 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
                        Awaiting handshake / routing event queue...
                      </motion.div>
                    ) : showResponse ? (
                      <motion.div
                        key="response"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-text-primary"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(status)}`}>
                            {status} {status === 200 || status === 201 ? 'OK' : status === 403 ? 'FORBIDDEN' : 'SERVER ERROR'}
                          </span>
                          <span className="text-text-tertiary">•</span>
                          <span className="text-text-secondary">{selectedEndpoint.latency}ms</span>
                        </div>
                        <pre className="text-success bg-surface-secondary/50 p-3 rounded-lg border border-border/20 font-mono">
                          {JSON.stringify({
                            success: true,
                            eventId: `evt_${Math.random().toString(36).substr(2, 9)}`,
                            processedBy: 'worker-us-east-1',
                            queued: true
                          }, null, 2)}
                        </pre>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-surface-secondary/40 border-t border-border/20 flex items-center justify-between">
              <span className="text-xs text-text-tertiary">
                Sandboxed token: live simulation mode
              </span>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                         accent-gradient text-white shadow-md shadow-accent-primary/20 hover:shadow-lg
                         hover:shadow-accent-primary/30 active:scale-[0.98] transition-all duration-200 cursor-pointer
                         disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSending ? 'Transmitting...' : 'Send Event'}
                <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Live Charts & Stream Logs (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Live Chart Visualizer */}
            <div className="glass-landing border border-border/30 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Interactive Load Visualizer
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-ping" />
                    Live Timeline
                  </span>
                </div>

                {/* SVG Live Bar Chart */}
                <div className="h-32 flex items-end gap-2 px-2 pt-4 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 bottom-0 top-4 border-b border-border/10 flex flex-col justify-between pointer-events-none">
                    <div className="w-full border-t border-border/10" />
                    <div className="w-full border-t border-border/10" />
                  </div>

                  {chartBars.map((val, i) => {
                    const isNewest = i === chartBars.length - 1;
                    return (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t-md relative overflow-hidden"
                        style={{
                          height: `${val}%`,
                          background: isNewest
                            ? status >= 400
                              ? 'linear-gradient(to top, var(--color-danger-bg), var(--color-danger))'
                              : 'linear-gradient(to top, var(--color-success-bg), var(--color-success))'
                            : 'linear-gradient(to top, var(--color-border-light), var(--color-accent-primary))',
                          boxShadow: isNewest
                            ? status >= 400
                              ? '0 0 15px var(--color-danger)'
                              : '0 0 15px var(--color-success)'
                            : 'none',
                        }}
                        initial={isNewest ? { scaleY: 0 } : {}}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 px-1">
                  <span className="text-[10px] text-text-tertiary">History</span>
                  <span className="text-[10px] text-text-tertiary">Latest Hit</span>
                </div>
              </div>
 
              <div className="border-t border-border/20 pt-4 mt-6 flex justify-between items-center text-xs text-text-secondary">
                <span>Avg Latency: <strong className="text-text-primary">48ms</strong></span>
                <span>Success Rate: <strong className="text-success">98.4%</strong></span>
              </div>
            </div>

            {/* Event Logs Streamer */}
            <div className="glass-landing border border-border/30 rounded-2xl p-6 shadow-2xl flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Recent Queue Subscriptions
                  </div>
                  <div className="text-[10px] text-text-tertiary font-mono">Real-time Stream</div>
                </div>

                <div className="flex flex-col gap-3 font-mono text-xs">
                  <AnimatePresence initial={false}>
                    {logs.map((log) => {
                      const isError = log.status >= 400;
                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -10, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-surface-secondary/40 border border-border/10 overflow-hidden"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-2 h-2 rounded-full ${isError ? 'bg-danger animate-pulse' : 'bg-success'}`} />
                            <span className="text-text-tertiary select-none">{log.time}</span>
                            <span className="text-accent-primary font-bold">{log.method}</span>
                            <span className="text-text-primary font-medium truncate max-w-[120px] sm:max-w-none">{log.path}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                            <span className={isError ? 'text-danger font-semibold' : 'text-success font-semibold'}>
                              {log.status}
                            </span>
                            <span className="text-text-tertiary text-[10px]">{log.latency}ms</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
 
              <div className="border-t border-border/20 pt-4 mt-6 flex justify-between items-center text-xs text-text-tertiary">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-success" />
                  RabbitMQ pipeline connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
