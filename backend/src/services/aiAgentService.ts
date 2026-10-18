import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export interface AgentMetadata {
  id: string;
  name: string;
  role: string;
  description: string;
  model: string;
  capabilities: string[];
  status: 'ONLINE' | 'FALLBACK_READY';
}

export interface DiagnosticReport {
  agentId: string;
  machineId: string;
  machineName: string;
  timestamp: string;
  overallStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  healthScore: number;
  rootCauses: string[];
  anomaliesDetected: Array<{
    sensorName: string;
    sensorType: string;
    latestValue: number;
    unit: string;
    thresholdRange: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    finding: string;
  }>;
  recommendedActions: string[];
  summary: string;
  alertCreated?: any;
  aiEngine: 'gemini-3.8-flash' | 'hybrid-ml-heuristic';
}

export interface PredictiveRulReport {
  agentId: string;
  machineId: string;
  machineName: string;
  timestamp: string;
  failureProbability: number;
  rulDays: number;
  riskScore: number;
  confidence: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  degradationFactors: string[];
  maintenanceWindowDays: number;
  reasoning: string;
  predictionRecord?: any;
  aiEngine: 'gemini-3.8-flash' | 'hybrid-ml-heuristic';
}

export interface DispatchReport {
  agentId: string;
  timestamp: string;
  tasksCreatedCount: number;
  dispatchedTasks: Array<{
    task: any;
    machineName: string;
    assignedOperatorName: string | null;
    rationale: string;
    checklist: string[];
  }>;
  summary: string;
  aiEngine: 'gemini-3.8-flash' | 'hybrid-ml-heuristic';
}

export interface FleetBriefingReport {
  agentId: string;
  timestamp: string;
  executiveSummary: string;
  fleetRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  keyMetrics: {
    totalMachines: number;
    healthyMachines: number;
    warningMachines: number;
    criticalMachines: number;
    activeAlerts: number;
    pendingTasks: number;
    lowBatterySensors: number;
  };
  topRisks: Array<{
    machineName: string;
    issue: string;
    urgency: string;
  }>;
  shiftActionItems: string[];
  optimizationTips: string[];
  aiEngine: 'gemini-3.8-flash' | 'hybrid-ml-heuristic';
}

export interface CopilotResponse {
  agentId: string;
  interactionId?: string;
  reply: string;
  toolsUsed: string[];
  suggestedFollowUps: string[];
  aiEngine: 'gemini-3.8-flash' | 'hybrid-ml-heuristic';
}

/**
 * Returns the catalog of all 5 AI agents in the Octopus platform.
 */
export function listAvailableAgents(): AgentMetadata[] {
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  const status: 'ONLINE' | 'FALLBACK_READY' = hasKey ? 'ONLINE' : 'FALLBACK_READY';

  return [
    {
      id: 'diagnostic-agent',
      name: 'Anomaly & Root-Cause Diagnostic Agent',
      role: 'Real-Time Telemetry & Failure Mode Analyst',
      description:
        'Inspects multi-sensor time-series readings (temperature, vibration, pressure, current), detects threshold & statistical anomalies, identifies root causes, and auto-generates enriched alerts.',
      model: GEMINI_MODEL,
      capabilities: [
        'Multi-sensor correlation analysis',
        'Root-cause failure mode identification',
        'Automatic Alert generation on threshold breach',
        'Corrective action recommendations',
      ],
      status,
    },
    {
      id: 'predictive-rul-agent',
      name: 'Predictive RUL & Risk Forecasting Agent',
      role: 'Remaining Useful Life & Failure Probability Forecaster',
      description:
        'Combines statistical feature extraction (mean, std dev, sensor drift) with Gemini reasoning to forecast Remaining Useful Life (RUL), failure probability, and machine risk scores.',
      model: GEMINI_MODEL,
      capabilities: [
        'Remaining Useful Life (RUL) estimation in days',
        'Failure probability & risk score calculation',
        'Database Prediction record persistence',
        'Dynamic Machine healthScore updates',
      ],
      status,
    },
    {
      id: 'dispatcher-agent',
      name: 'Autonomous Maintenance Dispatcher Agent',
      role: 'Automated Work-Order & Technician Scheduler',
      description:
        'Triages critical/warning machines, unresolved alerts, and low-RUL predictions, matches available operators by department/machineGroup, and creates prioritized MaintenanceTask work orders.',
      model: GEMINI_MODEL,
      capabilities: [
        'Automated work-order creation',
        'Operator skill & machine-group matching',
        'Step-by-step repair checklist generation',
        'Duplicate task prevention',
      ],
      status,
    },
    {
      id: 'briefing-agent',
      name: 'Fleet Optimization & Shift Briefing Agent',
      role: 'Executive & Shift Handover Intelligence Analyst',
      description:
        'Synthesizes plant-wide machine health, active alerts, RUL forecasts, and sensor battery health into a structured shift handover briefing and fleet optimization plan.',
      model: GEMINI_MODEL,
      capabilities: [
        'Shift handover briefing generation',
        'Plant-wide bottleneck & risk ranking',
        'Sensor battery & hardware health audit',
        'Energy & maintenance optimization tips',
      ],
      status,
    },
    {
      id: 'copilot-agent',
      name: 'Octopus Operations Copilot Agent',
      role: 'Interactive Multi-Turn Tool-Calling Assistant',
      description:
        'Conversational assistant equipped with live database tools to inspect machines, run diagnostics, dispatch maintenance tasks, and acknowledge alerts via natural language.',
      model: GEMINI_MODEL,
      capabilities: [
        'Stateful multi-turn conversation (Interactions API)',
        'Live database querying via function calling',
        'On-demand diagnostic & RUL agent invocation',
        'Direct work-order creation & alert acknowledgment',
      ],
      status,
    },
  ];
}

