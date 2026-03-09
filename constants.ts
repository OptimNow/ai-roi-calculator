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

  baselineHumanCostPerUnit: 5.00,
  deflectionRate: 40,
  residualHumanReviewRate: 10,
  residualReviewCostPerUnit: 2.50,

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
    monthlyVolume: 10000,
    successRate: 90,
    integrationCost: 2000,
    trainingTuningCost: 1000,
    changeManagementCost: 500,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 1.00,
    deflectionRate: 35,
    residualHumanReviewRate: 5,
    residualReviewCostPerUnit: 0.20,
    retryRate: 0.1,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 800,
        avgOutputTokensPerUnit: 300,
        pricePer1MInputTokens: 0.15,
        pricePer1MOutputTokens: 0.60
    }
  },
  knowledgeQA: {
    useCaseName: 'Knowledge Q&A',
    unitName: 'query',
    monthlyVolume: 1000,
    successRate: 90,
    integrationCost: 4000,
    trainingTuningCost: 2000,
    changeManagementCost: 1000,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 8.00,
    deflectionRate: 60,
    residualHumanReviewRate: 10,
    residualReviewCostPerUnit: 3.00,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 1000,
        avgOutputTokensPerUnit: 500,
        pricePer1MInputTokens: 0.15,
        pricePer1MOutputTokens: 0.60
    },
    retrievalCostPerUnit: 0.003
  },
  meetingSummary: {
    useCaseName: 'Meeting Summary',
    unitName: 'meeting',
    monthlyVolume: 500,
    successRate: 95,
    integrationCost: 3000,
    trainingTuningCost: 1000,
    changeManagementCost: 500,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 12.00,
    deflectionRate: 80,
    residualHumanReviewRate: 15,
    residualReviewCostPerUnit: 3.00,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 4000,
        avgOutputTokensPerUnit: 600,
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
    trainingTuningCost: 1500,
    changeManagementCost: 500,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 50.00,
    deflectionRate: 50,
    residualHumanReviewRate: 40,
    residualReviewCostPerUnit: 15.00,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 800,
        avgOutputTokensPerUnit: 1500,
        pricePer1MInputTokens: 0.50,
        pricePer1MOutputTokens: 1.50
    }
  },
  codingTask: {
    useCaseName: 'Coding Task',
    unitName: 'task',
    monthlyVolume: 1000,
    successRate: 85,
    integrationCost: 3000,
    trainingTuningCost: 2000,
    changeManagementCost: 1000,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 25.00,
    deflectionRate: 45,
    residualHumanReviewRate: 30,
    residualReviewCostPerUnit: 8.00,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 1200,
        avgOutputTokensPerUnit: 800,
        pricePer1MInputTokens: 0.50,
        pricePer1MOutputTokens: 1.50
    },
    orchestrationCostPerUnit: 0.003
  },
  invoice: {
    useCaseName: 'Invoice Processing',
    unitName: 'invoice',
    monthlyVolume: 10000,
    successRate: 98,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 15.00,
    deflectionRate: 90,
    residualHumanReviewRate: 15,
    residualReviewCostPerUnit: 5.00,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 2500,
        avgOutputTokensPerUnit: 100,
        pricePer1MInputTokens: 5.00,
        pricePer1MOutputTokens: 15.00
    },
    orchestrationCostPerUnit: 0.01,
    retrievalCostPerUnit: 0.005
  },
  callSummary: {
    useCaseName: 'Call Summary',
    unitName: 'call',
    monthlyVolume: 500,
    successRate: 95,
    integrationCost: 3000,
    trainingTuningCost: 1000,
    changeManagementCost: 500,
    valueMethod: ValueMethod.COST_DISPLACEMENT,
    baselineHumanCostPerUnit: 10.00,
    deflectionRate: 85,
    residualHumanReviewRate: 10,
    residualReviewCostPerUnit: 2.50,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 4000,
        avgOutputTokensPerUnit: 600,
        pricePer1MInputTokens: 0.15,
        pricePer1MOutputTokens: 0.60
    }
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
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 2000,
        avgOutputTokensPerUnit: 1000,
        pricePer1MInputTokens: 0.50,
        pricePer1MOutputTokens: 1.50
    },
    orchestrationCostPerUnit: 0.005,
    retrievalCostPerUnit: 0.005,
    toolApiCostPerUnit: 0.01
  },
  recommendation: {
    useCaseName: 'E-commerce Recommendations',
    unitName: 'session',
    monthlyVolume: 100000,
    successRate: 100,
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
    monthlyVolume: 1000,
    successRate: 100,
    integrationCost: 15000,
    trainingTuningCost: 8000,
    changeManagementCost: 3000,
    valueMethod: ValueMethod.PREMIUM_MONETIZATION,
    pricePerSubscriberPerMonth: 15,
    subscribers: 1000,
    nonAiCOGSPerSubscriber: 3,
    primaryModel: {
        ...DEFAULT_MODEL_PARAMS,
        avgInputTokensPerUnit: 2000,
        avgOutputTokensPerUnit: 800,
        pricePer1MInputTokens: 0.50,
        pricePer1MOutputTokens: 1.50
    },
    orchestrationCostPerUnit: 0.005,
    retrievalCostPerUnit: 0.01,
    loggingMonitoringCostPerUnit: 0.002
  }
};