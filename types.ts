export enum ValueMethod {
  COST_DISPLACEMENT = 'Cost Displacement',
  REVENUE_UPLIFT = 'Revenue Uplift',
  RETENTION = 'Retention Uplift',
  PREMIUM_MONETIZATION = 'Premium Monetization',
}

export interface ModelParams {
  avgInputTokensPerUnit: number;
  avgOutputTokensPerUnit: number;
  pricePer1MInputTokens: number;
  pricePer1MOutputTokens: number;
  costPerCall: number; // Alternative to token-based
  useCallPricing: boolean;
}

export interface SensitivityModifiers {
  volumeMultiplier: number;
  successRateMultiplier: number;
  costMultiplier: number;
  valueMultiplier: number;
}

export interface UseCaseInputs {
  // 1. General
  useCaseName: string;
  unitName: string;
  monthlyVolume: number;
  successRate: number; // 0-100
  analysisHorizonMonths: number;

  // 2. Fixed Costs
  integrationCost: number;
  trainingTuningCost: number;
  changeManagementCost: number;
  amortizationMonths: number;

  // 3. Layer 1: Model
  primaryModel: ModelParams;
  secondaryModel: ModelParams;
  routingSimplePercent: number; // 0-100% goes to primary (simple), rest to secondary (complex)
  cacheHitRate: number; // 0-100
  cachedTokenDiscount: number; // 0-100

  // 4. Layer 2: Harness (Per Unit)
  orchestrationCostPerUnit: number;
  retrievalCostPerUnit: number;
  toolApiCostPerUnit: number;
  loggingMonitoringCostPerUnit: number;
  safetyGuardrailsCostPerUnit: number;
  networkEgressCostPerUnit: number;
  storageCostPerUnit: number;
  
  // L2 Multipliers
  retryRate: number; // 0-1.0 (e.g. 0.2 = 20%)
  overheadMultiplier: number; // e.g. 1.1 = 10% overhead

  // 5. Layer 3: Value
  valueMethod: ValueMethod;

  // A) Cost Displacement
  baselineHumanCostPerUnit: number;
  deflectionRate: number; // 0-100
  residualHumanReviewRate: number; // 0-100
  residualReviewCostPerUnit: number;

  // B) Revenue Uplift
  baselineConversionRate: number; // 0-100
  conversionUpliftAbsolute: number; // Percentage points
  averageOrderValue: number;
  grossMargin: number; // 0-100

  // C) Retention
  baselineChurnRate: number; // 0-100
  churnReductionAbsolute: number; // Percentage points
  annualValuePerCustomer: number;
  customersImpactedPerMonth: number;

  // D) Premium Monetization
  pricePerSubscriberPerMonth: number;
  subscribers: number;
  nonAiCOGSPerSubscriber: number;
}

export interface CalculationResults {
  effectiveMonthlyVolume: number;
  
  // Layer 1
  layer1CostPerUnit: number;
  layer1MonthlyCost: number;

  // Layer 2
  layer2CostPerUnit: number;
  layer2MonthlyCost: number;

  // Fixed Costs
  monthlyAmortizedFixedCost: number;
  totalFixedCost: number;

  // Totals
  totalMonthlyCost: number;
  totalCostPerUnit: number;

  // Value
  grossValuePerUnit: number;
  netValuePerUnit: number; // After success rate adjustment
  totalMonthlyValue: number;

  // ROI Metrics
  netMonthlyBenefit: number;
  annualizedNetBenefit: number;
  roiPercentage: number;
  paybackMonths: number | string;
}