/**
 * 1. Anomaly & Root-Cause Diagnostic Agent
 */
export async function runDiagnosticAgent(
  machineId: string,
  options: { autoCreateAlert?: boolean; userId?: string } = {}
): Promise<DiagnosticReport> {
  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    include: {
      sensors: {
        include: {
          readings: {
            orderBy: { timestamp: 'desc' },
            take: 25,
          },
        },
      },
      alerts: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!machine) {
    throw new Error('Machine not found');
  }

  // Analyze sensor readings statistically first
  const anomaliesDetected: DiagnosticReport['anomaliesDetected'] = [];
  for (const sensor of machine.sensors) {
    const latest = sensor.readings[0];
    if (!latest) continue;

    const val = latest.value;
    const minT = sensor.thresholdMin;
    const maxT = sensor.thresholdMax;
    const thresholdRange = `${minT ?? 'N/A'} - ${maxT ?? 'N/A'} ${sensor.unit}`;

    if (maxT !== null && maxT !== undefined && val > maxT) {
      const ratio = val / maxT;
      const severity = ratio >= 1.15 ? 'CRITICAL' : 'WARNING';
      anomaliesDetected.push({
        sensorName: sensor.name,
        sensorType: sensor.type,
        latestValue: val,
        unit: sensor.unit,
        thresholdRange,
        severity,
        finding: `${sensor.type} reading (${val} ${sensor.unit}) exceeds maximum threshold (${maxT} ${sensor.unit}) by ${((ratio - 1) * 100).toFixed(1)}%.`,
      });
    } else if (minT !== null && minT !== undefined && val < minT) {
      const severity = val < minT * 0.85 ? 'CRITICAL' : 'WARNING';
      anomaliesDetected.push({
        sensorName: sensor.name,
        sensorType: sensor.type,
        latestValue: val,
        unit: sensor.unit,
        thresholdRange,
        severity,
        finding: `${sensor.type} reading (${val} ${sensor.unit}) dropped below minimum threshold (${minT} ${sensor.unit}).`,
      });
    }
  }

  const hasCritical =
    anomaliesDetected.some((a) => a.severity === 'CRITICAL') || machine.status === 'CRITICAL';
  const hasWarning =
    anomaliesDetected.some((a) => a.severity === 'WARNING') || machine.status === 'WARNING';

  let overallStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL' = hasCritical
    ? 'CRITICAL'
    : hasWarning
    ? 'WARNING'
    : 'HEALTHY';

  let healthScore = machine.healthScore;
  if (overallStatus === 'CRITICAL') {
    healthScore = Math.min(healthScore, Math.max(25, 65 - anomaliesDetected.length * 15));
  } else if (overallStatus === 'WARNING') {
    healthScore = Math.min(healthScore, Math.max(60, 82 - anomaliesDetected.length * 8));
  }

  let rootCauses: string[] = [];
  let recommendedActions: string[] = [];
  let summary = '';
  let aiEngine: 'gemini-3.8-flash' | 'hybrid-ml-heuristic' = 'hybrid-ml-heuristic';

  const client = getGenAIClient();
  if (client) {
    try {
      const telemetryContext = {
        machine: {
          name: machine.name,
          type: machine.type,
          model: machine.model,
          department: machine.department,
          status: machine.status,
          healthScore: machine.healthScore,
        },
        sensors: machine.sensors.map((s) => ({
          name: s.name,
          type: s.type,
          unit: s.unit,
          thresholdMin: s.thresholdMin,
          thresholdMax: s.thresholdMax,
          batteryLevel: s.batteryLevel,
          recentReadings: s.readings.slice(0, 8).map((r) => r.value),
        })),
        anomaliesDetected,
        activeAlerts: machine.alerts.map((a) => ({
          title: a.title,
          severity: a.severity,
          message: a.message,
        })),
      };

      const interaction = await client.interactions.create({
        model: GEMINI_MODEL,
        system_instruction:
          'You are the Octopus Anomaly & Root-Cause Diagnostic Agent for industrial predictive maintenance. Analyze the provided machine telemetry and anomalies, and return a concise, technically accurate JSON diagnostic assessment.',
        input: `Analyze this industrial machine telemetry and provide root causes, recommended engineering actions, overall status, health score (0-100), and executive summary:\n${JSON.stringify(
          telemetryContext
        )}`,
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: {
            type: 'object',
            properties: {
              overallStatus: {
                type: 'string',
                enum: ['HEALTHY', 'WARNING', 'CRITICAL'],
              },
              healthScore: { type: 'integer' },
              rootCauses: {
                type: 'array',
                items: { type: 'string' },
              },
              recommendedActions: {
                type: 'array',
                items: { type: 'string' },
              },
              summary: { type: 'string' },
            },
            required: ['overallStatus', 'healthScore', 'rootCauses', 'recommendedActions', 'summary'],
          },
        } as any,
      });

      if (interaction.output_text) {
        const parsed = JSON.parse(interaction.output_text);
        overallStatus = parsed.overallStatus || overallStatus;
        healthScore =
          typeof parsed.healthScore === 'number'
            ? Math.max(0, Math.min(100, parsed.healthScore))
            : healthScore;
        rootCauses = Array.isArray(parsed.rootCauses) ? parsed.rootCauses : [];
        recommendedActions = Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [];
        summary = parsed.summary || '';
        aiEngine = 'gemini-3.8-flash';
      }
    } catch (err) {
      console.warn('Gemini Diagnostic Agent fallback triggered:', err);
    }
  }

  // Fallback / deterministic enrichment if Gemini wasn't used or returned empty arrays
  if (rootCauses.length === 0) {
    if (anomaliesDetected.length > 0) {
      const types = anomaliesDetected.map((a) => a.sensorType.toLowerCase());
      if (types.some((t) => t.includes('temp')) && types.some((t) => t.includes('vib'))) {
        rootCauses.push(
          'Coupled thermal-vibration signature indicates probable bearing lubrication breakdown or shaft misalignment.'
        );
      } else if (types.some((t) => t.includes('temp'))) {
        rootCauses.push(
          'Thermal dissipation degradation — check cooling airflow, heat exchanger fouling, or excessive load duty cycle.'
        );
      } else if (types.some((t) => t.includes('vib'))) {
        rootCauses.push(
          'Mechanical imbalance, loose mounting bolts, or early-stage rotor/impeller wear detected.'
        );
      } else if (types.some((t) => t.includes('press'))) {
        rootCauses.push(
          'Fluid/pneumatic pressure deviation suggesting valve seal leakage, filter blockage, or pump cavitation.'
        );
      } else {
        rootCauses.push(
          'Sensor threshold excursion detected across active telemetry channels requiring physical inspection.'
        );
      }
    } else if (machine.alerts.length > 0) {
      rootCauses.push(
        `Machine has ${machine.alerts.length} unresolved active alert(s) (${machine.alerts[0].title}).`
      );
    } else {
      rootCauses.push('All monitored sensor channels are operating within nominal engineering thresholds.');
    }
  }

  if (recommendedActions.length === 0) {
    if (overallStatus === 'CRITICAL') {
      recommendedActions = [
        `Immediately throttle or isolate ${machine.name} to prevent catastrophic component seizure.`,
        'Perform thermographic and vibration spectrum check on main drive assembly and bearings.',
        'Dispatch high-priority corrective maintenance task and verify spare part availability.',
      ];
    } else if (overallStatus === 'WARNING') {
      recommendedActions = [
        `Schedule preventive inspection for ${machine.name} within the next 48 hours.`,
        'Inspect lubrication levels, cooling passages, and sensor calibration.',
        'Monitor sensor trend intervals at 15-minute frequency for further drift.',
      ];
    } else {
      recommendedActions = [
        'Continue standard preventive maintenance schedule.',
        'Verify sensor battery levels during next routine operator walkdown.',
      ];
    }
  }

  if (!summary) {
    summary =
      anomaliesDetected.length > 0
        ? `Diagnostic Agent detected ${anomaliesDetected.length} sensor anomaly/anomalies on ${machine.name} (${machine.type}). Overall machine state assessed as ${overallStatus} with a health score of ${healthScore}%.`
        : `${machine.name} (${machine.type}) was inspected across ${machine.sensors.length} sensor(s). Status is ${overallStatus} with health score ${healthScore}%.`;
  }

  // Optionally create an Alert if critical/warning anomalies exist
  let alertCreated = null;
  if (options.autoCreateAlert && anomaliesDetected.length > 0) {
    const topAnomaly =
      anomaliesDetected.find((a) => a.severity === 'CRITICAL') || anomaliesDetected[0];
    alertCreated = await prisma.alert.create({
      data: {
        machineId: machine.id,
        severity: topAnomaly.severity,
        status: 'ACTIVE',
        title: `[AI Diagnostic] ${topAnomaly.sensorType} Anomaly on ${machine.name}`,
        message: `${topAnomaly.finding} Root cause: ${rootCauses[0]}`,
        sensorType: topAnomaly.sensorType,
        value: topAnomaly.latestValue,
        threshold:
          machine.sensors.find((s) => s.name === topAnomaly.sensorName)?.thresholdMax ?? undefined,
      },
    });
  }

  await prisma.systemLog.create({
    data: {
      userId: options.userId,
      action: 'AI_DIAGNOSTIC_RUN',
      entityType: 'Machine',
      entityId: machine.id,
      details: summary,
    },
  });

  return {
    agentId: 'diagnostic-agent',
    machineId: machine.id,
    machineName: machine.name,
    timestamp: new Date().toISOString(),
    overallStatus,
    healthScore,
    rootCauses,
    anomaliesDetected,
    recommendedActions,
    summary,
    alertCreated,
    aiEngine,
  };
}

