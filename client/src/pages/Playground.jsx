import { useState, useEffect, useCallback } from 'react';
import { Terminal, Code2, FileJson, Globe, Play, Copy, CheckCircle, AlertCircle, Building2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

const TABS = [
  { id: 'curl', label: 'cURL', icon: Terminal },
  { id: 'js', label: 'JavaScript', icon: Code2 },
  { id: 'python', label: 'Python', icon: FileJson },
  { id: 'go', label: 'Go', icon: Globe },
];

export default function Playground() {
  const { user, isSuperAdmin } = useAuth();
  
  // Clients list for Super Admin
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  
  // Keys list
  const [keys, setKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [apiKeySecret, setApiKeySecret] = useState('');
  
  // Form values for API Ingestion Hit
  const [form, setForm] = useState({
    serviceName: 'user-service',
    endpoint: '/api/v1/users',
    method: 'GET',
    statusCode: '200',
    latencyMs: '45',
  });

  // UI state
  const [activeTab, setActiveTab] = useState('curl');
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  
  // Run results state
  const [runResult, setRunResult] = useState(null);

  // Fetch clients if super admin
  useEffect(() => {
    if (isSuperAdmin) {
      api.getClients()
        .then((res) => {
          if (res.success) {
            const list = Array.isArray(res.data) ? res.data : [res.data].filter(Boolean);
            setClients(list);
            if (list.length > 0) {
              setSelectedClientId(list[0]._id);
            }
          }
        })
        .catch((err) => console.error('Playground failed to fetch clients:', err));
    }
  }, [isSuperAdmin]);

  const clientId = isSuperAdmin ? selectedClientId : user?.clientId;

  // Fetch API keys for selected client
  const fetchKeys = useCallback(async () => {
    if (!clientId) return;
    try {
      setKeysLoading(true);
      const res = await api.getClientApiKeys(clientId);
      if (res.success) {
        const fetchedKeys = Array.isArray(res.data) ? res.data : [];
        setKeys(fetchedKeys);
        if (fetchedKeys.length > 0) {
          setSelectedKeyId(fetchedKeys[0].keyId);
        } else {
          setSelectedKeyId('');
        }
      }
    } catch (err) {
      console.error('Playground failed to fetch keys:', err);
    } finally {
      setKeysLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const getActiveKeyName = () => {
    const key = keys.find(k => k.keyId === selectedKeyId);
    return key ? key.name : 'your_key';
  };

  // Generate code snippet dynamically based on form state
  const getCodeSnippet = () => {
    const key = apiKeySecret || '<YOUR_API_KEY_SECRET>';
    const base = window.location.origin;
    const bodyStr = JSON.stringify({
      endpoint: form.endpoint,
      method: form.method.toUpperCase(),
      statusCode: parseInt(form.statusCode, 10) || 200,
      latencyMs: parseFloat(form.latencyMs) || 0,
      serviceName: form.serviceName,
    }, null, 2);

    switch (activeTab) {
      case 'curl':
        return `curl -X POST "${base}/api/hit" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${key}" \\
  -d '${JSON.stringify(JSON.parse(bodyStr))}'`;

      case 'js':
        return `const response = await fetch("${base}/api/hit", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${key}"
  },
  body: JSON.stringify(${bodyStr.split('\n').join('\n  ')})
});

const data = await response.json();
console.log(data);`;

      case 'python':
        return `import requests

url = "${base}/api/hit"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${key}"
}
payload = ${bodyStr.replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None').split('\n').join('\n    ')}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;

      case 'go':
        return `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	url := "${base}/api/hit"
	payload := []byte(\`${bodyStr}\`)

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", "${key}")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	fmt.Println(result)
}`;

      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run the ingestion request from browser
  const handleRunCall = async () => {
    setError('');
    setRunResult(null);

    if (!apiKeySecret) {
      setError('An API Key Secret must be provided to perform a request.');
      return;
    }

    setRunning(true);
    const startTime = Date.now();

    try {
      const payload = {
        endpoint: form.endpoint,
        method: form.method.toUpperCase(),
        statusCode: parseInt(form.statusCode, 10) || 200,
        latencyMs: parseFloat(form.latencyMs) || 0,
        serviceName: form.serviceName,
      };

      const res = await fetch('/api/hit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKeySecret,
        },
        body: JSON.stringify(payload),
      });

      const latency = Date.now() - startTime;
      const resData = await res.json().catch(() => null);

      setRunResult({
        status: res.status,
        statusText: res.statusText,
        latency,
        data: resData,
      });
    } catch (err) {
      setError(err.message || 'Request failed to execute');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Developer Playground</h1>
          <p className="text-sm text-text-secondary mt-1">
            Generate client code snippets and test API Key ingestion interactively.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Panel */}
        <div className="lg:col-span-5 bg-surface-card border border-border rounded-xl p-5 shadow-lg flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-4 border-b border-border">
            <KeyRound className="text-accent-primary" size={20} />
            <h3 className="font-semibold text-text-primary">Ingestion Config</h3>
          </div>

          {/* Super Admin Client Dropdown */}
          {isSuperAdmin && clients.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={14} /> Client Organization
              </label>
              <select
                className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
              >
                {clients.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Key Dropdown selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound size={14} /> API Key Name
            </label>
            {keysLoading ? (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <LoadingSpinner size={16} /> Loading keys...
              </div>
            ) : keys.length === 0 ? (
              <div className="text-xs text-warning bg-warning-bg border border-warning/20 p-2 rounded-lg">
                No active API keys found. Create a key in the <a href="/app/api-keys" className="text-accent-primary underline hover:text-accent-secondary">API Keys</a> tab first.
              </div>
            ) : (
              <select
                className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                value={selectedKeyId}
                onChange={(e) => setSelectedKeyId(e.target.value)}
              >
                {keys.map(k => (
                  <option key={k.keyId} value={k.keyId}>
                    {k.name} ({k.environment})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* API Key Secret Ingestion Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              API Key Secret *
            </label>
            <input
              type="password"
              className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary transition-colors"
              placeholder="apim_..."
              value={apiKeySecret}
              onChange={(e) => setApiKeySecret(e.target.value)}
            />
            <span className="text-[11px] text-text-tertiary">
              Paste the secret API key generated when creating the key. We never save this.
            </span>
          </div>

          <div className="h-px bg-border my-2" />

          {/* Payload Builder */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">API Ingestion Payload</h4>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">Service Name</label>
              <input
                className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                value={form.serviceName}
                onChange={(e) => setForm(f => ({ ...f, serviceName: e.target.value }))}
                placeholder="user-service"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">Endpoint Path</label>
              <input
                className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                value={form.endpoint}
                onChange={(e) => setForm(f => ({ ...f, endpoint: e.target.value }))}
                placeholder="/api/v1/users"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-text-secondary">HTTP Method</label>
                <select
                  className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                  value={form.method}
                  onChange={(e) => setForm(f => ({ ...f, method: e.target.value }))}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-text-secondary">Status Code</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                  value={form.statusCode}
                  onChange={(e) => setForm(f => ({ ...f, statusCode: e.target.value }))}
                  placeholder="200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">Latency (ms)</label>
              <input
                type="number"
                className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                value={form.latencyMs}
                onChange={(e) => setForm(f => ({ ...f, latencyMs: e.target.value }))}
                placeholder="45"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-lg border bg-danger-bg border-danger/20 text-danger animate-fade-in">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleRunCall}
              disabled={running || keys.length === 0}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none accent-gradient hover:accent-gradient-hover text-white accent-glow"
            >
              {running ? <LoadingSpinner size={18} /> : <Play size={16} />}
              Run API Ingestion Hit
            </button>
          </div>
        </div>

        {/* Right Code and Response Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Code snippets */}
          <div className="bg-surface-card border border-border rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">Generated Code</h3>
              <button
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-border bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50 transition-colors focus:outline-none cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCircle size={14} className="text-success" /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-surface-secondary rounded-lg border border-border">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold
                           rounded-md transition-all duration-150 cursor-pointer focus:outline-none
                           ${activeTab === t.id
                             ? 'accent-gradient text-white shadow-sm'
                             : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'}`}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Code Block Content */}
            <div className="relative bg-surface-input border border-border rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-[350px]">
              <pre className="text-text-primary leading-relaxed">
                {getCodeSnippet()}
              </pre>
            </div>
          </div>

          {/* Response Console */}
          <div className="bg-surface-card border border-border rounded-xl p-5 shadow-lg flex flex-col gap-4 flex-1">
            <h3 className="font-semibold text-text-primary border-b border-border pb-3">Response Console</h3>
            
            {!runResult ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-text-tertiary gap-2">
                <Terminal size={32} className="opacity-50" />
                <p className="text-sm">Click "Run API Ingestion Hit" to send a request.</p>
                <p className="text-xs max-w-sm">
                  This executes a real POST call from your browser to `/api/hit` using your secret API key.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-xs font-mono">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    runResult.status >= 200 && runResult.status < 300
                      ? 'bg-success-bg text-success'
                      : 'bg-danger-bg text-danger'
                  }`}>
                    {runResult.status} {runResult.statusText || (runResult.status === 200 ? 'OK' : 'Error')}
                  </span>
                  <span className="text-text-secondary">
                    Latency: <strong className="text-text-primary">{runResult.latency}ms</strong>
                  </span>
                </div>

                {/* Headers */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-text-secondary font-bold font-sans uppercase text-[10px] tracking-wider">Response Headers</span>
                  <div className="bg-surface-input border border-border rounded-lg p-3 text-text-secondary">
                    <div>content-type: application/json; charset=utf-8</div>
                    <div>date: {new Date().toUTCString()}</div>
                  </div>
                </div>

                {/* Response Body */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-text-secondary font-bold font-sans uppercase text-[10px] tracking-wider">Response Body</span>
                  <div className="bg-surface-input border border-border rounded-lg p-3 overflow-x-auto text-text-primary">
                    <pre>{JSON.stringify(runResult.data, null, 2)}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
