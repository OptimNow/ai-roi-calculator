import type { UseCaseInputs } from './types';
import { ValueMethod } from './types';
import { presetModel } from './utils/modelCatalog';

// Preset model params come from the embedded OptimToken snapshot (utils/modelCatalog.ts),
// so every preset carries a real model identity (modelId, provider, pricedAt) and its
// published cache-read / batch prices. Token profiles (in/out) and cache hit rates are
// aligned with the hub's business use-case profiles (USE_CASE_PROFILES).

export const DEFAULT_INPUTS: UseCaseInputs = {
  useCaseName: 'Customer Support Bot',
  unitName: 'ticket',
  monthlyVolume: 10000,
  successRate: 90,
  analysisHorizonMonths: 12,

  integrationCost: 8000,
  trainingTuningCost: 3000,
  changeManagementCost: 2000,
  amortizationMonths: 12,

  primaryModel: presetModel('Anthropic', 'Claude Haiku 4.5', 1500, 500),
  secondaryModel: presetModel('Anthropic', 'Claude Sonnet 5', 1500, 500),
  routingSimplePercent: 100,
  cacheHitRate: 60,
  cachedTokenDiscount: 90,
  batchProcessing: false,

  orchestrationCostPerUnit: 0.002,
  retrievalCostPerUnit: 0.0015,
  toolApiCostPerUnit: 0.0003,
  loggingMonitoringCostPerUnit: 0.0008,
  safetyGuardrailsCostPerUnit: 0.0005,
  networkEgressCostPerUnit: 0.0002,
  storageCostPerUnit: 0.0002,

  retryRate: 0.1,
  overheadMultiplier: 1.0,

  valueMethod: ValueMethod.COST_DISPLACEMENT,

  baselineHumanCostPerUnit: 0.50,
  deflectionRate: 35,
  residualHumanReviewRate: 5,
  residualReviewCostPerUnit: 0.10,

  baselineConversionRate: 3.0,
  conversionUpliftAbsolute: 0.2,
  averageOrderValue: 85,
  grossMargin: 45,

  baselineChurnRate: 1.0,
  churnReductionAbsolute: 0.1,
  annualValuePerCustomer: 1200,
  customersImpactedPerMonth: 1000,

  pricePerSubscriberPerMonth: 20,
  subscribers: 500,
  nonAiCOGSPerSubscriber: 2,
};

