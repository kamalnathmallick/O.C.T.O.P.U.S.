'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const API = 'http://localhost:5000/api';

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function clip(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

function LiveValue({ val, unit, decimals = 1 }: { val: number; unit?: string; decimals?: number }) {
  const [anim, setAnim] = useState(false);
  const prev = useRef(val);
  useEffect(() => {
    if (prev.current !== val) { setAnim(true); prev.current = val; const t = setTimeout(() => setAnim(false), 600); return () => clearTimeout(t); }
  }, [val]);
  return <span className={`font-mono transition-colors duration-300 ${anim ? 'text-cyan-300' : 'text-white'}`}>{val.toFixed(decimals)}{unit}</span>;
}

function ProgressBar({ val, max = 100, color }: { val: number; max?: number; color: string }) {
  const pct = (val / max) * 100;
  return <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden"><motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} className={`h-full rounded-full ${color}`} /></div>;
}

const flowSteps = [
  { from: '🏭 Machine', to: '🧠 AI', action: 'Sensor data sent for analysis', icon: '📡', color: 'from-cyan-500 to-blue-500' },
  { from: '🧠 AI', to: '🚨 Alert', action: 'Anomaly detected, alert created', icon: '⚠️', color: 'from-blue-500 to-red-500' },
  { from: '🚨 Alert', to: '👨‍💼 Manager', action: 'Reviews alert & creates work order', icon: '📋', color: 'from-red-500 to-indigo-500' },
  { from: '👨‍💼 Manager', to: '👨‍🔧 Technician', action: 'Task assigned for repair', icon: '🔧', color: 'from-indigo-500 to-amber-500' },
  { from: '👨‍🔧 Technician', to: '👨‍💻 Operator', action: 'Status updated, alert acknowledged', icon: '✅', color: 'from-amber-500 to-emerald-500' },
  { from: '👨‍💻 Operator', to: '👑 Admin', action: 'Completion reported, logs audited', icon: '📊', color: 'from-emerald-500 to-red-500' },
  { from: '👑 Admin', to: '🏭 Machine', action: 'Config optimized, cycle repeats', icon: '🔄', color: 'from-red-500 to-cyan-500' },
];

const approvalStages = [
  { level: 'TECHNICIAN', icon: '👨‍🔧', label: 'Inspection', color: 'from-amber-500 to-orange-500' },
  { level: 'MANAGER', icon: '👨‍💼', label: 'Review', color: 'from-blue-500 to-indigo-500' },
  { level: 'ADMIN', icon: '👑', label: 'Final Approval', color: 'from-red-500 to-rose-500' },
];

function ApprovalFlow({ data, healthVals }: { data: any; healthVals: Record<string, number> }) {
  const [items, setItems] = useState<any[]>([]);
  const [stage, setStage] = useState(0);
  const machines = Array.isArray(data.machines) ? data.machines : [];
  const maint = Array.isArray(data.maint) ? data.maint : [];
  const alertsArr = Array.isArray(data.alerts) ? data.alerts : [];

  // Generate approval items based on machine health and status
  useEffect(() => {
    const newItems: any[] = [];
    machines.forEach((m: any) => {
      const h = healthVals[m.id] ?? m.healthScore;
      if (h < 35 && m.status !== 'OFFLINE') {
        const issue = h < 20 ? 'Structural crack detected' : h < 30 ? 'Bearing wear critical' : 'Overheating risk';
        newItems.push({ id: m.id + '-replace', machine: m.name, type: 'replacement', issue, priority: h < 20 ? 'CRITICAL' : 'HIGH' });
      }
      if (m.status === 'OFFLINE') {
        newItems.push({ id: m.id + '-start', machine: m.name, type: 'startup', issue: 'Restart permission required', priority: 'MEDIUM' });
      }
    });
    // Also flag machines from CRITICAL alerts
    alertsArr.filter((a: any) => a.severity === 'CRITICAL' && a.status === 'ACTIVE').forEach((a: any) => {
      if (!newItems.find(i => i.machine === (a.machine?.name || ''))) {
        newItems.push({ id: a.id + '-alert', machine: a.machine?.name || 'Unknown', type: 'replacement', issue: a.title, priority: 'CRITICAL' });
      }
    });
    setItems(newItems.slice(0, 4));
  }, [healthVals, machines.length, alertsArr.length]);

  // Auto-cycle approval stage
  useEffect(() => {
    if (items.length === 0) return;
    const t = setInterval(() => setStage(p => (p + 1) % (approvalStages.length + 1)), 2500);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return (
    <div>
      <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">✅ Approval Workflow <span className="text-xs text-slate-500 font-normal">no pending approvals — all machines nominal</span></h2>
      <p className="text-slate-600 text-xs">Approvals auto-trigger when machine health drops or offline status detected</p>
    </div>
  );

  const currentStage = stage <= 2 ? stage : -1;

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">📋 Approval Workflow <span className="text-xs text-slate-500 font-normal">{items.length} pending · stage {Math.min(stage + 1, 4)}/4</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const isApproved = stage >= 3;
          const st = approvalStages[Math.min(stage, 2)];
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-4 border ${item.priority === 'CRITICAL' ? 'bg-red-900/15 border-red-500/30' : item.type === 'startup' ? 'bg-blue-900/15 border-blue-500/30' : 'bg-yellow-900/15 border-yellow-500/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.type === 'startup' ? '🔌' : '🛠️'}</span>
                  <span className="text-white font-semibold text-sm">{item.machine}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${item.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : item.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>{item.priority}</span>
                </div>
                {isApproved
                  ? <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">✅ Approved</span>
                  : <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded animate-pulse">{item.type === 'startup' ? 'Awaiting Permission' : 'Pending Replacement'}</span>
                }
              </div>
              <p className="text-slate-400 text-xs mb-3">{item.issue}</p>
              {!isApproved && (
                <div className="flex items-center gap-1.5">
                  {approvalStages.map((s, i) => (
                    <motion.div key={s.level} animate={{
                      scale: i === stage ? 1 : 0.9,
                      opacity: i <= stage ? 1 : 0.35,
                    }} className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${i === stage ? `bg-gradient-to-r ${s.color} text-white` : 'bg-slate-700/50 text-slate-400'}`}>
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                      {i === stage && <motion.span initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }} className="ml-1">⏳</motion.span>}
                      {i < stage && <span className="ml-1 text-green-400">✓</span>}
                    </motion.div>
                  ))}
                </div>
              )}
              {isApproved && (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <span>✅ Technician inspected</span>
                  <span>→ ✅ Manager reviewed</span>
                  <span>→ ✅ Admin approved</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function RoleFlow({ data }: { data: any }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(p => (p + 1) % flowSteps.length), 2800);
    return () => clearInterval(t);
  }, []);
  const s = flowSteps[step];
  const alertsArr = Array.isArray(data.alerts) ? data.alerts : [];
  const maintArr = Array.isArray(data.maint) ? data.maint : [];
  const usrsArr = Array.isArray(data.users) ? data.users : [];
  const activeAlerts = alertsArr.filter((a: any) => a.status === 'ACTIVE').length;
  const inProgress = maintArr.filter((t: any) => t.status === 'IN_PROGRESS').length;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {flowSteps.map((fs, i) => (
          <motion.div key={i} animate={{ scale: i === step ? 1 : 0.85, opacity: i === step ? 1 : 0.35 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${i === step ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'bg-slate-800/50 text-slate-500 border border-slate-700/30'}`}>
            <span>{fs.from.split(' ')[0]}</span>
            <span className="text-slate-600">→</span>
            <span>{fs.to.split(' ')[0]}</span>
          </motion.div>
        ))}
      </div>
      <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl`}>
          {s.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-300 font-medium">{s.from}</span>
            <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-slate-500">→</motion.span>
            <span className="text-slate-300 font-medium">{s.to}</span>
          </div>
          <div className="text-slate-400 text-xs mt-0.5">{s.action}</div>
        </div>
        <div className="flex gap-2 text-xs text-slate-500 flex-shrink-0">
          <span className="px-2 py-1 rounded bg-slate-700/50">Alerts: {activeAlerts}</span>
          <span className="px-2 py-1 rounded bg-slate-700/50">In progress: {inProgress}</span>
        </div>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { role: 'ADMIN', icon: '👑', users: usrsArr.filter((u: any) => u.role === 'ADMIN').map((u: any) => u.name), action: 'Oversees entire system', active: flowSteps[step].to === '👑 Admin' },
          { role: 'MANAGER', icon: '👨‍💼', users: usrsArr.filter((u: any) => u.role === 'MANAGER').map((u: any) => u.name), action: 'Reviews alerts & creates tasks', active: flowSteps[step].to === '👨‍💼 Manager' || flowSteps[step].from === '👨‍💼 Manager' },
          { role: 'TECHNICIAN', icon: '👨‍🔧', users: usrsArr.filter((u: any) => u.role === 'TECHNICIAN').map((u: any) => u.name), action: 'Executes maintenance work', active: flowSteps[step].to === '👨‍🔧 Technician' || flowSteps[step].from === '👨‍🔧 Technician' },
          { role: 'OPERATOR', icon: '👨‍💻', users: usrsArr.filter((u: any) => u.role === 'OPERATOR').map((u: any) => u.name), action: 'Monitors machines & acknowledges', active: flowSteps[step].to === '👨‍💻 Operator' || flowSteps[step].from === '👨‍💻 Operator' },
        ].map(r => (
          <motion.div key={r.role} animate={{ scale: r.active ? 1.05 : 1, borderColor: r.active ? 'rgba(59,130,246,0.5)' : 'rgba(51,65,85,0.3)' }}
            className={`rounded-lg p-3 border text-sm transition-colors ${r.active ? 'bg-blue-900/20 border-blue-500/40' : 'bg-slate-800/50 border-slate-700/30'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{r.icon}</span>
              <span className="text-white font-semibold">{r.role}</span>
              {r.active && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-2 h-2 rounded-full bg-blue-400" />}
            </div>
            <div className="text-slate-500 text-xs mb-1">{r.action}</div>
            <div className="text-slate-600 text-xs">{r.users.length > 0 ? r.users.join(', ') : 'No users'}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [started, setStarted] = useState(false);
  const [data, setData] = useState<any>({ machines: [], sensors: [], preds: [], alerts: [], maint: [], users: [] });
  const [sensorVals, setSensorVals] = useState<Record<string, number>>({});
  const [healthVals, setHealthVals] = useState<Record<string, number>>({});
  const [ts, setTs] = useState('');
  const tokenRef = useRef('');

  const poll = async () => {
    try {
      if (!tokenRef.current) {
        // Use token from localStorage if user is signed in
        const storedToken = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
        if (storedToken) {
          tokenRef.current = storedToken;
        } else {
          const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL;
          const demoPass = process.env.NEXT_PUBLIC_DEMO_PASSWORD;
          if (demoEmail && demoPass) {
            try {
              const loginRes = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: demoEmail, password: demoPass })
              });
              const loginData = await loginRes.json();
              if (loginData?.accessToken) {
                tokenRef.current = loginData.accessToken;
              }
            } catch (_) {}
          }
        }
      }
      const h: Record<string, string> = tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {};
      const [machines, sensors, preds, alerts, maint, users] = await Promise.all([
        fetch(`${API}/machines`, { headers: h }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API}/sensors`, { headers: h }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API}/predictions`, { headers: h }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API}/alerts`, { headers: h }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API}/maintenance`, { headers: h }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API}/users`, { headers: h }).then(r => r.ok ? r.json() : []).catch(() => []),
      ]);
      setData({
        machines: Array.isArray(machines) ? machines : [],
        sensors: Array.isArray(sensors) ? sensors : [],
        preds: Array.isArray(preds) ? preds : [],
        alerts: Array.isArray(alerts) ? alerts : [],
        maint: Array.isArray(maint) ? maint : [],
        users: Array.isArray(users) ? users : [],
      });
      setTs(new Date().toLocaleTimeString());
    } catch (_) {}
  };

  useEffect(() => {
    if (!started) return;
    poll();
    const t = setInterval(poll, 3000);
    return () => clearInterval(t);
  }, [started]);

  useEffect(() => {
    if (!started || !Array.isArray(data.sensors) || data.sensors.length === 0) return;
    const t = setInterval(() => {
      setSensorVals((prev: Record<string, number>) => {
        const next = { ...prev };
        data.sensors.forEach((s: any) => {
          const base = prev[s.id] ?? 50;
          const minV = s.thresholdMin ?? 0, maxV = s.thresholdMax ?? 100;
          next[s.id] = clip(base + rand(-3, 3), minV - 10, maxV + 10);
        });
        return next;
      });
      setHealthVals((prev: Record<string, number>) => {
        const next = { ...prev };
        (Array.isArray(data.machines) ? data.machines : []).forEach((m: any) => {
          next[m.id] = clip((prev[m.id] ?? m.healthScore) + rand(-2, 2), 0, 100);
        });
        return next;
      });
    }, 800);
    return () => clearInterval(t);
  }, [started, Array.isArray(data.sensors) ? data.sensors.length : 0, Array.isArray(data.machines) ? data.machines.length : 0]);

  const usrs = Array.isArray(data.users) ? data.users : [];
  const roles = [
    { name: 'ADMIN', icon: '👑', desc: 'Full access', users: usrs.filter((u: any) => u.role === 'ADMIN').map((u: any) => u.name) },
    { name: 'MANAGER', icon: '📊', desc: 'Analytics', users: usrs.filter((u: any) => u.role === 'MANAGER').map((u: any) => u.name) },
    { name: 'TECHNICIAN', icon: '🔧', desc: 'Maintenance', users: usrs.filter((u: any) => u.role === 'TECHNICIAN').map((u: any) => u.name) },
    { name: 'OPERATOR', icon: '⚙️', desc: 'Monitoring', users: usrs.filter((u: any) => u.role === 'OPERATOR').map((u: any) => u.name) },
  ];

  if (!started) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl">🐙</motion.div>
      <h1 className="text-4xl font-bold text-white">Octopus Live Demo</h1>
      <p className="text-slate-400">Full IoT → AI pipeline with real-time data streaming</p>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setStarted(true)}
        className="px-12 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl text-white text-xl font-bold shadow-2xl shadow-blue-500/30">
        🚀 Start Live Simulation
      </motion.button>
    </div>
  );

  const activeAlerts = data.alerts.filter((a: any) => a.status === 'ACTIVE').length;
  const criticalPreds = data.preds.filter((p: any) => p.status === 'CRITICAL').length;

  return (
    <div className="min-h-screen bg-slate-950 p-3 md:p-5">
      <div className="max-w-7xl mx-auto">

        {/* Top Bar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">O</div>
          <h1 className="text-xl font-bold text-white">Live Demo</h1>
          <div className="flex items-center gap-2 ml-auto text-xs">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-400">Last update: {ts || '...'}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{Array.isArray(data.machines) ? data.machines.length : 0} machines</span>
            <span className="text-slate-600">|</span>
            <span className="text-red-400">{activeAlerts} active alerts</span>
          </div>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Panel 1: Machines */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">🏭 Machines <span className="text-xs text-slate-500 font-normal">live status</span></h2>
            <div className="space-y-2">
              {(Array.isArray(data.machines) ? data.machines : []).map((m: any) => {
                const h = healthVals[m.id] ?? m.healthScore;
                return (
                  <motion.div key={m.id} initial={false} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium">{m.name}</span>
                      <motion.span key={h > 70 ? 'healthy' : h > 40 ? 'warning' : 'critical'}
                        animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.3 }}
                        className={`text-xs px-2 py-0.5 rounded ${h > 70 ? 'bg-green-500/20 text-green-400' : h > 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {h > 70 ? 'HEALTHY' : h > 40 ? 'WARNING' : 'CRITICAL'}
                      </motion.span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span>{m.type}</span><span>•</span><span>{m.location || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-12">Health</span>
                      <ProgressBar val={h} color={h > 70 ? 'bg-green-500' : h > 40 ? 'bg-yellow-500' : 'bg-red-500'} />
                      <LiveValue val={h} unit="%" decimals={0} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Panel 2: Sensors */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">📡 Sensor Telemetry <span className="text-xs text-slate-500 font-normal">streaming @ 800ms</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Array.isArray(data.sensors) ? data.sensors : []).slice(0, 8).map((s: any) => {
                const v = sensorVals[s.id] ?? rand(s.thresholdMin ?? 20, s.thresholdMax ?? 80);
                const unit = s.unit || '';
                const name = s.name.replace(' Sensor', '').replace(' Monitor', '').replace('Pressure', 'Press.').replace('Temperature', 'Temp.').replace('Vibration', 'Vib.').replace('Spindle ', 'Sp.');
                const isErr = s.thresholdMax && v > s.thresholdMax;
                const isWarn = s.thresholdMax && v > s.thresholdMax * 0.85;
                return (
                  <motion.div key={s.id} initial={false}
                    className={`rounded-lg p-3 border text-sm ${isErr ? 'bg-red-900/20 border-red-500/40' : isWarn ? 'bg-yellow-900/20 border-yellow-500/40' : 'bg-slate-800/50 border-slate-700/30'}`}>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">{name}</span>
                      <span className="text-slate-500 text-xs">{s.type}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-lg font-mono font-bold ${isErr ? 'text-red-400' : isWarn ? 'text-yellow-400' : 'text-cyan-400'}`}>{v.toFixed(1)}</span>
                      <span className="text-slate-500 text-xs">{unit}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 mt-1">
                      <span>min: {s.thresholdMin}{unit}</span>
                      {s.thresholdMax && <span>max: {s.thresholdMax}{unit}</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Panel 3: Predictions + Alerts */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">🧠 AI Predictions <span className="text-xs text-slate-500 font-normal">{criticalPreds > 0 ? `${criticalPreds} critical` : 'all nominal'}</span></h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(Array.isArray(data.preds) ? data.preds : []).map((p: any) => (
                <motion.div key={p.id} initial={false} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">{p.machine?.name || 'Machine'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'NORMAL' ? 'bg-green-500/20 text-green-400' : p.status === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{p.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="text-slate-500">Failure: <LiveValue val={p.failureProbability * 100} unit="%" decimals={0} /></span>
                    <span className="text-slate-500">RUL: <span className="text-white font-mono">{p.rul}d</span></span>
                    <span className="text-slate-500">Risk: <LiveValue val={p.riskScore} unit="" decimals={0} /></span>
                    <span className="text-slate-500">Confidence: <LiveValue val={p.confidence * 100} unit="%" decimals={0} /></span>
                  </div>
                </motion.div>
              ))}
            </div>
            {activeAlerts > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-1">🚨 Active Alerts ({activeAlerts})</h3>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {(Array.isArray(data.alerts) ? data.alerts : []).filter((a: any) => a.status === 'ACTIVE').map((a: any) => (
                    <div key={a.id} className={`text-xs p-2 rounded ${a.severity === 'CRITICAL' ? 'bg-red-900/20 text-red-300' : 'bg-yellow-900/20 text-yellow-300'}`}>
                      <strong>{a.title}</strong> — {a.message?.substring(0, 60)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel 4: Maintenance + Roles */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">🔧 Maintenance Pipeline <span className="text-xs text-slate-500 font-normal">{data.maint.length} work orders</span></h2>
            <div className="space-y-1.5 max-h-40 overflow-y-auto mb-4">
              {(Array.isArray(data.maint) ? data.maint : []).slice(0, 5).map((t: any) => (
                <motion.div key={t.id} initial={false} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2.5 text-xs border border-slate-700/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.status === 'COMPLETED' ? 'bg-green-400' : t.status === 'IN_PROGRESS' ? 'bg-blue-400' : 'bg-slate-500'}`} />
                    <span className="text-slate-300 truncate">{t.title}</span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <span className={`px-1.5 py-0.5 rounded ${t.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : t.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-600/30 text-slate-400'}`}>{t.priority}</span>
                    <span className="text-slate-500">{t.status === 'COMPLETED' ? '✅' : t.status === 'IN_PROGRESS' ? '🔄' : '⏳'}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        {/* Approval Workflow */}
        <div className="mt-4 bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
          <ApprovalFlow data={data} healthVals={healthVals} />
        </div>

        {/* Role Interaction Timeline */}
        <div className="mt-4 bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">🔄 Role Interaction Flow <span className="text-xs text-slate-500 font-normal">how data moves through roles</span></h2>
          <RoleFlow data={data} />
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between mt-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Pipeline live — API polls every 3s, sensor values update @ 800ms</span>
          </div>
          <button onClick={() => setStarted(false)} className="text-slate-500 hover:text-white transition-colors">✕ Exit Demo</button>
        </div>
      </div>
    </div>
  );
}