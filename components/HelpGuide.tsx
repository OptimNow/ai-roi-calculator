import React from 'react';
import { X, Info, DollarSign, Zap, TrendingUp, Calculator } from 'lucide-react';

interface HelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuide: React.FC<HelpGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-accent text-charcoal p-2 rounded-lg">
              <Info size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">How to Fill the Calculator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close help guide"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8 space-y-8">

          {/* Introduction */}
          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Overview</h3>
            <p className="text-slate-600 leading-relaxed">
              This calculator helps you estimate the Return on Investment (ROI) for AI projects using a <strong>3-layer framework</strong>:
            </p>
            <ul className="mt-3 space-y-2 text-slate-600">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                <span><strong>Layer 1: Infrastructure</strong> - Cost of model inference (tokens or API calls)</span>
              </li>
              <li className="flex items-start">
                <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                <span><strong>Layer 2: Harness</strong> - Supporting costs (orchestration, retrieval, monitoring, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                <span><strong>Layer 3: Value</strong> - Business value generated (cost savings, revenue, retention, etc.)</span>
              </li>
            </ul>
          </section>

          <hr className="border-slate-200" />

          {/* Section 1: General Parameters */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Calculator className="text-accent" size={20} />
              <h3 className="text-lg font-bold text-slate-800">1. General Parameters</h3>
            </div>

            <div className="space-y-4 ml-7">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-2">Use Case Name</h4>
                <p className="text-sm text-slate-600">A descriptive name for your AI project (e.g., "Customer Support Bot", "Invoice Processing").</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-2">Unit Name</h4>
                <p className="text-sm text-slate-600">
                  The basic unit of work your AI processes. Examples:
                </p>
                <ul className="mt-2 text-sm text-slate-600 list-disc list-inside ml-3">
                  <li><strong>ticket</strong> - for support chatbots</li>
                  <li><strong>invoice</strong> - for document processing</li>
                  <li><strong>session</strong> - for recommendation engines</li>
                  <li><strong>conversation</strong> - for customer interactions</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-2">Monthly Volume</h4>
                <p className="text-sm text-slate-600">
                  How many units your AI will process per month. Be realistic based on your current or projected traffic.
                </p>
                <p className="text-xs text-slate-500 mt-1">💡 Tip: Start with current volume, use sensitivity sliders to test higher/lower scenarios.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-2">Success Rate (%)</h4>
                <p className="text-sm text-slate-600">
                  Percentage of units successfully handled by AI without errors or escalation to humans. Typical ranges:
                </p>
                <ul className="mt-2 text-sm text-slate-600 list-disc list-inside ml-3">
                  <li><strong>Simple tasks:</strong> 90-98%</li>
                  <li><strong>Complex tasks:</strong> 70-85%</li>
                  <li><strong>Experimental:</strong> 50-70%</li>
                </ul>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 2: Infrastructure (Layer 1) */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="text-blue-500" size={20} />
              <h3 className="text-lg font-bold text-slate-800">2. Infrastructure (Layer 1)</h3>
            </div>

            <div className="space-y-4 ml-7">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-slate-700 mb-2">Token Counts</h4>
                <p className="text-sm text-slate-600 mb-2">
                  <strong>Input Tokens:</strong> Prompt + context sent to the model (e.g., user question, retrieved documents)<br />
                  <strong>Output Tokens:</strong> Model's response
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  💡 Tip: Test your prompts in the model playground to get accurate token counts. 1 token ≈ 4 characters.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-slate-700 mb-2">Token Pricing</h4>
                <p className="text-sm text-slate-600">
                  Enter the cost per 1 million tokens from your model provider's pricing page:
                </p>
                <ul className="mt-2 text-sm text-slate-600 list-disc list-inside ml-3">
                  <li><strong>GPT-4o:</strong> $2.50 / 1M input, $10.00 / 1M output</li>
                  <li><strong>GPT-4o-mini:</strong> $0.15 / 1M input, $0.60 / 1M output</li>
                  <li><strong>Claude Sonnet 4:</strong> $3.00 / 1M input, $15.00 / 1M output</li>
                  <li><strong>Claude Haiku:</strong> $0.25 / 1M input, $1.25 / 1M output</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-slate-700 mb-2">Model Routing (Advanced Mode)</h4>
                <p className="text-sm text-slate-600">
                  Use a small, cheap model for simple requests and a large, expensive model for complex ones.
                  Adjust the slider to set what percentage goes to the "simple" model.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Example: 70% to GPT-4o-mini ($0.15 input), 30% to GPT-4o ($2.50 input) = blended cost of $0.855 per 1M input tokens.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-slate-700 mb-2">Cache Settings (Advanced)</h4>
                <p className="text-sm text-slate-600">
                  <strong>Cache Hit Rate:</strong> % of requests that can reuse cached prompts<br />
                  <strong>Cache Discount:</strong> % discount on input tokens when cached (e.g., 90% = 10x cheaper)
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  💡 Only applies to input tokens. Leave at 0% if not using prompt caching.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 3: Harness (Layer 2) */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="text-purple-500" size={20} />
              <h3 className="text-lg font-bold text-slate-800">3. Harness (Layer 2)</h3>
            </div>

            <div className="space-y-4 ml-7">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-slate-700 mb-2">What is the "Harness"?</h4>
                <p className="text-sm text-slate-600">
                  The infrastructure and services needed to run your AI in production, beyond just the model itself.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-slate-700 mb-2">Key Cost Components (per unit)</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><strong>Orchestration:</strong> LangChain, agent frameworks, workflow engines (~$0.001/unit)</li>
                  <li><strong>Retrieval / Vector DB:</strong> Pinecone, Weaviate, embedding searches (~$0.002/unit)</li>
                  <li><strong>Tool APIs:</strong> External APIs called by your AI (varies by API)</li>
                  <li><strong>Logging / Monitoring:</strong> LangSmith, Helicone, DataDog (~$0.0005/unit)</li>
                  <li><strong>Safety / Guardrails:</strong> Content moderation, PII detection (~$0.0005/unit)</li>
                  <li><strong>Storage:</strong> Conversation history, documents (~$0.0001/unit)</li>
                </ul>
                <p className="text-xs text-slate-500 mt-3">
                  💡 Start with estimates, refine after testing. Simple mode hides optional fields.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-slate-700 mb-2">Retry Rate</h4>
                <p className="text-sm text-slate-600">
                  Percentage of requests that fail and need to be retried (e.g., 0.1 = 10% retry rate adds 10% to Layer 1 costs).
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-slate-700 mb-2">Overhead Multiplier</h4>
                <p className="text-sm text-slate-600">
                  Generic buffer for miscellaneous costs (e.g., 1.1 = 10% overhead for networking, staff time, etc.).
                </p>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 4: Value (Layer 3) */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="text-green-600" size={20} />
              <h3 className="text-lg font-bold text-slate-800">4. Value Definition (Layer 3)</h3>
            </div>

            <div className="space-y-4 ml-7">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-slate-700 mb-2">Choose Your Value Method</h4>
                <p className="text-sm text-slate-600 mb-3">
                  How does your AI create business value? Pick the method that best fits your use case:
                </p>
              </div>

              {/* Cost Displacement */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">💰 Cost Displacement</h4>
                <p className="text-sm text-slate-600 mb-2">
                  <strong>When to use:</strong> AI automates tasks previously done by humans (support, data entry, analysis)
                </p>
                <div className="text-sm text-slate-600 space-y-1 ml-3">
                  <p><strong>Baseline Human Cost per Unit:</strong> Fully loaded cost (salary + benefits + overhead) / units handled per month</p>
                  <p><strong>Deflection Rate:</strong> % of units AI handles without human intervention</p>
                  <p><strong>Residual Review Rate:</strong> % of AI outputs that need human review</p>
                  <p><strong>Review Cost:</strong> Cost per unit for that human review (typically lower than full cost)</p>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Example: Support agent costs $5/ticket, AI deflects 40%, review needed on 10% → saves ~$2/ticket
                </p>
              </div>

              {/* Revenue Uplift */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">📈 Revenue Uplift</h4>
                <p className="text-sm text-slate-600 mb-2">
                  <strong>When to use:</strong> AI increases conversions or sales (recommendations, personalization, upsells)
                </p>
                <div className="text-sm text-slate-600 space-y-1 ml-3">
                  <p><strong>Baseline Conversion Rate:</strong> Current % of visitors/users who convert</p>
                  <p><strong>Conversion Uplift:</strong> Percentage point increase from AI (e.g., 2.5% → 3.0% = 0.5 point uplift)</p>
                  <p><strong>Average Order Value:</strong> Average $ per transaction</p>
                  <p><strong>Gross Margin:</strong> Profit margin % (revenue minus COGS)</p>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Example: 100k sessions, 2.5% → 3% conversion, $100 AOV, 60% margin → $30k/mo value
                </p>
              </div>

              {/* Retention */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">🔄 Retention Uplift</h4>
                <p className="text-sm text-slate-600 mb-2">
                  <strong>When to use:</strong> AI reduces customer churn (proactive support, personalization, engagement)
                </p>
                <div className="text-sm text-slate-600 space-y-1 ml-3">
                  <p><strong>Baseline Churn Rate:</strong> % of customers who leave per month</p>
                  <p><strong>Churn Reduction:</strong> Percentage point decrease from AI</p>
                  <p><strong>Annual Value per Customer:</strong> Average customer lifetime value or annual revenue</p>
                  <p><strong>Customers Impacted/Mo:</strong> How many customers experience the AI feature</p>
                </div>
              </div>

              {/* Premium Monetization */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">💎 Premium Monetization</h4>
                <p className="text-sm text-slate-600 mb-2">
                  <strong>When to use:</strong> You charge users directly for AI features (subscriptions, seats, add-ons)
                </p>
                <div className="text-sm text-slate-600 space-y-1 ml-3">
                  <p><strong>Price per Subscriber/Mo:</strong> Monthly fee for AI features</p>
                  <p><strong>Total Subscribers:</strong> Number of paying users</p>
                  <p><strong>Non-AI COGS:</strong> Other costs per subscriber (hosting, support, etc.)</p>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* One-time Costs */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4">5. One-time Fixed Costs</h3>

            <div className="space-y-4 ml-7">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-2">Implementation Costs</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><strong>Integration:</strong> Development time, API setup, system integration</li>
                  <li><strong>Training / Tuning:</strong> Fine-tuning models, prompt engineering, testing</li>
                  <li><strong>Change Management:</strong> User training, documentation, rollout planning</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-2">Amortization Period</h4>
                <p className="text-sm text-slate-600">
                  Number of months to spread one-time costs over (default: 12 months). Used for payback calculation.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Tips & Best Practices */}
          <section className="bg-accent bg-opacity-10 p-6 rounded-lg border border-accent border-opacity-30">
            <h3 className="text-lg font-bold text-slate-800 mb-3">💡 Pro Tips</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start">
                <span className="text-accent mr-2">✓</span>
                <span><strong>Start conservative:</strong> Use lower success rates and deflection rates initially</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">✓</span>
                <span><strong>Test with presets:</strong> Load example profiles to understand the calculations</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">✓</span>
                <span><strong>Use Simple Mode first:</strong> Hide advanced options until you understand the basics</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">✓</span>
                <span><strong>Play with sensitivity:</strong> Use the sliders at the bottom to test different scenarios</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">✓</span>
                <span><strong>Export and iterate:</strong> Download JSON to save your work, copy markdown for reports</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">✓</span>
                <span><strong>Validate assumptions:</strong> Run small pilots to verify success rates and costs before scaling</span>
              </li>
            </ul>
          </section>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-accent text-charcoal font-semibold rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Got it, let's calculate!
          </button>
        </div>
      </div>
    </div>
  );
};
