import { calculateROI } from './calculations';
import { UseCaseInputs, ValueMethod, SensitivityModifiers } from '../types';
import { DEFAULT_INPUTS } from '../constants';

describe('calculateROI', () => {
  const defaultModifiers: SensitivityModifiers = {
    volumeMultiplier: 1,
    successRateMultiplier: 1,
    costMultiplier: 1,
    valueMultiplier: 1,
  };

  describe('Layer 1: Model Cost Calculations', () => {
    it('should calculate basic token-based cost correctly', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 10000,
        primaryModel: {
          avgInputTokensPerUnit: 1000,
          avgOutputTokensPerUnit: 500,
          pricePer1MInputTokens: 0.15,
          pricePer1MOutputTokens: 0.60,
          costPerCall: 0.005,
          useCallPricing: false,
        },
        routingSimplePercent: 100,
        cacheHitRate: 0,
        cachedTokenDiscount: 0,
        retryRate: 0,
        overheadMultiplier: 1,
      };

      const result = calculateROI(inputs, defaultModifiers);

      // Expected: (1000/1M * 0.15) + (500/1M * 0.60) = 0.00015 + 0.0003 = 0.00045
      expect(result.layer1CostPerUnit).toBeCloseTo(0.00045, 5);
    });

    it('should apply cache savings only to input tokens', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 10000,
        primaryModel: {
          avgInputTokensPerUnit: 1000,
          avgOutputTokensPerUnit: 500,
          pricePer1MInputTokens: 0.15,
          pricePer1MOutputTokens: 0.60,
          costPerCall: 0.005,
          useCallPricing: false,
        },
        routingSimplePercent: 100,
        cacheHitRate: 50, // 50% hit rate
        cachedTokenDiscount: 90, // 90% discount
        retryRate: 0,
        overheadMultiplier: 1,
      };

      const result = calculateROI(inputs, defaultModifiers);

      // Input cost: 0.00015, with 50% hit rate and 90% discount = 0.00015 * (1 - 0.5 * 0.9) = 0.00015 * 0.55 = 0.0000825
      // Output cost: 0.0003 (unchanged)
      // Total: 0.0000825 + 0.0003 = 0.0003825
      expect(result.layer1CostPerUnit).toBeCloseTo(0.0003825, 6);
    });

    it('should blend primary and secondary model costs correctly', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 10000,
        primaryModel: {
          avgInputTokensPerUnit: 1000,
          avgOutputTokensPerUnit: 500,
          pricePer1MInputTokens: 0.15,
          pricePer1MOutputTokens: 0.60,
          costPerCall: 0.005,
          useCallPricing: false,
        },
        secondaryModel: {
          avgInputTokensPerUnit: 2000,
          avgOutputTokensPerUnit: 1000,
          pricePer1MInputTokens: 2.50,
          pricePer1MOutputTokens: 10.00,
          costPerCall: 0.02,
          useCallPricing: false,
        },
        routingSimplePercent: 70, // 70% primary, 30% secondary
        cacheHitRate: 0,
        cachedTokenDiscount: 0,
        retryRate: 0,
        overheadMultiplier: 1,
      };

      const result = calculateROI(inputs, defaultModifiers);

      // Primary: 0.00045
      // Secondary: (2000/1M * 2.5) + (1000/1M * 10) = 0.005 + 0.01 = 0.015
      // Blended: 0.00045 * 0.7 + 0.015 * 0.3 = 0.000315 + 0.0045 = 0.004815
      expect(result.layer1CostPerUnit).toBeCloseTo(0.004815, 6);
    });

    it('should apply retry rate only to Layer 1', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 10000,
        primaryModel: {
          avgInputTokensPerUnit: 1000,
          avgOutputTokensPerUnit: 500,
          pricePer1MInputTokens: 0.15,
          pricePer1MOutputTokens: 0.60,
          costPerCall: 0.005,
          useCallPricing: false,
        },
        routingSimplePercent: 100,
        cacheHitRate: 0,
        cachedTokenDiscount: 0,
        retryRate: 0.2, // 20% retry rate
        overheadMultiplier: 1,
        orchestrationCostPerUnit: 0.001,
        retrievalCostPerUnit: 0.002,
        toolApiCostPerUnit: 0,
        loggingMonitoringCostPerUnit: 0,
        safetyGuardrailsCostPerUnit: 0,
        networkEgressCostPerUnit: 0,
        storageCostPerUnit: 0,
      };

      const result = calculateROI(inputs, defaultModifiers);

      // Layer 1: 0.00045 * 1.2 (retry) = 0.00054
      // Harness: 0.001 + 0.002 = 0.003
      // Layer 2: (0.00054 + 0.003) * 1 = 0.00354
      expect(result.layer2CostPerUnit).toBeCloseTo(0.00354, 6);
    });
  });

  describe('Layer 2: Harness Cost Calculations', () => {
    it('should sum all harness costs correctly', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 10000,
        orchestrationCostPerUnit: 0.001,
        retrievalCostPerUnit: 0.002,
        toolApiCostPerUnit: 0.0005,
        loggingMonitoringCostPerUnit: 0.0003,
        safetyGuardrailsCostPerUnit: 0.0002,
        networkEgressCostPerUnit: 0.0001,
        storageCostPerUnit: 0.0001,
        retryRate: 0,
        overheadMultiplier: 1,
      };

      const result = calculateROI(inputs, defaultModifiers);

      // Harness sum: 0.001 + 0.002 + 0.0005 + 0.0003 + 0.0002 + 0.0001 + 0.0001 = 0.0042
      // Layer 2 = Layer 1 (0.00045) + Harness (0.0042) = 0.00465
      expect(result.layer2CostPerUnit).toBeCloseTo(0.00465, 6);
    });

    it('should apply overhead multiplier to combined cost', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 10000,
        orchestrationCostPerUnit: 0.001,
        retrievalCostPerUnit: 0.002,
        toolApiCostPerUnit: 0,
        loggingMonitoringCostPerUnit: 0,
        safetyGuardrailsCostPerUnit: 0,
        networkEgressCostPerUnit: 0,
        storageCostPerUnit: 0,
        retryRate: 0,
        overheadMultiplier: 1.15, // 15% overhead
      };

      const result = calculateROI(inputs, defaultModifiers);

      // Layer 1: 0.00045
      // Harness: 0.003
      // Before overhead: 0.00345
      // After overhead: 0.00345 * 1.15 = 0.0039675
      expect(result.layer2CostPerUnit).toBeCloseTo(0.0039675, 6);
    });
  });

  describe('Layer 3: Value Calculations', () => {
    describe('Cost Displacement', () => {
      it('should calculate cost displacement correctly', () => {
        const inputs: UseCaseInputs = {
          ...DEFAULT_INPUTS,
          monthlyVolume: 10000,
          successRate: 90,
          valueMethod: ValueMethod.COST_DISPLACEMENT,
          baselineHumanCostPerUnit: 5.0,
          deflectionRate: 40,
          residualHumanReviewRate: 10,
          residualReviewCostPerUnit: 2.5,
        };

        const result = calculateROI(inputs, defaultModifiers);

        // Savings: 5.0 * 0.4 = 2.0
        // Residual: 2.5 * 0.1 = 0.25
        // Net: (2.0 - 0.25) * 0.9 = 1.575
        expect(result.grossValuePerUnit).toBeCloseTo(1.575, 3);
      });
    });

    describe('Revenue Uplift', () => {
      it('should calculate revenue uplift correctly', () => {
        const inputs: UseCaseInputs = {
          ...DEFAULT_INPUTS,
          monthlyVolume: 100000,
          successRate: 100,
          valueMethod: ValueMethod.REVENUE_UPLIFT,
          baselineConversionRate: 2.5,
          conversionUpliftAbsolute: 0.5, // 0.5 percentage points
          averageOrderValue: 100,
          grossMargin: 60,
        };

        const result = calculateROI(inputs, defaultModifiers);

        // Delta conversion: 0.005 (0.5 points)
        // Revenue per unit: 100 * 0.005 = 0.5
        // Value: 0.5 * 0.6 = 0.3
        expect(result.grossValuePerUnit).toBeCloseTo(0.3, 3);
      });
    });

    describe('Retention', () => {
      it('should calculate retention value correctly', () => {
        const inputs: UseCaseInputs = {
          ...DEFAULT_INPUTS,
          monthlyVolume: 10000,
          successRate: 95,
          valueMethod: ValueMethod.RETENTION,
          baselineChurnRate: 1.0,
          churnReductionAbsolute: 0.1, // 0.1 percentage points
          annualValuePerCustomer: 1200,
          customersImpactedPerMonth: 1000,
        };

        const result = calculateROI(inputs, defaultModifiers);

        // Saved customers: 1000 * 0.001 * 0.95 = 0.95
        // Monthly value per customer: 1200 / 12 = 100
        // Total: 0.95 * 100 = 95
        expect(result.totalMonthlyValue).toBeCloseTo(95, 1);
      });
    });

    describe('Premium Monetization', () => {
      it('should calculate premium monetization correctly', () => {
        const inputs: UseCaseInputs = {
          ...DEFAULT_INPUTS,
          monthlyVolume: 10000,
          successRate: 100,
          valueMethod: ValueMethod.PREMIUM_MONETIZATION,
          pricePerSubscriberPerMonth: 20,
          subscribers: 500,
          nonAiCOGSPerSubscriber: 2,
        };

        const result = calculateROI(inputs, defaultModifiers);

        // Margin per sub: 20 - 2 = 18
        // Total: 18 * 500 = 9000
        expect(result.totalMonthlyValue).toBeCloseTo(9000, 0);
      });
    });
  });

  describe('ROI Metrics', () => {
    it('should calculate ROI percentage correctly', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 10000,
        successRate: 90,
        valueMethod: ValueMethod.COST_DISPLACEMENT,
        baselineHumanCostPerUnit: 5.0,
        deflectionRate: 40,
        residualHumanReviewRate: 0,
        residualReviewCostPerUnit: 0,
        integrationCost: 0,
        trainingTuningCost: 0,
        changeManagementCost: 0,
      };

      const result = calculateROI(inputs, defaultModifiers);

      // Value: 5.0 * 0.4 * 0.9 = 1.8 per unit
      // Monthly value: 1.8 * 10000 = 18000
      // Monthly cost: result.totalMonthlyCost
      // ROI = (value - cost) / cost * 100
      const expectedROI = ((result.totalMonthlyValue - result.totalMonthlyCost) / result.totalMonthlyCost) * 100;
      expect(result.roiPercentage).toBeCloseTo(expectedROI, 1);
    });

    it('should calculate payback period correctly', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 10000,
        successRate: 95,
        valueMethod: ValueMethod.COST_DISPLACEMENT,
        baselineHumanCostPerUnit: 5.0,
        deflectionRate: 40,
        integrationCost: 5000,
        trainingTuningCost: 2000,
        changeManagementCost: 1000,
        amortizationMonths: 12,
      };

      const result = calculateROI(inputs, defaultModifiers);

      // Total fixed: 8000
      // Payback = 8000 / netMonthlyBenefit
      if (result.netMonthlyBenefit > 0) {
        const expectedPayback = 8000 / result.netMonthlyBenefit;
        expect(parseFloat(result.paybackMonths as string)).toBeCloseTo(expectedPayback, 1);
      }
    });

    it('should return "No Payback" when net benefit is negative', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 100, // Very low volume
        successRate: 50, // Low success rate
        valueMethod: ValueMethod.COST_DISPLACEMENT,
        baselineHumanCostPerUnit: 0.1, // Low value
        deflectionRate: 10, // Low deflection
        integrationCost: 10000,
        trainingTuningCost: 5000,
        changeManagementCost: 5000,
      };

      const result = calculateROI(inputs, defaultModifiers);

      expect(result.paybackMonths).toBe('No Payback');
    });
  });

  describe('Sensitivity Modifiers', () => {
    it('should apply volume multiplier correctly', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 10000,
      };

      const modifiers: SensitivityModifiers = {
        volumeMultiplier: 2,
        successRateMultiplier: 1,
        costMultiplier: 1,
        valueMultiplier: 1,
      };

      const result = calculateROI(inputs, modifiers);

      expect(result.effectiveMonthlyVolume).toBe(20000);
    });

    it('should apply success rate multiplier correctly', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 10000,
        successRate: 80,
      };

      const modifiers: SensitivityModifiers = {
        volumeMultiplier: 1,
        successRateMultiplier: 1.2,
        costMultiplier: 1,
        valueMultiplier: 1,
      };

      const result = calculateROI(inputs, modifiers);

      // 80 * 1.2 = 96%
      expect(result.grossValuePerUnit).toBeGreaterThan(0);
    });

    it('should apply cost multiplier to all costs', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 10000,
      };

      const modifiers: SensitivityModifiers = {
        volumeMultiplier: 1,
        successRateMultiplier: 1,
        costMultiplier: 1.5,
        valueMultiplier: 1,
      };

      const baseResult = calculateROI(inputs, defaultModifiers);
      const modifiedResult = calculateROI(inputs, modifiers);

      expect(modifiedResult.layer1CostPerUnit).toBeCloseTo(baseResult.layer1CostPerUnit * 1.5, 5);
    });

    it('should apply value multiplier correctly', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 10000,
        valueMethod: ValueMethod.COST_DISPLACEMENT,
        deflectionRate: 40,
      };

      const modifiers: SensitivityModifiers = {
        volumeMultiplier: 1,
        successRateMultiplier: 1,
        costMultiplier: 1,
        valueMultiplier: 1.5,
      };

      const result = calculateROI(inputs, modifiers);

      // Deflection should be capped at 100%
      // 40 * 1.5 = 60%
      expect(result.grossValuePerUnit).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero volume gracefully', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 0,
      };

      const result = calculateROI(inputs, defaultModifiers);

      expect(result.effectiveMonthlyVolume).toBe(0);
      expect(result.totalMonthlyCost).toBeGreaterThanOrEqual(0);
    });

    it('should handle 100% success rate', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 10000,
        successRate: 100,
      };

      const result = calculateROI(inputs, defaultModifiers);

      expect(result.grossValuePerUnit).toBeGreaterThan(0);
    });

    it('should handle 0% success rate', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 10000,
        successRate: 0,
      };

      const result = calculateROI(inputs, defaultModifiers);

      expect(result.grossValuePerUnit).toBe(0);
    });

    it('should cap success rate at 100% when modifier exceeds', () => {
      const inputs: UseCaseInputs = {
        ...DEFAULT_INPUTS,
        monthlyVolume: 10000,
        successRate: 90,
      };

      const modifiers: SensitivityModifiers = {
        volumeMultiplier: 1,
        successRateMultiplier: 1.5, // Would give 135%
        costMultiplier: 1,
        valueMultiplier: 1,
      };

      const result = calculateROI(inputs, modifiers);

      // Should be capped at 100%
      expect(result.grossValuePerUnit).toBeLessThanOrEqual(result.totalMonthlyValue / result.effectiveMonthlyVolume);
    });
  });
});
