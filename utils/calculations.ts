// Type-only imports are explicit so this module stays consumable under
// verbatimModuleSyntax — it is shared verbatim with the MCP server, which
// compiles with stricter settings than the app's own build.
import type { UseCaseInputs, CalculationResults, SensitivityModifiers, ModelParams } from '../types';
import { ValueMethod } from '../types';

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
 * - Cache savings apply only to input tokens, not output tokens. When a model carries a
 *   published cache-read price (from the AI Pricing Hub), that price is used; otherwise the
 *   manual cachedTokenDiscount applies. Same formula as the hub's "optimized" cost.
 * - Batch processing swaps in the provider's published batch prices (typically -50%) and
 *   halves the cache-read price, only where those rates exist.
 * - Retry rate multiplies Layer 1 costs only, not harness costs
 * - Success rate affects value realization but not base costs
 * - Payback calculation uses one-time fixed costs / monthly cash net benefit (before fixed-cost amortization)
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
    amortizationMonths,
    integrationCost,
    trainingTuningCost,
    changeManagementCost
  } = inputs;

  const effectiveVolume = monthlyVolume * modifiers.volumeMultiplier;
  const effectiveSuccessRate = Math.min(100, Math.max(0, successRate * modifiers.successRateMultiplier));

  // --- Layer 1: Model Cost ---
  // Blended Base Cost
  const primaryShare = routingSimplePercent / 100;
  const secondaryShare = 1 - primaryShare;

  const batchProcessing = inputs.batchProcessing === true;

  // Apply cache savings only to token-priced model input tokens.
  // Call-priced models have no token breakdown, so they are unaffected by cache/batch settings.
  // Cache/batch logic mirrors the AI Pricing Hub's optimizedUseCaseCost():
  // - batch swaps in published batch prices (only where they exist)
  // - a published cache-read price wins over the manual discount, and is halved under batch
  const modelCostComponents = (model: ModelParams) => {
    if (model.useCallPricing) {
      return {
        inputCost: 0,
        outputCost: 0,
        callCost: model.costPerCall * modifiers.costMultiplier,
      };
    }

    const useBatch = batchProcessing
      && model.batchInputPricePer1M !== undefined
      && model.batchOutputPricePer1M !== undefined;
    const baseInputPrice = useBatch ? model.batchInputPricePer1M! : model.pricePer1MInputTokens;
    const baseOutputPrice = useBatch ? model.batchOutputPricePer1M! : model.pricePer1MOutputTokens;

    const hitRate = cacheHitRate / 100;
    const cacheReadPrice = model.cachedInputPricePer1M !== undefined
      ? model.cachedInputPricePer1M * (useBatch ? 0.5 : 1)
      : baseInputPrice * (1 - cachedTokenDiscount / 100);
    const effectiveInputPrice = cacheReadPrice * hitRate + baseInputPrice * (1 - hitRate);

    return {
      inputCost: (model.avgInputTokensPerUnit / 1_000_000) * effectiveInputPrice * modifiers.costMultiplier,
      outputCost: (model.avgOutputTokensPerUnit / 1_000_000) * baseOutputPrice * modifiers.costMultiplier,
      callCost: 0,
    };
  };

  const primaryCost = modelCostComponents(primaryModel);
  const secondaryCost = modelCostComponents(secondaryModel);

  // Blend by routing
  const blendedInputCost = (primaryCost.inputCost * primaryShare) + (secondaryCost.inputCost * secondaryShare);
  const blendedOutputCost = (primaryCost.outputCost * primaryShare) + (secondaryCost.outputCost * secondaryShare);
  const blendedCallCost = (primaryCost.callCost * primaryShare) + (secondaryCost.callCost * secondaryShare);

  // Retries duplicate model calls, so they belong to Layer 1 (per METHODOLOGY C₁),
  // not to harness costs (storage, logging, etc. are not re-incurred).
  const layer1CostPerUnit = (blendedInputCost + blendedOutputCost + blendedCallCost) * (1 + inputs.retryRate);

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

  // Apply Overhead Multiplier to combined cost (Layer 2 is cumulative: it includes Layer 1)
  const layer2CostPerUnit = (layer1CostPerUnit + harnessSum) * inputs.overheadMultiplier;

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
  const monthlyCashNetBenefit = totalMonthlyValue - layer2MonthlyCost;
  const netMonthlyBenefit = totalMonthlyValue - totalMonthlyCost;
  
  const roiPercentage = totalMonthlyCost > 0 
    ? (netMonthlyBenefit / totalMonthlyCost) * 100 
    : 0;

  const annualizedNetBenefit = netMonthlyBenefit * 12;

  // Payback (cash): one-time fixed costs / monthly cash net benefit (before amortization)
  let paybackMonths: number | string = "Immediate";
  if (totalFixedOneTime > 0) {
      if (monthlyCashNetBenefit <= 0) {
          paybackMonths = "No Payback";
      } else {
          paybackMonths = (totalFixedOneTime / monthlyCashNetBenefit).toFixed(1);
      }
  }

  // --- Break-even Analysis ---
  // Calculate the volume needed for totalMonthlyValue to equal totalMonthlyCost
  // Formula: grossValuePerUnit * volume = (layer2CostPerUnit * volume) + monthlyAmortizedFixedCost
  // Rearranging: volume * (grossValuePerUnit - layer2CostPerUnit) = monthlyAmortizedFixedCost
  // volume = monthlyAmortizedFixedCost / (grossValuePerUnit - layer2CostPerUnit)

  let breakEvenVolume: number | undefined = undefined;

  const unitMargin = grossValuePerUnit - layer2CostPerUnit;

  if (unitMargin > 0 && monthlyAmortizedFixedCost > 0) {
    // Calculate the exact volume where net benefit = 0
    breakEvenVolume = Math.ceil(monthlyAmortizedFixedCost / unitMargin);
  } else if (monthlyAmortizedFixedCost === 0 && unitMargin > 0) {
    // No fixed costs to cover — profitable from the first unit
    breakEvenVolume = 0;
  }

  // Months until cumulative cash flow crosses zero, at today's volume. This is
  // the month the ROI curve crosses the axis, which is what the chart marker
  // points at.
  //
  // It used to extrapolate volume growth instead: (gap / volume) x 12, whose
  // implied growth rate is volume/12 per month — a doubling every year that
  // nobody chose and no input expresses. On a stable-volume project that
  // threshold is never reached, yet a month was still displayed, on an axis
  // measuring something else entirely.
  const breakEvenMonths: number | undefined =
    totalFixedOneTime === 0
      ? (monthlyCashNetBenefit > 0 ? 0 : undefined)
      : monthlyCashNetBenefit > 0
        ? totalFixedOneTime / monthlyCashNetBenefit
        : undefined; // never recovers at this volume

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
    monthlyCashNetBenefit,
    netMonthlyBenefit,
    annualizedNetBenefit,
    roiPercentage,
    paybackMonths,
    breakEvenVolume,
    breakEvenMonths
  };
};