/**
 * 2. Predictive RUL & Risk Forecasting Agent
 */
export async function runPredictiveRulAgent(
  machineId: string,
  options: { persistPrediction?: boolean; userId?: string } = { persistPrediction: true }
): Promise<PredictiveRulReport> {
  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    include: {
      sensors: {
        include: {
          readings: {
            orderBy: { timestamp: 'desc' },
            take: 30,
          },
        },
      },
      alerts: {
        where: { status: 'ACTIVE' },
      },
      predictions: {
        orderBy: { predictionDate: 'desc' },
        take: 3,
      },
    },
  });

  if (!machine) {
    throw new Error('Machine not found');
  }

  // Statistical feature extraction inspired by ai-models/predictive_model.py
  let excursionRatioSum = 0;
  let volatilityCount = 0;
  const degradationFactors: string[] = [];

  for (const sensor of machine.sensors) {
    const values = sensor.readings.map((r) => r.value);
    if (values.length === 0) continue;

    const latest = values[0];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(
      values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / Math.max(values.length, 1)
    );

    if (sensor.thresholdMax && latest > sensor.thresholdMax * 0.85) {
      const ratio = latest / sensor.thresholdMax;
      excursionRatioSum += Math.max(0, ratio - 0.8);
      if (ratio > 1) {
        degradationFactors.push(
          `${sensor.name} (${sensor.type}) is operating at ${(ratio * 100).toFixed(0)}% of max threshold (${latest} ${sensor.unit}).`
        );
      } else {
        degradationFactors.push(
          `${sensor.name} (${sensor.type}) is approaching upper threshold (${latest}/${sensor.thresholdMax} ${sensor.unit}).`
        );
      }
    }

    if (mean !== 0 && std / Math.abs(mean) > 0.15) {
      volatilityCount++;
      degradationFactors.push(
        `Elevated signal variance (σ=${std.toFixed(2)} ${sensor.unit}) detected on ${sensor.name}.`
      );
    }
  }

  const activeCriticalAlerts = machine.alerts.filter((a) => a.severity === 'CRITICAL').length;
  const activeWarningAlerts = machine.alerts.filter((a) => a.severity === 'WARNING').length;

  // Baseline ML/statistical calculation
  const baseHealthPenalty = (100 - machine.healthScore) / 100;
  let failureProbability = Math.min(
    0.96,
    Math.max(
      0.03,
      Number(
        (
          baseHealthPenalty * 0.45 +
          excursionRatioSum * 0.35 +
          activeCriticalAlerts * 0.18 +
          activeWarningAlerts * 0.08 +
          volatilityCount * 0.05
        ).toFixed(2)
      )
    )
  );

  let riskScore = Math.min(100, Math.max(5, Math.round(failureProbability * 100)));
  let rulDays = Math.max(
    3,
    Math.round(365 * (1 - failureProbability * 0.92) - activeCriticalAlerts * 25)
  );
  let confidence = Number(
    Math.min(0.97, 0.72 + Math.min(machine.sensors.length * 0.05, 0.22)).toFixed(2)
  );
  let status: 'NORMAL' | 'WARNING' | 'CRITICAL' =
    riskScore >= 70 || rulDays <= 30
      ? 'CRITICAL'
      : riskScore >= 40 || rulDays <= 90
      ? 'WARNING'
      : 'NORMAL';

  let reasoning = '';
  let aiEngine: 'gemini-3.8-flash' | 'hybrid-ml-heuristic' = 'hybrid-ml-heuristic';

  const client = getGenAIClient();
  if (client) {
    try {
      const promptData = {
        machine: {
          name: machine.name,
          type: machine.type,
          status: machine.status,
          healthScore: machine.healthScore,
          lastMaintenance: machine.lastMaintenance,
        },
        statisticalBaseline: {
          failureProbability,
          rulDays,
          riskScore,
          confidence,
          status,
          degradationFactors,
        },
        activeAlertsCount: machine.alerts.length,
      };

      const interaction = await client.interactions.create({
        model: GEMINI_MODEL,
        system_instruction:
          'You are the Octopus Predictive RUL & Risk Forecasting Agent. Refine the statistical baseline using industrial reliability engineering principles and return a JSON forecast.',
        input: `Refine this Remaining Useful Life (RUL) and failure probability forecast for ${machine.name}:\n${JSON.stringify(
          promptData
        )}`,
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: {
            type: 'object',
            properties: {
              failureProbability: { type: 'number' },
              rulDays: { type: 'integer' },
              riskScore: { type: 'integer' },
              confidence: { type: 'number' },
              status: { type: 'string', enum: ['NORMAL', 'WARNING', 'CRITICAL'] },
              degradationFactors: { type: 'array', items: { type: 'string' } },
              reasoning: { type: 'string' },
            },
            required: [
              'failureProbability',
              'rulDays',
              'riskScore',
              'confidence',
              'status',
              'degradationFactors',
              'reasoning',
            ],
          },
        } as any,
      });

      if (interaction.output_text) {
        const parsed = JSON.parse(interaction.output_text);
        failureProbability = Math.max(0, Math.min(1, Number(parsed.failureProbability ?? failureProbability)));
        rulDays = Math.max(1, Math.round(parsed.rulDays ?? rulDays));
        riskScore = Math.max(0, Math.min(100, Math.round(parsed.riskScore ?? riskScore)));
        confidence = Math.max(0.5, Math.min(0.99, Number(parsed.confidence ?? confidence)));
        status = parsed.status || status;
        if (Array.isArray(parsed.degradationFactors) && parsed.degradationFactors.length > 0) {
          degradationFactors.splice(0, degradationFactors.length, ...parsed.degradationFactors);
        }
        reasoning = parsed.reasoning || '';
        aiEngine = 'gemini-3.8-flash';
      }
    } catch (err) {
      console.warn('Gemini Predictive RUL Agent fallback triggered:', err);
    }
  }

  if (degradationFactors.length === 0) {
    degradationFactors.push(
      machine.healthScore < 80
        ? `Cumulative operating wear reflected in current health score (${machine.healthScore}%).`
        : 'Normal operational wear profile with stable multi-sensor variance.'
    );
  }

  const maintenanceWindowDays = Math.max(1, Math.round(rulDays * 0.65));

  if (!reasoning) {
    reasoning = `Based on ${machine.sensors.length} sensor stream(s), ${machine.alerts.length} active alert(s), and a health score of ${machine.healthScore}%, ${machine.name} has an estimated Remaining Useful Life of ${rulDays} days (failure probability ${(
      failureProbability * 100
    ).toFixed(1)}%, risk score ${riskScore}/100). Recommended preventive service window: within ${maintenanceWindowDays} days.`;
  }

  let predictionRecord = null;
  if (options.persistPrediction !== false) {
    predictionRecord = await prisma.prediction.create({
      data: {
        machineId: machine.id,
        failureProbability,
        rul: rulDays,
        riskScore,
        confidence,
        status,
        modelVersion: aiEngine === 'gemini-3.8-flash' ? 'gemini-3.8-flash+rf-v2' : 'octopus-rf-v2',
        nextPrediction: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      include: {
        machine: true,
      },
    });
  }

  await prisma.systemLog.create({
    data: {
      userId: options.userId,
      action: 'AI_RUL_PREDICTION_RUN',
      entityType: 'Machine',
      entityId: machine.id,
      details: reasoning,
    },
  });

  return {
    agentId: 'predictive-rul-agent',
    machineId: machine.id,
    machineName: machine.name,
    timestamp: new Date().toISOString(),
    failureProbability,
    rulDays,
    riskScore,
    confidence,
    status,
    degradationFactors,
    maintenanceWindowDays,
    reasoning,
    predictionRecord,
    aiEngine,
  };
}

