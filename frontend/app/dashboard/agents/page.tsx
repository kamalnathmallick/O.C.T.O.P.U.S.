'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { agentService, machineService } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import {
  Bot,
  Sparkles,
  Activity,
  Wrench,
  FileText,
  Send,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Play,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: string[];
  aiEngine?: string;
  timestamp: string;
}

export default function AIAgentsPage() {
  const { accessToken } = useAuthStore();
  const toast = useToast();

  const [agentsData, setAgentsData] = useState<any>(null);
  const [machines, setMachines] = useState<any[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Agent execution states
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<any>(null);

  const [runningRul, setRunningRul] = useState(false);
  const [rulReport, setRulReport] = useState<any>(null);

  const [runningDispatcher, setRunningDispatcher] = useState(false);
  const [dispatchReport, setDispatchReport] = useState<any>(null);

  const [runningBriefing, setRunningBriefing] = useState(false);
  const [briefingReport, setBriefingReport] = useState<any>(null);

  // Copilot Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [previousInteractionId, setPreviousInteractionId] = useState<string | undefined>(undefined);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'Generate a shift handover briefing for the fleet',
    'Run diagnostics and RUL forecast on the most critical machine',
    'Auto-dispatch maintenance tasks for at-risk machines',
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am the **Octopus Operations Copilot** powered by `gemini-3.8-flash`. Ask me to inspect machine telemetry, forecast Remaining Useful Life (RUL), dispatch maintenance work orders, or summarize fleet risk.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  useEffect(() => {
    if (accessToken) {
      loadData();
    }
  }, [accessToken]);

  const loadData = async () => {
    if (!accessToken) return;
    setLoadingInitial(true);
    try {
      const [agentsRes, machinesRes, briefingRes] = await Promise.all([
        agentService.getAgents(accessToken),
        machineService.getMachines(accessToken),
        agentService.getFleetBriefing(accessToken).catch(() => null),
      ]);
      setAgentsData(agentsRes);
      setMachines(machinesRes || []);
      if (machinesRes && machinesRes.length > 0) {
        setSelectedMachineId(machinesRes[0].id);
      }
      if (briefingRes) {
        setBriefingReport(briefingRes);
      }
    } catch (error: any) {
      toast.error('Failed to load AI Agents', error.message || 'Check backend server connection');
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleRunDiagnostic = async () => {
    if (!accessToken || !selectedMachineId) return;
    setRunningDiagnostic(true);
    try {
      const report = await agentService.diagnoseMachine(accessToken, selectedMachineId, true);
      setDiagnosticReport(report);
      toast.success('Diagnostic Agent Completed', `Analyzed ${report.machineName}`);
    } catch (error: any) {
      toast.error('Diagnostic Agent Failed', error.message);
    } finally {
      setRunningDiagnostic(false);
    }
  };

  const handleRunRul = async () => {
    if (!accessToken || !selectedMachineId) return;
    setRunningRul(true);
    try {
      const report = await agentService.forecastMachineRul(accessToken, selectedMachineId, true);
      setRulReport(report);
      toast.success('Predictive RUL Agent Completed', `RUL: ${report.rulDays} days`);
    } catch (error: any) {
      toast.error('Predictive RUL Agent Failed', error.message);
    } finally {
      setRunningRul(false);
    }
  };

  const handleRunDispatcher = async (onlySelected = false) => {
    if (!accessToken) return;
    setRunningDispatcher(true);
    try {
      const report = await agentService.dispatchMaintenance(
        accessToken,
        onlySelected ? selectedMachineId : undefined
      );
      setDispatchReport(report);
      toast.success(
        'Maintenance Dispatcher Completed',
        `Dispatched ${report.tasksCreatedCount} work order(s)`
      );
    } catch (error: any) {
      toast.error('Dispatcher Agent Failed', error.message);
    } finally {
      setRunningDispatcher(false);
    }
  };

  const handleRefreshBriefing = async () => {
    if (!accessToken) return;
    setRunningBriefing(true);
    try {
      const report = await agentService.getFleetBriefing(accessToken);
      setBriefingReport(report);
      toast.success('Fleet Briefing Updated', `Fleet risk level: ${report.fleetRiskLevel}`);
    } catch (error: any) {
      toast.error('Briefing Agent Failed', error.message);
    } finally {
      setRunningBriefing(false);
    }
  };

  const handleSendChat = async (promptText?: string) => {
    const text = (promptText ?? chatInput).trim();
    if (!text || !accessToken || chatLoading) return;

    setChatInput('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text, timestamp: new Date().toLocaleTimeString() },
    ]);
    setChatLoading(true);

    try {
      const res = await agentService.chatWithCopilot(accessToken, text, previousInteractionId);
      if (res.interactionId) {
        setPreviousInteractionId(res.interactionId);
      }
      if (Array.isArray(res.suggestedFollowUps) && res.suggestedFollowUps.length > 0) {
        setSuggestedPrompts(res.suggestedFollowUps);
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          toolsUsed: res.toolsUsed,
          aiEngine: res.aiEngine,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (error: any) {
      toast.error('Copilot Error', error.message);
    } finally {
      setChatLoading(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Octopus Multi-Agent AI Command Center
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                5 Autonomous Industrial Agents powered by{' '}
                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                  {agentsData?.defaultModel || 'gemini-3.8-flash'}
                </span>{' '}
                &amp; Hybrid ML Telemetry Models
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              agentsData?.geminiConfigured
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {agentsData?.geminiConfigured
              ? 'Gemini 3.8 Flash Live'
              : 'Hybrid ML Engine Active (Set GEMINI_API_KEY for Cloud LLM)'}
          </span>
        </div>
      </div>

      {/* 5 Agent Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {(agentsData?.agents || []).map((agent: any) => (
          <div
            key={agent.id}
            className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  {agent.model}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ready
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{agent.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">
                {agent.description}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Role: {agent.role}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Fleet Briefing Agent Banner */}
      {briefingReport && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-xl p-6 shadow-lg border border-blue-500/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-400" />
              <div>
                <h2 className="text-lg font-semibold">
                  Fleet Optimization &amp; Shift Handover Briefing
                </h2>
                <p className="text-xs text-slate-300">
                  Generated by <code className="text-blue-300">briefing-agent</code> (
                  {briefingReport.aiEngine})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  briefingReport.fleetRiskLevel === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : briefingReport.fleetRiskLevel === 'HIGH'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                FLEET RISK: {briefingReport.fleetRiskLevel}
              </span>
              <button
                onClick={handleRefreshBriefing}
                disabled={runningBriefing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${runningBriefing ? 'animate-spin' : ''}`} />
                Refresh Briefing
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-200 mb-4">{briefingReport.executiveSummary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-2">
                Shift Action Items
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {(briefingReport.shiftActionItems || []).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2">
                Fleet Optimization Tips
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {(briefingReport.optimizationTips || []).map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left = On-Demand Machine & Dispatch Agents, Right = Operations Copilot Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Machine Diagnostics, RUL Forecasting, and Autonomous Dispatcher */}
        <div className="lg:col-span-7 space-y-6">
          {/* Machine Target Selector & Agent Runners */}
          <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-500" />
                  Machine Diagnostic, RUL &amp; Dispatch Agents
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select an industrial machine to run deep telemetry diagnostics, forecast RUL, or dispatch maintenance.
                </p>
              </div>

              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.status} • {m.healthScore}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleRunDiagnostic}
                disabled={runningDiagnostic || !selectedMachineId}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                <Activity className="w-4 h-4" />
                {runningDiagnostic ? 'Running Diagnostic Agent...' : '1. Run Diagnostic Agent'}
              </button>

              <button
                onClick={handleRunRul}
                disabled={runningRul || !selectedMachineId}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                {runningRul ? 'Forecasting RUL...' : '2. Run Predictive RUL Agent'}
              </button>

              <button
                onClick={() => handleRunDispatcher(false)}
                disabled={runningDispatcher}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                <Wrench className="w-4 h-4" />
                {runningDispatcher ? 'Dispatching Tasks...' : '3. Auto-Dispatch Fleet Maintenance'}
              </button>
            </div>
          </div>

          {/* Diagnostic Report Output */}
          {diagnosticReport && (
            <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-500" />
                  Diagnostic Agent Report — {diagnosticReport.machineName}
                </h3>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  Status: {diagnosticReport.overallStatus} ({diagnosticReport.healthScore}%)
                </span>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300">{diagnosticReport.summary}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/50">
                  <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Probable Root Causes
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                    {(diagnosticReport.rootCauses || []).map((cause: string, idx: number) => (
                      <li key={idx}>{cause}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/50">
                  <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Recommended Engineering Actions
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                    {(diagnosticReport.recommendedActions || []).map((act: string, idx: number) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Predictive RUL Output */}
          {rulReport && (
            <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Predictive RUL Forecast — {rulReport.machineName}
                </h3>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  Confidence: {(rulReport.confidence * 100).toFixed(0)}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-center">
                  <p className="text-xs text-slate-500">Estimated RUL</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {rulReport.rulDays} days
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-center">
                  <p className="text-xs text-slate-500">Failure Probability</p>
                  <p className="text-2xl font-bold text-amber-500">
                    {(rulReport.failureProbability * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-center">
                  <p className="text-xs text-slate-500">Risk Score</p>
                  <p className="text-2xl font-bold text-red-500">{rulReport.riskScore}/100</p>
                </div>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300">{rulReport.reasoning}</p>
            </div>
          )}

          {/* Autonomous Maintenance Dispatcher Output */}
          {dispatchReport && (
            <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-500" />
                  Autonomous Maintenance Dispatcher Report
                </h3>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {dispatchReport.tasksCreatedCount} Task(s) Created
                </span>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300">{dispatchReport.summary}</p>

              <div className="space-y-3">
                {(dispatchReport.dispatchedTasks || []).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.task.title}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
                        {item.task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{item.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Octopus Operations Copilot Chat */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col h-[640px]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Octopus Operations Copilot
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Stateful Multi-Turn Tool-Calling Agent
                  </p>
                </div>
              </div>
              {previousInteractionId && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                  Stateful Session Active
                </span>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {msg.content}
                    {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-1.5">
                        {msg.toolsUsed.map((tool, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          >
                            ⚡ {tool}()
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  Copilot is reasoning &amp; calling plant tools...
                </div>
              )}
            </div>

            {/* Suggested Prompt Pills */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-1.5">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChat(prompt)}
                  disabled={chatLoading}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="p-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Copilot to diagnose machines, predict RUL, or dispatch tasks..."
                className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