export const PRESETS: Record<string, Partial<UseCaseInputs>> = {
  support: {
    useCaseName: 'Customer Support Bot',
    unitName: 'ticket',
    monthlyVolume: 10000,
    successRate: 90,
    // SMB support rollout: CRM/ticketing integration, KB setup, routing, guardrails tuning, agent enablement
    integrationCost: 8000,
    trainingTuningCost: 3000,
    changeManagementCost: 2000,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 0.50,
    deflectionRate: 35,
    residualHumanReviewRate: 5,
    residualReviewCostPerUnit: 0.10,
    retryRate: 0.1,
    primaryModel: presetModel('Anthropic', 'Claude Haiku 4.5', 1500, 500),
    cacheHitRate: 60,
    batchProcessing: false,
    // Harness assumptions: bot orchestration, KB retrieval, observability and baseline safety controls
    orchestrationCostPerUnit: 0.002,
    retrievalCostPerUnit: 0.0015,
    toolApiCostPerUnit: 0.0003,
    loggingMonitoringCostPerUnit: 0.0008,
    safetyGuardrailsCostPerUnit: 0.0005,
    networkEgressCostPerUnit: 0.0002,
    storageCostPerUnit: 0.0002
  },
  knowledgeQA: {
    useCaseName: 'Knowledge Q&A',
    unitName: 'query',
    monthlyVolume: 1000,
    successRate: 90,
    integrationCost: 3000,
    trainingTuningCost: 2000,
    changeManagementCost: 500,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 2.00,
    deflectionRate: 60,
    residualHumanReviewRate: 10,
    residualReviewCostPerUnit: 0.75,
    primaryModel: presetModel('Anthropic', 'Claude Haiku 4.5', 2000, 800),
    cacheHitRate: 70,
    batchProcessing: false,
    retrievalCostPerUnit: 0.005
  },
  meetingSummary: {
    useCaseName: 'Meeting Summary',
    unitName: 'meeting',
    monthlyVolume: 500,
    successRate: 95,
    integrationCost: 2000,
    trainingTuningCost: 1000,
    changeManagementCost: 500,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 5.00,
    deflectionRate: 80,
    residualHumanReviewRate: 20,
    residualReviewCostPerUnit: 1.00,
    primaryModel: presetModel('Google', 'Gemini 3.7 Flash', 10000, 1200),
    cacheHitRate: 10,
    batchProcessing: true // transcripts are processed async — batch API rates apply
  },
  marketingContent: {
    useCaseName: 'Marketing Content',
    unitName: 'piece',
    monthlyVolume: 200,
    successRate: 85,
    integrationCost: 2000,
    trainingTuningCost: 3000,
    changeManagementCost: 1000,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 10.00,
    deflectionRate: 60,
    residualHumanReviewRate: 40,
    residualReviewCostPerUnit: 3.00,
    primaryModel: presetModel('Anthropic', 'Claude Sonnet 5', 2500, 1800),
    cacheHitRate: 20,
    batchProcessing: false
  },
  codingTask: {
    useCaseName: 'Coding Task',
    unitName: 'task',
    monthlyVolume: 1000,
    successRate: 80,
    integrationCost: 5000,
    trainingTuningCost: 3000,
    changeManagementCost: 2000,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 8.00,
    deflectionRate: 50,
    residualHumanReviewRate: 30,
    residualReviewCostPerUnit: 3.00,
    primaryModel: presetModel('Anthropic', 'Claude Sonnet 5', 3000, 2000),
    cacheHitRate: 50,
    batchProcessing: false,
    orchestrationCostPerUnit: 0.005,
    toolApiCostPerUnit: 0.01
  },
  invoice: {
    useCaseName: 'Invoice Processing',
    unitName: 'invoice',
    monthlyVolume: 10000,
    successRate: 98,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    // Assumption: specialist in India at ~$4/hour and ~10 invoices/hour => ~$0.40 per invoice
    baselineHumanCostPerUnit: 0.40,
    deflectionRate: 90,
    residualHumanReviewRate: 15,
    // Review step is faster/partial vs full processing
    residualReviewCostPerUnit: 0.20,
    integrationCost: 15000,
    trainingTuningCost: 6000,
    changeManagementCost: 4000,
    // Vision-capable frontier model for document extraction accuracy
    primaryModel: presetModel('OpenAI', 'GPT-5.4', 1500, 600),
    cacheHitRate: 30,
    batchProcessing: true, // invoices are processed in async batches
    // Harness assumptions for enterprise document workflow:
    // orchestration (state + retries), OCR/RAG retrieval, compliance logging, storage and egress
    orchestrationCostPerUnit: 0.004,
    retrievalCostPerUnit: 0.003,
    toolApiCostPerUnit: 0.0015,
    loggingMonitoringCostPerUnit: 0.001,
    safetyGuardrailsCostPerUnit: 0.0007,
    networkEgressCostPerUnit: 0.0002,
    storageCostPerUnit: 0.0005
  },
  callSummary: {
    useCaseName: 'Call Summary',
    unitName: 'call',
    // A contact centre that justifies telephony/CRM integration handles thousands
    // of calls a month; at 500 the setup cost alone was $0.75 of a $0.76 unit cost.
    monthlyVolume: 10000,
    successRate: 95,
    integrationCost: 3000,
    trainingTuningCost: 1000,
    changeManagementCost: 500,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    // A few minutes of agent time at a support-team loaded rate. Writing up a call
    // is a short task, unlike summarising a 45-minute meeting.
    baselineHumanCostPerUnit: 1.00,
    deflectionRate: 85,
    residualHumanReviewRate: 10,
    // Skimming a summary costs a quarter of writing one from scratch
    residualReviewCostPerUnit: 0.25,
    primaryModel: presetModel('Google', 'Gemini 3.7 Flash', 2000, 700),
    cacheHitRate: 10,
    batchProcessing: true // call recordings are summarized async
  },
  agentWorkflow: {
    useCaseName: 'Agent Workflow',
    unitName: 'workflow',
    monthlyVolume: 500,
    successRate: 75,
    integrationCost: 10000,
    trainingTuningCost: 5000,
    changeManagementCost: 2000,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 30.00,
    deflectionRate: 55,
    residualHumanReviewRate: 25,
    residualReviewCostPerUnit: 10.00,
    primaryModel: presetModel('Moonshot', 'Kimi K2.6', 6000, 3000),
    cacheHitRate: 70, // agent loops re-send large shared context
    batchProcessing: false,
    orchestrationCostPerUnit: 0.005,
    retrievalCostPerUnit: 0.005,
    toolApiCostPerUnit: 0.01
  },
  recommendation: {
    useCaseName: 'E-commerce Recommendations',
    unitName: 'Order',
    monthlyVolume: 100000,
    successRate: 100,
    valueMethod: ValueMethod.REVENUE_UPLIFT,
    baselineConversionRate: 3.0,
    conversionUpliftAbsolute: 0.2,
    averageOrderValue: 85,
    grossMargin: 45,
    // Mid-market e-commerce rollout: catalog/data integration, experimentation, and merchandising adoption
    integrationCost: 30000,
    trainingTuningCost: 12000,
    changeManagementCost: 8000,
    primaryModel: presetModel('DeepSeek', 'DeepSeek V4 Flash 0423', 1200, 300),
    cacheHitRate: 20,
    batchProcessing: false, // real-time recommendations
    // Harness assumptions: ranking orchestration, retrieval over product/session features, monitoring and safety
    orchestrationCostPerUnit: 0.003,
    retrievalCostPerUnit: 0.004,
    toolApiCostPerUnit: 0.0005,
    loggingMonitoringCostPerUnit: 0.001,
    safetyGuardrailsCostPerUnit: 0.0008,
    networkEgressCostPerUnit: 0.0003,
    storageCostPerUnit: 0.0002
  },
  retention: {
    useCaseName: 'Customer Retention AI',
    unitName: 'customer',
    monthlyVolume: 10000,
    successRate: 85,
    // Retention program rollout: CRM/CDP integration, propensity tuning, and lifecycle-team enablement
    integrationCost: 20000,
    trainingTuningCost: 9000,
    changeManagementCost: 6000,
    valueMethod: ValueMethod.RETENTION,
    baselineChurnRate: 2.5,
    churnReductionAbsolute: 0.5,
    annualValuePerCustomer: 1200,
    customersImpactedPerMonth: 10000,
    primaryModel: presetModel('MiniMax', 'MiniMax M3', 1200, 400),
    cacheHitRate: 20,
    batchProcessing: true, // churn scoring runs as async batches
    // Harness assumptions: journey orchestration, customer-history retrieval, messaging tooling, and governance
    orchestrationCostPerUnit: 0.003,
    retrievalCostPerUnit: 0.004,
    toolApiCostPerUnit: 0.001,
    loggingMonitoringCostPerUnit: 0.0012,
    safetyGuardrailsCostPerUnit: 0.001,
    networkEgressCostPerUnit: 0.0003,
    storageCostPerUnit: 0.0004
  },
  premium: {
    useCaseName: 'AI Premium Features',
    unitName: 'subscriber',
    monthlyVolume: 1000,
    successRate: 100,
    // Premium feature launch: product integration, monetization experiments, go-to-market and support enablement
    integrationCost: 35000,
    trainingTuningCost: 15000,
    changeManagementCost: 10000,
    valueMethod: ValueMethod.PREMIUM_MONETIZATION,
    pricePerSubscriberPerMonth: 15,
    subscribers: 1000,
    nonAiCOGSPerSubscriber: 3,
    primaryModel: presetModel('Anthropic', 'Claude Haiku 4.5', 2000, 800),
    cacheHitRate: 30,
    batchProcessing: false,
    // Harness assumptions: entitlement-aware orchestration, retrieval/tool calls, observability and safety at scale
    orchestrationCostPerUnit: 0.006,
    retrievalCostPerUnit: 0.008,
    toolApiCostPerUnit: 0.0025,
    loggingMonitoringCostPerUnit: 0.0022,
    safetyGuardrailsCostPerUnit: 0.0015,
    networkEgressCostPerUnit: 0.0005,
    storageCostPerUnit: 0.0008
  }
};
