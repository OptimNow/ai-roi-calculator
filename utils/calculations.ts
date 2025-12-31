import { UseCaseInputs, CalculationResults, SensitivityModifiers, ValueMethod, ModelParams } from '../types';

/**
 * Calculates the cost per unit for a single model (token-based or call-based pricing).
 *
 * @param params - Model parameters including token counts and pricing
 * @param modifiers - Sensitivity modifiers to apply to costs
 * @returns Cost per unit in USD
 *
 * @example
 * ```ts
 * const cost = calculateModelCost({
 *   avgInputTokensPerUnit: 1000,
 *   avgOutputTokensPerUnit: 500,
 *   pricePer1MInputTokens: 0.15,
 *   pricePer1MOutputTokens: 0.60,
 *   useCallPricing: false
 * }, { costMultiplier: 1.5, ... });
 * // Returns: 0.000675 (with 1.5x multiplier)
 * ```
 */
const calculateModelCost = (params: ModelParams, modifiers: SensitivityModifiers): number => {
  if (params.useCallPricing) {
    return params.costPerCall * modifiers.costMultiplier;
  }
  const inputCost = (params.avgInputTokensPerUnit / 1_000_000) * params.pricePer1MInputTokens;
  const outputCost = (params.avgOutputTokensPerUnit / 1_000_000) * params.pricePer1MOutputTokens;
  return (inputCost + outputCost) * modifiers.costMultiplier;
};

/**
 * Calculates comprehensive ROI metrics for an AI project using a 3-layer framework.
 *
 * ## Framework Layers:
 * - **Layer 1**: Infrastructure costs (model inference, tokens)
 * - **Layer 2**: Harness costs (orchestration, retrieval, monitoring, etc.)
 * - **Layer 3**: Business value (cost displacement, revenue, retention, or premium monetization)
 *
 * ## Calculation Flow:
 * 1. Computes Layer 1 costs with model routing, caching, and retries
 * 2. Adds Layer 2 harness costs with overhead multiplier
 * 3. Calculates business value based on selected value method
 * 4. Derives ROI metrics: percentage, payback period, net benefit
 *
 * @param inputs - All calculator inputs (costs, volumes, value parameters)
 * @param modifiers - Optional sensitivity modifiers for scenario analysis (default: all 1x)
 * @returns Comprehensive calculation results including costs, value, and ROI metrics
 *
 * @example
 * ```ts
 * const results = calculateROI({
 *   monthlyVolume: 10000,
 *   successRate: 90,
 *   valueMethod: ValueMethod.COST_DISPLACEMENT,
 *   baselineHumanCostPerUnit: 5.00,
 *   deflectionRate: 40,
 *   // ... other inputs
 * });
 *
 * console.log(results.roiPercentage); // e.g., 320.5
 * console.log(results.paybackMonths); // e.g., "3.2"
 * ```
 *
 * @remarks
 * - Cache savings apply only to input tokens, not output tokens
 * - Retry rate multiplies Layer 1 costs only, not harness costs
 * - Success rate affects value realization but not base costs
 * - Payback calculation uses one-time fixed costs / net monthly benefit
 *
 * @see {@link UseCaseInputs} for complete input schema
 * @see {@link CalculationResults} for output schema
 */