/**
 * 3. Autonomous Maintenance Dispatcher Agent
 */
export async function runMaintenanceDispatcherAgent(
  options: { machineId?: string; userId?: string } = {}
): Promise<DispatchReport> {
  const whereMachine: any = options.machineId
    ? { id: options.machineId }
    : {
        OR: [
          { status: { in: ['CRITICAL', 'WARNING'] } },
          { healthScore: { lt: 75 } },
          { alerts: { some: { status: 'ACTIVE' } } },
        ],
      };

  const machines = await prisma.machine.findMany({
    where: whereMachine,
    include: {
      alerts: { where: { status: 'ACTIVE' } },
      predictions: { orderBy: { predictionDate: 'desc' }, take: 1 },
      maintenanceTasks: {
        where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
      },
    },
  });

  const operators = await prisma.user.findMany({
    where: {
      isActive: true,
      role: { in: ['OPERATOR', 'TECHNICIAN', 'MANAGER'] },
    },
  });

  const dispatchedTasks: DispatchReport['dispatchedTasks'] = [];
  let aiEngine: 'gemini-3.8-flash' | 'hybrid-ml-heuristic' = 'hybrid-ml-heuristic';
  const client = getGenAIClient();

  for (const machine of machines) {
    // Avoid creating duplicate pending tasks if one was already dispatched by AI recently
    const existingOpenTask = machine.maintenanceTasks.find((t) =>
      t.title.toLowerCase().includes('ai dispatch')
    );
    if (existingOpenTask && !options.machineId) {
      continue;
    }

    // Match best operator by machineGroup or department
    const matchedOperator =
      operators.find(
        (op) => op.machineGroup && machine.machineGroup && op.machineGroup === machine.machineGroup
      ) ||
      operators.find(
        (op) => op.department && machine.department && op.department === machine.department
      ) ||
      operators[0] ||
      null;

    const isCritical =
      machine.status === 'CRITICAL' ||
      machine.healthScore < 55 ||
      machine.alerts.some((a) => a.severity === 'CRITICAL') ||
      (machine.predictions[0] && machine.predictions[0].status === 'CRITICAL');

    const priority = isCritical ? 'CRITICAL' : machine.status === 'WARNING' ? 'HIGH' : 'MEDIUM';
    const taskType = isCritical ? 'EMERGENCY_REPAIR' : 'PREVENTIVE_INSPECTION';
    const scheduledDaysAhead = isCritical ? 1 : 3;

    let title = `[AI Dispatch] ${isCritical ? 'Urgent Repair' : 'Preventive Service'} — ${machine.name}`;
    let description = `Autonomous Dispatcher scheduled ${taskType} for ${machine.name} (${machine.type}). Health score: ${machine.healthScore}%, active alerts: ${machine.alerts.length}.`;
    let rationale = `Matched ${
      matchedOperator ? matchedOperator.name : 'Unassigned Queue'
    } based on ${machine.department || 'plant'} department & ${priority} urgency.`;
    let checklist = [
      `Lock-out / Tag-out (LOTO) ${machine.name} before inspection.`,
      'Inspect primary sensor channels and verify calibration.',
      'Check bearings, lubrication, and thermal dissipation pathways.',
      'Run post-maintenance diagnostic test before returning to service.',
    ];

    if (client) {
      try {
        const interaction = await client.interactions.create({
          model: GEMINI_MODEL,
          system_instruction:
            'You are the Octopus Autonomous Maintenance Dispatcher Agent. Generate a concise work-order title, technical description, assignment rationale, and 4-step repair checklist in JSON.',
          input: JSON.stringify({
            machineName: machine.name,
            machineType: machine.type,
            status: machine.status,
            healthScore: machine.healthScore,
            priority,
            alerts: machine.alerts.map((a) => ({ title: a.title, message: a.message })),
            assignedOperator: matchedOperator?.name || 'Operations Team',
          }),
          response_format: {
            type: 'text',
            mime_type: 'application/json',
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                rationale: { type: 'string' },
                checklist: { type: 'array', items: { type: 'string' } },
              },
              required: ['title', 'description', 'rationale', 'checklist'],
            },
          } as any,
        });

        if (interaction.output_text) {
          const parsed = JSON.parse(interaction.output_text);
          if (parsed.title) title = `[AI Dispatch] ${parsed.title.replace(/^\[AI Dispatch\]\s*/i, '')}`;
          if (parsed.description) description = parsed.description;
          if (parsed.rationale) rationale = parsed.rationale;
          if (Array.isArray(parsed.checklist) && parsed.checklist.length > 0) {
            checklist = parsed.checklist;
          }
          aiEngine = 'gemini-3.8-flash';
        }
      } catch (err) {
        console.warn('Gemini Dispatcher Agent fallback triggered:', err);
      }
    }

    const createdTask = await prisma.maintenanceTask.create({
      data: {
        machineId: machine.id,
        title,
        description: `${description}\n\nChecklist:\n${checklist.map((c, i) => `${i + 1}. ${c}`).join('\n')}`,
        type: taskType,
        priority,
        status: 'PENDING',
        assignedTo: matchedOperator ? matchedOperator.id : null,
        scheduledDate: new Date(Date.now() + scheduledDaysAhead * 24 * 60 * 60 * 1000),
      },
      include: {
        machine: { select: { id: true, name: true, type: true } },
        assignedToUser: { select: { id: true, name: true, email: true } },
      },
    });

    dispatchedTasks.push({
      task: createdTask,
      machineName: machine.name,
      assignedOperatorName: matchedOperator ? matchedOperator.name : null,
      rationale,
      checklist,
    });
  }

  const summary =
    dispatchedTasks.length > 0
      ? `Autonomous Dispatcher created ${dispatchedTasks.length} prioritized work order(s) across at-risk equipment.`
      : 'All at-risk machines already have active maintenance tasks assigned, or all equipment is healthy.';

  await prisma.systemLog.create({
    data: {
      userId: options.userId,
      action: 'AI_MAINTENANCE_DISPATCH',
      entityType: 'MaintenanceTask',
      details: summary,
    },
  });

  return {
    agentId: 'dispatcher-agent',
    timestamp: new Date().toISOString(),
    tasksCreatedCount: dispatchedTasks.length,
    dispatchedTasks,
    summary,
    aiEngine,
  };
}

