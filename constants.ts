import { UseCaseInputs, ValueMethod } from './types';

export const DEFAULT_MODEL_PARAMS = {
  avgInputTokensPerUnit: 1000,
  avgOutputTokensPerUnit: 500,
  pricePer1MInputTokens: 0.15,
  pricePer1MOutputTokens: 0.60,
  costPerCall: 0.005,
  useCallPricing: false,
};

export const DEFAULT_INPUTS: UseCaseInputs = {
  useCaseName: 'New AI Project',
  unitName: 'transaction',
  monthlyVolume: 10000,
  successRate: 95,
  analysisHorizonMonths: 12,

  integrationCost: 5000,
  trainingTuningCost: 2000,
  changeManagementCost: 1000,
  amortizationMonths: 12,

  primaryModel: { ...DEFAULT_MODEL_PARAMS },
  secondaryModel: { ...DEFAULT_MODEL_PARAMS, pricePer1MInputTokens: 2.5, pricePer1MOutputTokens: 10 },
  routingSimplePercent: 100,
  cacheHitRate: 10,
  cachedTokenDiscount: 90,

  orchestrationCostPerUnit: 0.001,
  retrievalCostPerUnit: 0.002,
  toolApiCostPerUnit: 0.0,
  loggingMonitoringCostPerUnit: 0.0005,
  safetyGuardrailsCostPerUnit: 0.0005,
  networkEgressCostPerUnit: 0.0001,
  storageCostPerUnit: 0.0001,
  
  retryRate: 0.1,
  overheadMultiplier: 1.0,

  valueMethod: ValueMethod.COST_DISPLACEMENT,

  baselineHumanCostPerUnit: 1.00,
  deflectionRate: 40,
  residualHumanReviewRate: 10,
  residualReviewCostPerUnit: 0.50,

  baselineConversionRate: 2.5,
  conversionUpliftAbsolute: 0.5,
  averageOrderValue: 100,
  grossMargin: 60,

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
    monthlyVolume: 500,
    successRate: 90,
    integrationCost: 2000,
    trainingTuningCost: 1000,
    changeManagementCost: 500,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 0.50,
    deflectionRate: 35,
    residualHumanReviewRate: 5,
    residualReviewCostPerUnit: 0.10,
    retryRate: 0.1,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 1500,
        avgOutputTokensPerUnit: 500,
        pricePer1MInputTokens: 0.15,
        pricePer1MOutputTokens: 0.60
    }
  },
  knowledgeQA: {
    useCaseName: 'Knowledge Q&A',
    unitName: 'query',
    monthlyVolume: 5000,
    successRate: 90,
    integrationCost: 3000,
    trainingTuningCost: 2000,
    changeManagementCost: 500,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 2.00,
    deflectionRate: 60,
    residualHumanReviewRate: 10,
    residualReviewCostPerUnit: 0.75,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 2000,
        avgOutputTokensPerUnit: 800,
        pricePer1MInputTokens: 0.15,
        pricePer1MOutputTokens: 0.60
    },
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
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 10000,
        avgOutputTokensPerUnit: 1200,
        pricePer1MInputTokens: 0.15,
        pricePer1MOutputTokens: 0.60
    }
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
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 2500,
        avgOutputTokensPerUnit: 1800,
        pricePer1MInputTokens: 3.00,
        pricePer1MOutputTokens: 15.00
    }
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
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 3000,
        avgOutputTokensPerUnit: 2000,
        pricePer1MInputTokens: 2.50,
        pricePer1MOutputTokens: 10.00
    },
    orchestrationCostPerUnit: 0.005,
    toolApiCostPerUnit: 0.01
  },
  invoice: {
    useCaseName: 'Invoice Processing',
    unitName: 'invoice',
    monthlyVolume: 5000,
    successRate: 98,
    integrationCost: 5000,
    trainingTuningCost: 2000,
    changeManagementCost: 1000,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 2.50,
    deflectionRate: 90,
    residualHumanReviewRate: 15,
    residualReviewCostPerUnit: 0.80,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 1500,
        avgOutputTokensPerUnit: 600,
        pricePer1MInputTokens: 3.00,
        pricePer1MOutputTokens: 15.00
    },
    orchestrationCostPerUnit: 0.01,
    retrievalCostPerUnit: 0.005
  },
  callSummary: {
    useCaseName: 'Call Summary',
    unitName: 'call',
    monthlyVolume: 2000,
    successRate: 95,
    integrationCost: 3000,
    trainingTuningCost: 1000,
    changeManagementCost: 500,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 3.00,
    deflectionRate: 85,
    residualHumanReviewRate: 10,
    residualReviewCostPerUnit: 0.75,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 2000,
        avgOutputTokensPerUnit: 700,
        pricePer1MInputTokens: 0.15,
        pricePer1MOutputTokens: 0.60
    }
  },
  agentWorkflow: {
    useCaseName: 'Agent Workflow',
    unitName: 'workflow',
    monthlyVolume: 500,
    successRate: 80,
    integrationCost: 10000,
    trainingTuningCost: 5000,
    changeManagementCost: 3000,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 15.00,
    deflectionRate: 55,
    residualHumanReviewRate: 25,
    residualReviewCostPerUnit: 4.00,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 6000,
        avgOutputTokensPerUnit: 3000,
        pricePer1MInputTokens: 2.50,
        pricePer1MOutputTokens: 10.00
    },
    orchestrationCostPerUnit: 0.01,
    retrievalCostPerUnit: 0.005,
    toolApiCostPerUnit: 0.02
  },
  recommendation: {
    useCaseName: 'E-commerce Recommendations',
    unitName: 'session',
    monthlyVolume: 100000,
    successRate: 100,
    integrationCost: 8000,
    trainingTuningCost: 3000,
    changeManagementCost: 1000,
    valueMethod: ValueMethod.REVENUE_UPLIFT,
    baselineConversionRate: 3.0,
    conversionUpliftAbsolute: 0.2,
    averageOrderValue: 85,
    grossMargin: 45,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 400,
        avgOutputTokensPerUnit: 200,
        pricePer1MInputTokens: 0.15,
        pricePer1MOutputTokens: 0.60
    },
    retrievalCostPerUnit: 0.001
  },
  retention: {
    useCaseName: 'Customer Retention AI',
    unitName: 'customer',
    monthlyVolume: 10000,
    successRate: 85,
    integrationCost: 8000,
    trainingTuningCost: 5000,
    changeManagementCost: 2000,
    valueMethod: ValueMethod.RETENTION,
    baselineChurnRate: 2.5,
    churnReductionAbsolute: 0.5,
    annualValuePerCustomer: 1200,
    customersImpactedPerMonth: 10000,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 1200,
        avgOutputTokensPerUnit: 400,
        pricePer1MInputTokens: 0.15,
        pricePer1MOutputTokens: 0.60
    },
    orchestrationCostPerUnit: 0.002,
    retrievalCostPerUnit: 0.003
  },
  premium: {
    useCaseName: 'AI Premium Features',
    unitName: 'subscriber',
    monthlyVolume: 5000,
    successRate: 100,
    integrationCost: 15000,
    trainingTuningCost: 8000,
    changeManagementCost: 3000,
    valueMethod: ValueMethod.PREMIUM_MONETIZATION,
    pricePerSubscriberPerMonth: 15,
    subscribers: 5000,
    nonAiCOGSPerSubscriber: 3,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 2000,
        avgOutputTokensPerUnit: 800,
        pricePer1MInputTokens: 1.00,
        pricePer1MOutputTokens: 5.00
    },
    orchestrationCostPerUnit: 0.005,
    retrievalCostPerUnit: 0.01,
    loggingMonitoringCostPerUnit: 0.002
  }
};