export const calculateROI = (inputs: UseCaseInputs, modifiers: SensitivityModifiers = { volumeMultiplier: 1, successRateMultiplier: 1, costMultiplier: 1, valueMultiplier: 1 }): CalculationResults => {
  const {
    monthlyVolume,
    successRate,
    primaryModel,
    secondaryModel,
    routingSimplePercent,
    cacheHitRate,
    cachedTokenDiscount,
    retryRate,
    overheadMultiplier,
    amortizationMonths,
    integrationCost,
    trainingTuningCost,
    changeManagementCost
  } = inputs;

  const effectiveVolume = monthlyVolume * modifiers.volumeMultiplier;
  const effectiveSuccessRate = Math.min(100, Math.max(0, successRate * modifiers.successRateMultiplier));

  // --- Layer 1: Model Cost ---
  const primaryCost = calculateModelCost(primaryModel, modifiers);
  const secondaryCost = calculateModelCost(secondaryModel, modifiers);
  
  // Blended Base Cost
  const primaryShare = routingSimplePercent / 100;
  const secondaryShare = 1 - primaryShare;
  let blendedBaseCost = (primaryCost * primaryShare) + (secondaryCost * secondaryShare);

  // Apply Cache Savings (only to input tokens, not output)
  // Calculate input and output costs separately for proper cache handling
  const primaryInputCost = (primaryModel.avgInputTokensPerUnit / 1_000_000) * primaryModel.pricePer1MInputTokens * modifiers.costMultiplier;
  const primaryOutputCost = (primaryModel.avgOutputTokensPerUnit / 1_000_000) * primaryModel.pricePer1MOutputTokens * modifiers.costMultiplier;
  const secondaryInputCost = (secondaryModel.avgInputTokensPerUnit / 1_000_000) * secondaryModel.pricePer1MInputTokens * modifiers.costMultiplier;
  const secondaryOutputCost = (secondaryModel.avgOutputTokensPerUnit / 1_000_000) * secondaryModel.pricePer1MOutputTokens * modifiers.costMultiplier;

  // Blend by routing
  const blendedInputCost = (primaryInputCost * primaryShare) + (secondaryInputCost * secondaryShare);
  const blendedOutputCost = (primaryOutputCost * primaryShare) + (secondaryOutputCost * secondaryShare);

  // Apply cache savings only to input tokens
  const cacheSavingsFactor = (cacheHitRate / 100) * (cachedTokenDiscount / 100);
  const cachedInputCost = blendedInputCost * (1 - cacheSavingsFactor);
  const layer1CostPerUnit = cachedInputCost + blendedOutputCost;

  // --- Layer 2: Harness Cost ---
  const harnessSum = (
    inputs.orchestrationCostPerUnit +
    inputs.retrievalCostPerUnit +
    inputs.toolApiCostPerUnit +
    inputs.loggingMonitoringCostPerUnit +
    inputs.safetyGuardrailsCostPerUnit +
    inputs.networkEgressCostPerUnit +
    inputs.storageCostPerUnit
  ) * modifiers.costMultiplier;

  // Apply Retries only to Layer 1 (model inference), not harness costs
  // Retries duplicate model calls but not necessarily storage, logging, etc.
  const layer1WithRetries = layer1CostPerUnit * (1 + inputs.retryRate);

  // Apply Overhead Multiplier to combined cost
  const layer2CostPerUnit = (layer1WithRetries + harnessSum) * inputs.overheadMultiplier;

  // Fixed Costs
  const totalFixedOneTime = integrationCost + trainingTuningCost + changeManagementCost;
  const monthlyAmortizedFixedCost = totalFixedOneTime / (amortizationMonths || 12);

  // Total Monthly Cost
  const layer1MonthlyCost = layer1CostPerUnit * effectiveVolume;
  const layer2MonthlyCost = layer2CostPerUnit * effectiveVolume;
  const totalMonthlyCost = layer2MonthlyCost + monthlyAmortizedFixedCost;
  const totalCostPerUnit = totalMonthlyCost / (effectiveVolume || 1);

  // --- Layer 3: Value ---
  let grossValuePerUnit = 0;
  let totalMonthlyValue = 0;

  const successFactor = effectiveSuccessRate / 100;

  switch (inputs.valueMethod) {
    case ValueMethod.COST_DISPLACEMENT: {
      const deflectRate = Math.min(100, inputs.deflectionRate * modifiers.valueMultiplier) / 100;
      const residualRate = inputs.residualHumanReviewRate / 100;
      // Value is the human cost saved. 
      // If we deflect, we save HumanCost. But if we need residual review, we subtract that cost.
      // Math: (HumanCost * Deflect%) - (ReviewCost * Review%)
      // Note: This applies to ALL units, but "value" is only realized if successful usually?
      // Standard interpretation: Value per Unit = (HumanCost * Deflection) - (ReviewCost * ResidualReview)
      const displacementSavings = (inputs.baselineHumanCostPerUnit * deflectRate);
      const residualCost = (inputs.residualReviewCostPerUnit * residualRate);
      grossValuePerUnit = (displacementSavings - residualCost) * successFactor; 
      totalMonthlyValue = grossValuePerUnit * effectiveVolume;
      break;
    }
    case ValueMethod.REVENUE_UPLIFT: {
      // Delta Revenue = Volume * AOV * (NewConv - OldConv)
      // Value = Delta Revenue * Margin
      const oldConv = inputs.baselineConversionRate / 100;
      const upliftAbs = inputs.conversionUpliftAbsolute * modifiers.valueMultiplier; // e.g. 0.5
      const newConv = Math.min(100, inputs.baselineConversionRate + upliftAbs) / 100;
      
      const deltaConv = newConv - oldConv;
      const revenuePerUnitDelta = inputs.averageOrderValue * deltaConv;
      grossValuePerUnit = revenuePerUnitDelta * (inputs.grossMargin / 100) * successFactor;
      totalMonthlyValue = grossValuePerUnit * effectiveVolume;
      break;
    }
    case ValueMethod.RETENTION: {
        // Here unit math is tricky because churn is usually cohort based.
        // We calculate monthly value directly then back into unit.
        const churnRed = inputs.churnReductionAbsolute * modifiers.valueMultiplier / 100;
        const savedCustomers = inputs.customersImpactedPerMonth * churnRed * successFactor;
        // Annual value converted to monthly for the "Monthly Value" metric
        const monthlyValuePerSavedCustomer = inputs.annualValuePerCustomer / 12;
        totalMonthlyValue = savedCustomers * monthlyValuePerSavedCustomer;
        grossValuePerUnit = totalMonthlyValue / (effectiveVolume || 1);
        break;
    }
    case ValueMethod.PREMIUM_MONETIZATION: {
        // Value = (Price - COGS) * Subscribers
        // Note: effectiveVolume (usage) might be distinct from subscribers.
        // But cost is driven by usage. Value is driven by subscribers.
        const marginPerSub = inputs.pricePerSubscriberPerMonth - inputs.nonAiCOGSPerSubscriber;
        totalMonthlyValue = marginPerSub * inputs.subscribers * modifiers.valueMultiplier;
        
        // We assume success rate impacts retention/satisfaction but mechanically revenue is fixed by sub count 
        // until they churn. Let's apply success factor as a "quality realization" discount for conservative ROI.
        totalMonthlyValue = totalMonthlyValue * successFactor;
        
        grossValuePerUnit = totalMonthlyValue / (effectiveVolume || 1);
        break;
    }
  }

  const netValuePerUnit = grossValuePerUnit; // Success factor already applied inside cases
  const netMonthlyBenefit = totalMonthlyValue - totalMonthlyCost;
  
  const roiPercentage = totalMonthlyCost > 0 
    ? (netMonthlyBenefit / totalMonthlyCost) * 100 
    : 0;

  const annualizedNetBenefit = netMonthlyBenefit * 12;

  // Payback: Fixed Costs / Net Benefit (if positive)
  let paybackMonths: number | string = "Immediate";
  if (totalFixedOneTime > 0) {
      if (netMonthlyBenefit <= 0) {
          paybackMonths = "No Payback";
      } else {
          paybackMonths = (totalFixedOneTime / netMonthlyBenefit).toFixed(1);
      }
  }

  return {
    effectiveMonthlyVolume: effectiveVolume,
    layer1CostPerUnit,
    layer1MonthlyCost,
    layer2CostPerUnit,
    layer2MonthlyCost,
    monthlyAmortizedFixedCost,
    totalFixedCost: totalFixedOneTime,
    totalMonthlyCost,
    totalCostPerUnit,
    grossValuePerUnit,
    netValuePerUnit,
    totalMonthlyValue,
    netMonthlyBenefit,
    annualizedNetBenefit,
    roiPercentage,
    paybackMonths
  };
};