/**
 * 4. Fleet Optimization & Shift Briefing Agent
 */
export async function runFleetBriefingAgent(userId?: string): Promise<FleetBriefingReport> {
  const [machines, activeAlerts, pendingTasks, sensors] = await Promise.all([
    prisma.machine.findMany({
      include: {
        predictions: { orderBy: { predictionDate: 'desc' }, take: 1 },
      },
    }),
    prisma.alert.findMany({
      where: { status: 'ACTIVE' },
      include: { machine: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.maintenanceTask.findMany({
      where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
      include: { machine: { select: { name: true } } },
    }),
    prisma.sensor.findMany(),
  ]);

  const healthyMachines = machines.filter((m) => m.status === 'HEALTHY').length;
  const warningMachines = machines.filter((m) => m.status === 'WARNING').length;
  const criticalMachines = machines.filter((m) => m.status === 'CRITICAL').length;
  const lowBatterySensors = sensors.filter((s) => (s.batteryLevel ?? 100) < 25).length;

  const fleetRiskLevel: FleetBriefingReport['fleetRiskLevel'] =
    criticalMachines > 0
      ? 'CRITICAL'
      : warningMachines >= 2 || activeAlerts.length >= 4
      ? 'HIGH'
      : warningMachines > 0 || activeAlerts.length > 0
      ? 'MODERATE'
      : 'LOW';

  const topRisks = machines
    .filter((m) => m.status !== 'HEALTHY' || m.healthScore < 80)
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 4)
    .map((m) => ({
      machineName: m.name,
      issue: `Status: ${m.status}, Health Score: ${m.healthScore}%${
        m.predictions[0] ? `, RUL: ${m.predictions[0].rul} days` : ''
      }`,
      urgency: m.status === 'CRITICAL' ? 'IMMEDIATE' : 'HIGH',
    }));

  let executiveSummary = `Plant fleet is operating at ${fleetRiskLevel} risk across ${machines.length} machine(s) (${healthyMachines} healthy, ${warningMachines} warning, ${criticalMachines} critical), with ${activeAlerts.length} active alert(s) and ${pendingTasks.length} open work order(s).`;
  let shiftActionItems = [
    criticalMachines > 0
      ? `Prioritize immediate inspection on ${criticalMachines} critical machine(s).`
      : 'Maintain standard operator walkdown schedule across all healthy production lines.',
    activeAlerts.length > 0
      ? `Review and acknowledge ${activeAlerts.length} active sensor alert(s) in the Alert Center.`
      : 'Zero unacknowledged active alerts on the floor.',
    lowBatterySensors > 0
      ? `Replace batteries on ${lowBatterySensors} IoT sensor node(s) below 25% charge.`
      : 'All IoT sensor nodes have healthy battery reserves.',
  ];
  let optimizationTips = [
    'Group preventive maintenance tasks by machineGroup to reduce line changeover downtime by up to 18%.',
    'Run the Predictive RUL Agent after every high-load shift to track bearing & thermal drift early.',
    'Enable auto-dispatch on critical alerts to minimize Mean Time To Repair (MTTR).',
  ];
  let aiEngine: 'gemini-3.8-flash' | 'hybrid-ml-heuristic' = 'hybrid-ml-heuristic';

  const client = getGenAIClient();
  if (client) {
    try {
      const interaction = await client.interactions.create({
        model: GEMINI_MODEL,
        system_instruction:
          'You are the Octopus Fleet Optimization & Shift Briefing Agent. Synthesize the plant telemetry into an executive shift handover briefing in JSON.',
        input: JSON.stringify({
          keyMetrics: {
            totalMachines: machines.length,
            healthyMachines,
            warningMachines,
            criticalMachines,
            activeAlerts: activeAlerts.length,
            pendingTasks: pendingTasks.length,
            lowBatterySensors,
          },
          topRisks,
          recentAlerts: activeAlerts.slice(0, 5).map((a) => ({
            machine: a.machine?.name,
            title: a.title,
            severity: a.severity,
          })),
        }),
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: {
            type: 'object',
            properties: {
              executiveSummary: { type: 'string' },
              shiftActionItems: { type: 'array', items: { type: 'string' } },
              optimizationTips: { type: 'array', items: { type: 'string' } },
            },
            required: ['executiveSummary', 'shiftActionItems', 'optimizationTips'],
          },
        } as any,
      });

      if (interaction.output_text) {
        const parsed = JSON.parse(interaction.output_text);
        if (parsed.executiveSummary) executiveSummary = parsed.executiveSummary;
        if (Array.isArray(parsed.shiftActionItems) && parsed.shiftActionItems.length > 0) {
          shiftActionItems = parsed.shiftActionItems;
        }
        if (Array.isArray(parsed.optimizationTips) && parsed.optimizationTips.length > 0) {
          optimizationTips = parsed.optimizationTips;
        }
        aiEngine = 'gemini-3.8-flash';
      }
    } catch (err) {
      console.warn('Gemini Fleet Briefing Agent fallback triggered:', err);
    }
  }

  await prisma.systemLog.create({
    data: {
      userId,
      action: 'AI_FLEET_BRIEFING_GENERATED',
      entityType: 'System',
      details: executiveSummary,
    },
  });

  return {
    agentId: 'briefing-agent',
    timestamp: new Date().toISOString(),
    executiveSummary,
    fleetRiskLevel,
    keyMetrics: {
      totalMachines: machines.length,
      healthyMachines,
      warningMachines,
      criticalMachines,
      activeAlerts: activeAlerts.length,
      pendingTasks: pendingTasks.length,
      lowBatterySensors,
    },
    topRisks,
    shiftActionItems,
    optimizationTips,
    aiEngine,
  };
}

/**
 * 5. Octopus Operations Copilot Agent (Interactive Multi-Turn Tool-Calling Agent)
 */
export async function runCopilotChatAgent(params: {
  message: string;
  previousInteractionId?: string;
  userId?: string;
}): Promise<CopilotResponse> {
  const { message, previousInteractionId, userId } = params;
  const toolsUsed: string[] = [];

  // Tool execution helper connected to Prisma & the other specialized agents
  const executeAgentTool = async (name: string, args: any): Promise<any> => {
    toolsUsed.push(name);
    switch (name) {
      case 'get_fleet_summary': {
        const briefing = await runFleetBriefingAgent(userId);
        return briefing;
      }
      case 'list_machines': {
        const machines = await prisma.machine.findMany({
          include: {
            _count: {
              select: {
                alerts: { where: { status: 'ACTIVE' } },
                maintenanceTasks: { where: { status: 'PENDING' } },
              },
            },
          },
          orderBy: { healthScore: 'asc' },
        });
        return machines.map((m) => ({
          id: m.id,
          name: m.name,
          type: m.type,
          status: m.status,
          healthScore: m.healthScore,
          location: m.location,
          department: m.department,
          activeAlerts: m._count.alerts,
          pendingTasks: m._count.maintenanceTasks,
        }));
      }
      case 'run_machine_diagnostics': {
        let targetId = args?.machineId;
        if (!targetId && args?.machineName) {
          const found = await prisma.machine.findFirst({
            where: { name: { contains: args.machineName, mode: 'insensitive' } },
          });
          targetId = found?.id;
        }
        if (!targetId) {
          const firstAtRisk = await prisma.machine.findFirst({
            orderBy: { healthScore: 'asc' },
          });
          targetId = firstAtRisk?.id;
        }
        if (!targetId) return { error: 'No machines found in database.' };
        const [diag, rul] = await Promise.all([
          runDiagnosticAgent(targetId, { autoCreateAlert: Boolean(args?.autoCreateAlert), userId }),
          runPredictiveRulAgent(targetId, { persistPrediction: true, userId }),
        ]);
        return { diagnostic: diag, rulForecast: rul };
      }
      case 'dispatch_maintenance_task': {
        let targetId = args?.machineId;
        if (!targetId && args?.machineName) {
          const found = await prisma.machine.findFirst({
            where: { name: { contains: args.machineName, mode: 'insensitive' } },
          });
          targetId = found?.id;
        }
        const report = await runMaintenanceDispatcherAgent({ machineId: targetId, userId });
        return report;
      }
      case 'acknowledge_active_alerts': {
        const updated = await prisma.alert.updateMany({
          where: {
            status: 'ACTIVE',
            ...(args?.machineId ? { machineId: args.machineId } : {}),
          },
          data: {
            status: 'ACKNOWLEDGED',
            acknowledgedBy: userId,
            acknowledgedAt: new Date(),
          },
        });
        return { acknowledgedCount: updated.count };
      }
      default:
        return { error: `Unknown tool: ${name}` };
    }
  };

  const client = getGenAIClient();
  if (client) {
    try {
      const toolDeclarations: any[] = [
        {
          type: 'function',
          name: 'get_fleet_summary',
          description:
            'Gets a complete summary of the industrial fleet, including machine health counts, active alerts, pending tasks, top risks, and shift action items.',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
        {
          type: 'function',
          name: 'list_machines',
          description:
            'Lists all industrial machines in the plant ordered by lowest health score first, including their IDs, status, healthScore, and active alert counts.',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
        {
          type: 'function',
          name: 'run_machine_diagnostics',
          description:
            'Runs the Anomaly Diagnostic Agent and Predictive RUL Agent on a specific machine by machineId or machineName.',
          parameters: {
            type: 'object',
            properties: {
              machineId: { type: 'string', description: 'Optional UUID of the machine' },
              machineName: { type: 'string', description: 'Optional name of the machine' },
              autoCreateAlert: {
                type: 'boolean',
                description: 'Whether to auto-create an alert if anomalies are found',
              },
            },
          },
        },
        {
          type: 'function',
          name: 'dispatch_maintenance_task',
          description:
            'Invokes the Autonomous Maintenance Dispatcher Agent to create prioritized maintenance work orders for a specific machine or all at-risk machines.',
          parameters: {
            type: 'object',
            properties: {
              machineId: { type: 'string', description: 'Optional UUID of a specific machine' },
              machineName: { type: 'string', description: 'Optional name of a specific machine' },
            },
          },
        },
        {
          type: 'function',
          name: 'acknowledge_active_alerts',
          description: 'Acknowledges all active alerts across the fleet or for a specific machineId.',
          parameters: {
            type: 'object',
            properties: {
              machineId: { type: 'string', description: 'Optional UUID of the machine' },
            },
          },
        },
      ];

      const systemInstruction =
        'You are the Octopus Operations Copilot, an expert industrial predictive maintenance AI assistant. Use the provided tools whenever the user asks about machines, alerts, diagnostics, RUL predictions, shift briefings, or scheduling maintenance. Format responses clearly with bullet points and actionable metrics.';

      let interaction = await client.interactions.create({
        model: GEMINI_MODEL,
        system_instruction: systemInstruction,
        input: message,
        tools: toolDeclarations,
        ...(previousInteractionId ? { previous_interaction_id: previousInteractionId } : {}),
      });

      // Handle function_call steps (up to 3 rounds)
      let rounds = 0;
      while (rounds < 3 && interaction.steps) {
        const functionCalls = interaction.steps.filter((s: any) => s.type === 'function_call');
        if (functionCalls.length === 0) break;

        const functionResults: any[] = [];
        for (const call of functionCalls as any[]) {
          const toolOutput = await executeAgentTool(call.name, call.arguments || {});
          functionResults.push({
            type: 'function_result',
            call_id: call.id,
            name: call.name,
            result: [{ type: 'text', text: JSON.stringify(toolOutput) }],
          });
        }

        interaction = await client.interactions.create({
          model: GEMINI_MODEL,
          system_instruction: systemInstruction,
          previous_interaction_id: interaction.id,
          tools: toolDeclarations,
          input: functionResults,
        });
        rounds++;
      }

      if (interaction.output_text) {
        return {
          agentId: 'copilot-agent',
          interactionId: interaction.id,
          reply: interaction.output_text,
          toolsUsed,
          suggestedFollowUps: [
            'Run diagnostics on the lowest-health machine',
            'Auto-dispatch maintenance tasks for critical machines',
            'Generate a shift handover briefing',
          ],
          aiEngine: 'gemini-3.8-flash',
        };
      }
    } catch (err) {
      console.warn('Gemini Copilot Agent fallback triggered:', err);
    }
  }

  // Intelligent tool-assisted fallback when GEMINI_API_KEY is not configured
  const lower = message.toLowerCase();
  if (lower.includes('dispatch') || lower.includes('schedule') || lower.includes('work order')) {
    const dispatch = await executeAgentTool('dispatch_maintenance_task', {});
    return {
      agentId: 'copilot-agent',
      reply: `### Autonomous Maintenance Dispatcher Executed\n- **Summary**: ${dispatch.summary}\n- **Work Orders Created**: ${dispatch.tasksCreatedCount}\n${dispatch.dispatchedTasks
        .map(
          (d: any) =>
            `  - **${d.machineName}**: *${d.task.title}* (Priority: \`${d.task.priority}\`, Assigned: ${
              d.assignedOperatorName || 'Unassigned'
            })`
        )
        .join('\n')}`,
      toolsUsed,
      suggestedFollowUps: [
        'Show fleet shift briefing',
        'Run diagnostics on critical machines',
        'Acknowledge all active alerts',
      ],
      aiEngine: 'hybrid-ml-heuristic',
    };
  }

  if (lower.includes('diagnos') || lower.includes('rul') || lower.includes('predict') || lower.includes('anomaly')) {
    const res = await executeAgentTool('run_machine_diagnostics', {});
    if (res.error) {
      return {
        agentId: 'copilot-agent',
        reply: res.error,
        toolsUsed,
        suggestedFollowUps: ['Show fleet shift briefing'],
        aiEngine: 'hybrid-ml-heuristic',
      };
    }
    const { diagnostic, rulForecast } = res;
    return {
      agentId: 'copilot-agent',
      reply: `### Diagnostic & RUL Forecast for **${diagnostic.machineName}**\n- **Overall Status**: \`${diagnostic.overallStatus}\` (Health Score: **${diagnostic.healthScore}%**)\n- **Estimated RUL**: **${rulForecast.rulDays} days** (Failure Probability: **${(
        rulForecast.failureProbability * 100
      ).toFixed(1)}%**, Risk Score: **${rulForecast.riskScore}/100**)\n- **Root Causes**:\n${diagnostic.rootCauses
        .map((c: string) => `  - ${c}`)
        .join('\n')}\n- **Recommended Actions**:\n${diagnostic.recommendedActions
        .map((a: string) => `  - ${a}`)
        .join('\n')}`,
      toolsUsed,
      suggestedFollowUps: [
        'Auto-dispatch maintenance tasks for critical machines',
        'Generate a shift handover briefing',
        'Acknowledge all active alerts',
      ],
      aiEngine: 'hybrid-ml-heuristic',
    };
  }

  if (lower.includes('acknowledge') && lower.includes('alert')) {
    const res = await executeAgentTool('acknowledge_active_alerts', {});
    return {
      agentId: 'copilot-agent',
      reply: `Acknowledged **${res.acknowledgedCount}** active alert(s) across the fleet.`,
      toolsUsed,
      suggestedFollowUps: ['Show fleet shift briefing', 'Run diagnostics on at-risk machine'],
      aiEngine: 'hybrid-ml-heuristic',
    };
  }

  // Default: Fleet summary & machine overview
  const briefing = await executeAgentTool('get_fleet_summary', {});
  return {
    agentId: 'copilot-agent',
    reply: `### Octopus Operations Copilot — Fleet Intelligence\n${briefing.executiveSummary}\n\n**Key Metrics:**\n- **Machines**: ${briefing.keyMetrics.totalMachines} total (${briefing.keyMetrics.healthyMachines} Healthy, ${briefing.keyMetrics.warningMachines} Warning, ${briefing.keyMetrics.criticalMachines} Critical)\n- **Active Alerts**: ${briefing.keyMetrics.activeAlerts} | **Pending Maintenance**: ${briefing.keyMetrics.pendingTasks}\n\n**Prioritized Shift Action Items:**\n${briefing.shiftActionItems
      .map((item: string) => `- ${item}`)
      .join('\n')}`,
    toolsUsed,
    suggestedFollowUps: [
      'Run diagnostics and RUL forecast on the most critical machine',
      'Dispatch maintenance work orders automatically',
      'Acknowledge all active alerts',
    ],
    aiEngine: 'hybrid-ml-heuristic',
  };
}
