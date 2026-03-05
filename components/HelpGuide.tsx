import React from 'react';
import { X, Info, DollarSign, TrendingUp, Calculator, Settings } from 'lucide-react';

interface HelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuide: React.FC<HelpGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-accent text-charcoal p-2 rounded-lg">
              <Info size={24} />
            </div>
            <h2 className="text-2xl font-bold font-headline text-slate-800">How to Fill the Calculator</h2>
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
            <h3 className="text-xl font-bold font-headline text-slate-800 mb-3">Overview</h3>
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

          {/* Section 1: Value & Scope */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="text-green-600" size={20} />
              <h3 className="text-lg font-bold font-headline text-slate-800">1. Value & Scope</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4 ml-7">Define your AI project, its scale, and how it creates business value.</p>

            <div className="space-y-4 ml-7">
              <h4 className="font-bold text-slate-700 text-sm border-b border-slate-200 pb-1">Project Context</h4>

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
                  <li><strong>order</strong> - for recommendation engines</li>
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
                <h4 className="font-semibold text-slate-700 mb-2">Analysis Months</h4>
                <p className="text-sm text-slate-600">
                  The time horizon for your ROI analysis. This determines the timeframe shown in charts and projections. Typical values:
                </p>
                <ul className="mt-2 text-sm text-slate-600 list-disc list-inside ml-3">
                  <li><strong>12 months:</strong> Standard annual analysis</li>
                  <li><strong>24-36 months:</strong> Multi-year strategic view</li>
                  <li><strong>6 months:</strong> Short-term pilot evaluation</li>
                </ul>
                <p className="text-xs text-slate-500 mt-1">💡 Tip: This doesn't affect break-even or payback calculations, only visualization scope.</p>
              </div>

              <h4 className="font-bold text-slate-700 text-sm border-b border-slate-200 pb-1 mt-4">Value Definition</h4>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-slate-700 mb-2">3-Step Value Definition</h4>
                <p className="text-sm text-slate-600 mb-3">
                  The Value Model section guides you through three steps:
                </p>
                <ol className="text-sm text-slate-600 list-decimal list-inside ml-3 space-y-1">
                  <li><strong>Choose Value Archetype:</strong> Select how your AI creates business value</li>
                  <li><strong>Define Value Drivers:</strong> Enter the specific metrics for your chosen method</li>
                  <li><strong>Set Realization Rate:</strong> What % of AI outputs translate to real business impact</li>
                </ol>
                <p className="text-xs text-slate-500 mt-2">
                  💡 An equation preview below Step 3 shows how your inputs combine into the final value per unit.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">Realization Rate (%)</h4>
                <p className="text-sm text-slate-600">
                  Percentage of AI outputs that actually realize business value. This accounts for outputs that are technically successful but don't translate to business impact. Typical ranges:
                </p>
                <ul className="mt-2 text-sm text-slate-600 list-disc list-inside ml-3">
                  <li><strong>Simple tasks:</strong> 90-98%</li>
                  <li><strong>Complex tasks:</strong> 70-85%</li>
                  <li><strong>Experimental:</strong> 50-70%</li>
                </ul>
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
                  Example: Support agent costs $0.5/ticket, AI deflects 40%, review needed on 10% → saves ~$0.2/ticket
                </p>
              </div>

              {/* Preset Cost Assumptions */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-300">
                <h4 className="font-semibold text-amber-900 mb-2">Preset Cost Assumptions (India-based workforce)</h4>
                <p className="text-sm text-amber-800 mb-3">
                  Default baseline costs assume <strong>India-based BPO/KPO workers</strong> with fully loaded rates (salary + benefits + overhead + management):
                </p>
                <table className="w-full text-xs text-amber-800 mb-3">
                  <thead>
                    <tr className="border-b border-amber-300">
                      <th className="text-left py-1 pr-2">Use Case</th>
                      <th className="text-right py-1 pr-2">Cost/Unit</th>
                      <th className="text-left py-1">Assumption</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    <tr className="border-b border-amber-200"><td className="py-1 pr-2">Customer Support</td><td className="text-right py-1 pr-2">$0.50</td><td className="py-1">L1 agent, ~5 min/ticket @ $6/hr</td></tr>
                    <tr className="border-b border-amber-200"><td className="py-1 pr-2">Knowledge Q&A</td><td className="text-right py-1 pr-2">$2.00</td><td className="py-1">SME analyst, ~20 min/query @ $6/hr</td></tr>
                    <tr className="border-b border-amber-200"><td className="py-1 pr-2">Meeting Summary</td><td className="text-right py-1 pr-2">$5.00</td><td className="py-1">Note-taker, ~45 min/meeting @ $6.50/hr</td></tr>
                    <tr className="border-b border-amber-200"><td className="py-1 pr-2">Marketing Content</td><td className="text-right py-1 pr-2">$10.00</td><td className="py-1">Jr. content writer, ~2 hrs/piece @ $5/hr</td></tr>
                    <tr className="border-b border-amber-200"><td className="py-1 pr-2">Coding Task</td><td className="text-right py-1 pr-2">$8.00</td><td className="py-1">Jr. developer, ~1 hr/task @ $8/hr</td></tr>
                    <tr className="border-b border-amber-200"><td className="py-1 pr-2">Invoice Processing</td><td className="text-right py-1 pr-2">$2.50</td><td className="py-1">Data entry clerk, ~25 min/invoice @ $6/hr</td></tr>
                    <tr className="border-b border-amber-200"><td className="py-1 pr-2">Call Summary</td><td className="text-right py-1 pr-2">$3.00</td><td className="py-1">Agent post-call, ~30 min/call @ $6/hr</td></tr>
                    <tr><td className="py-1 pr-2">Agent Workflow</td><td className="text-right py-1 pr-2">$15.00</td><td className="py-1">Sr. analyst, ~2 hrs/workflow @ $7.50/hr</td></tr>
                  </tbody>
                </table>
                <p className="text-xs text-amber-700">
                  Fully loaded hourly rates: BPO/L1 roles $4-6/hr, skilled roles $7-8/hr. Adjust baseline costs upward for US/EU-based teams (3-5x multiplier).
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
                  Example: 100k orders, 2.5% → 3% conversion, $100 AOV, 60% margin → $30k/mo value
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

          {/* Section 2: Cost Model */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="text-blue-500" size={20} />
              <h3 className="text-lg font-bold font-headline text-slate-800">2. Cost Model</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4 ml-7">All costs associated with running your AI — model inference, supporting infrastructure, and one-time implementation costs.</p>

            <div className="space-y-4 ml-7">
              {/* Infrastructure (Layer 1) */}
              <h4 className="font-bold text-slate-700 text-sm border-b border-slate-200 pb-1">Infrastructure (Layer 1)</h4>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-300">
                <h4 className="font-semibold text-amber-900 mb-2">Pricing Model Assumption</h4>
                <p className="text-sm text-amber-800 mb-2">
                  This calculator currently assumes <strong>API-based pricing</strong> (pay-per-token) from cloud providers like OpenAI, Anthropic, Google, etc.
                </p>
                <p className="text-sm text-amber-800 mb-2">
                  <strong>NOT currently supported:</strong> Self-hosted or open-source models on your own GPUs (e.g., Llama, Mistral, or custom models).
                  Self-hosted costs involve hardware amortization, electricity, and DevOps overhead instead of per-token charges.
                </p>
                <p className="text-xs text-amber-700 mt-2">
                  Self-hosted pricing support is planned for a future release (see roadmap).
                </p>
              </div>

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
                  Enter the cost per 1 million tokens from your model provider's pricing page.
                  Check <a href="https://aipricinghub.optimnow.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">AI Pricing Hub</a> for up-to-date pricing across all providers.
                </p>
                <ul className="mt-2 text-sm text-slate-600 list-disc list-inside ml-3">
                  <li><strong>GPT-4o-mini:</strong> $0.15 / 1M input, $0.60 / 1M output</li>
                  <li><strong>Claude Haiku 4.5:</strong> $1.00 / 1M input, $5.00 / 1M output</li>
                  <li><strong>GPT-4o:</strong> $2.50 / 1M input, $10.00 / 1M output</li>
                  <li><strong>Claude Sonnet 4.6:</strong> $3.00 / 1M input, $15.00 / 1M output</li>
                  <li><strong>Gemini 2.0 Flash:</strong> $0.10 / 1M input, $0.40 / 1M output</li>
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

              {/* Harness (Layer 2) */}
              <h4 className="font-bold text-slate-700 text-sm border-b border-slate-200 pb-1 mt-6">Harness (Layer 2)</h4>

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
                <h4 className="font-semibold text-slate-700 mb-2">Retry Rate & Overhead</h4>
                <p className="text-sm text-slate-600">
                  <strong>Retry Rate:</strong> Percentage of requests that fail and need to be retried (e.g., 0.1 = 10% retry rate adds 10% to Layer 1 costs).<br />
                  <strong>Overhead Multiplier:</strong> Generic buffer for miscellaneous costs (e.g., 1.1 = 10% overhead for networking, staff time, etc.).
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">Harness Cost Assumptions</h4>
                <p className="text-xs text-slate-600 mb-3">
                  Default values include a buffer for operational overhead (DevOps time, dashboard setup, alerting configuration) beyond raw cloud pricing.
                  Validated using the <a href="https://github.com/OptimNow/cloud-finops-skills" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">OptimNow Cloud FinOps Skills</a>.
                </p>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-amber-100">
                      <th className="text-left p-1.5 border border-amber-200">Component</th>
                      <th className="text-right p-1.5 border border-amber-200">Default</th>
                      <th className="text-right p-1.5 border border-amber-200">Raw Cloud Cost</th>
                      <th className="text-left p-1.5 border border-amber-200">Cloud Reference</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    <tr>
                      <td className="p-1.5 border border-amber-200">Orchestration</td>
                      <td className="text-right p-1.5 border border-amber-200">$0.0010</td>
                      <td className="text-right p-1.5 border border-amber-200">$0.0002</td>
                      <td className="p-1.5 border border-amber-200">AWS Lambda ~$0.000034/req + Step Functions ~$0.0001</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-amber-200">Retrieval / Vector DB</td>
                      <td className="text-right p-1.5 border border-amber-200">$0.0020</td>
                      <td className="text-right p-1.5 border border-amber-200">$0.0020</td>
                      <td className="p-1.5 border border-amber-200">Bedrock KB ~$2/1K queries; OpenSearch amortized</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-amber-200">Logging / Monitoring</td>
                      <td className="text-right p-1.5 border border-amber-200">$0.0005</td>
                      <td className="text-right p-1.5 border border-amber-200">$0.00001</td>
                      <td className="p-1.5 border border-amber-200">CloudWatch $0.50/GB ingested; ~2-5KB per log entry</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-amber-200">Safety / Guardrails</td>
                      <td className="text-right p-1.5 border border-amber-200">$0.0005</td>
                      <td className="text-right p-1.5 border border-amber-200">$0.0003</td>
                      <td className="p-1.5 border border-amber-200">Bedrock Guardrails $0.15/1K text units (Dec 2024 pricing)</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-amber-200">Network Egress</td>
                      <td className="text-right p-1.5 border border-amber-200">$0.0001</td>
                      <td className="text-right p-1.5 border border-amber-200">$0.000005</td>
                      <td className="p-1.5 border border-amber-200">AWS egress $0.09/GB; ~5KB per AI response</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-amber-200">Storage</td>
                      <td className="text-right p-1.5 border border-amber-200">$0.0001</td>
                      <td className="text-right p-1.5 border border-amber-200">$0.000005</td>
                      <td className="p-1.5 border border-amber-200">S3 $0.023/GB/month; ~10KB per unit stored</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-slate-500 mt-2">
                  Defaults are conservative (include ops overhead buffer). Adjust down toward raw cloud costs for optimistic modeling.
                </p>
              </div>

              {/* One-time Costs */}
              <h4 className="font-bold text-slate-700 text-sm border-b border-slate-200 pb-1 mt-6">One-time Costs</h4>

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

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">One-time Cost Assumptions by Preset</h4>
                <p className="text-xs text-slate-600 mb-3">
                  Based on India-based development teams ($15-25/hr for developers, $8-12/hr for QA/support).
                  Validated using the <a href="https://github.com/OptimNow/cloud-finops-skills" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">OptimNow Cloud FinOps Skills</a>.
                  For US/EU teams, multiply by 3-5x.
                </p>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-amber-100">
                      <th className="text-left p-1.5 border border-amber-200">Preset</th>
                      <th className="text-right p-1.5 border border-amber-200">Integration</th>
                      <th className="text-right p-1.5 border border-amber-200">Training</th>
                      <th className="text-right p-1.5 border border-amber-200">Change Mgmt</th>
                      <th className="text-right p-1.5 border border-amber-200">Total</th>
                      <th className="text-left p-1.5 border border-amber-200">Assumption</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    <tr>
                      <td className="p-1.5 border border-amber-200">Support Bot</td>
                      <td className="text-right p-1.5 border border-amber-200">$2,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$1,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$500</td>
                      <td className="text-right p-1.5 border border-amber-200 font-semibold">$3,500</td>
                      <td className="p-1.5 border border-amber-200">Simple chatbot + ticketing API</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-amber-200">Knowledge Q&A</td>
                      <td className="text-right p-1.5 border border-amber-200">$3,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$2,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$500</td>
                      <td className="text-right p-1.5 border border-amber-200 font-semibold">$5,500</td>
                      <td className="p-1.5 border border-amber-200">RAG pipeline + doc ingestion</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-amber-200">Meeting Summary</td>
                      <td className="text-right p-1.5 border border-amber-200">$2,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$1,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$500</td>
                      <td className="text-right p-1.5 border border-amber-200 font-semibold">$3,500</td>
                      <td className="p-1.5 border border-amber-200">Calendar/conferencing API integration</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-amber-200">Marketing Content</td>
                      <td className="text-right p-1.5 border border-amber-200">$2,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$3,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$1,000</td>
                      <td className="text-right p-1.5 border border-amber-200 font-semibold">$6,000</td>
                      <td className="p-1.5 border border-amber-200">Higher training for brand voice tuning</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-amber-200">Coding Task</td>
                      <td className="text-right p-1.5 border border-amber-200">$5,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$3,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$2,000</td>
                      <td className="text-right p-1.5 border border-amber-200 font-semibold">$10,000</td>
                      <td className="p-1.5 border border-amber-200">IDE/CI pipeline + code review setup</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-amber-200">Invoice Processing</td>
                      <td className="text-right p-1.5 border border-amber-200">$5,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$2,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$1,000</td>
                      <td className="text-right p-1.5 border border-amber-200 font-semibold">$8,000</td>
                      <td className="p-1.5 border border-amber-200">ERP/accounting system integration</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-amber-200">Call Summary</td>
                      <td className="text-right p-1.5 border border-amber-200">$3,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$1,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$500</td>
                      <td className="text-right p-1.5 border border-amber-200 font-semibold">$4,500</td>
                      <td className="p-1.5 border border-amber-200">Telephony/CRM integration</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-amber-200">Agent Workflow</td>
                      <td className="text-right p-1.5 border border-amber-200">$10,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$5,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$3,000</td>
                      <td className="text-right p-1.5 border border-amber-200 font-semibold">$18,000</td>
                      <td className="p-1.5 border border-amber-200">Complex multi-tool orchestration</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-amber-200">Recommendations</td>
                      <td className="text-right p-1.5 border border-amber-200">$8,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$3,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$1,000</td>
                      <td className="text-right p-1.5 border border-amber-200 font-semibold">$12,000</td>
                      <td className="p-1.5 border border-amber-200">E-commerce platform integration</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-amber-200">Retention AI</td>
                      <td className="text-right p-1.5 border border-amber-200">$8,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$5,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$2,000</td>
                      <td className="text-right p-1.5 border border-amber-200 font-semibold">$15,000</td>
                      <td className="p-1.5 border border-amber-200">CRM + data pipeline + model tuning</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-amber-200">Premium Features</td>
                      <td className="text-right p-1.5 border border-amber-200">$15,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$8,000</td>
                      <td className="text-right p-1.5 border border-amber-200">$3,000</td>
                      <td className="text-right p-1.5 border border-amber-200 font-semibold">$26,000</td>
                      <td className="p-1.5 border border-amber-200">Full product feature build-out</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-slate-500 mt-2">
                  Enterprise deployments typically 3-5x higher. Costs assume India-based dev teams ($15-25/hr developers, $8-12/hr QA).
                </p>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Advanced Features */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="text-purple-500" size={20} />
              <h3 className="text-lg font-bold font-headline text-slate-800">3. Advanced Features</h3>
            </div>

            <div className="space-y-4 ml-7">
              {/* Advanced Mode */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-700 mb-2">🔧 Advanced Mode</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Toggle to "Advanced" in the header to unlock additional cost parameters:
                </p>
                <ul className="text-sm text-slate-600 list-disc list-inside ml-3 space-y-1">
                  <li><strong>Model Routing Strategy:</strong> Use a slider to split traffic between two models</li>
                  <li><strong>Cache Settings:</strong> Cache hit rate and discount percentage</li>
                  <li><strong>Extended Harness Costs:</strong> Tool APIs, logging, safety guardrails, storage</li>
                </ul>
              </div>

              {/* Model Routing */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-700 mb-2">🔀 Model Routing Strategy (Advanced Mode)</h4>
                <p className="text-sm text-slate-600 mb-2">
                  <strong>Concept:</strong> Route simple requests to a cheap, fast model (e.g., GPT-4o-mini) and complex requests to an expensive, smart model (e.g., GPT-4o).
                </p>
                <p className="text-sm text-slate-600 mb-2">
                  <strong>How it works:</strong>
                </p>
                <ul className="text-sm text-slate-600 list-decimal list-inside ml-3 space-y-1">
                  <li>In Advanced Mode, you'll see a slider: "Simple Model" percentage</li>
                  <li>Move the slider left (0%) = All traffic goes to Secondary Model (expensive/complex)</li>
                  <li>Move the slider right (100%) = All traffic goes to Primary Model (cheap/simple)</li>
                  <li>Middle positions (e.g., 70%) = 70% to Primary, 30% to Secondary</li>
                  <li>When slider is &lt;100%, the "Secondary Model" section appears below</li>
                  <li>Enter token counts and pricing for BOTH models</li>
                  <li>The calculator blends costs: (Primary cost × 70%) + (Secondary cost × 30%)</li>
                </ul>
                <p className="text-xs text-slate-500 mt-2">
                  💡 Tip: This models an intelligent routing system that classifies request complexity before choosing a model.
                </p>
              </div>

              {/* Sensitivity Simulator */}
              <div className="bg-[#2C2C2C] text-white p-4 rounded-lg border border-[#C1C1C1]">
                <h4 className="font-semibold text-white mb-2">⚙️ Sensitivity Simulator</h4>
                <p className="text-sm text-slate-300 mb-3">
                  Found at the bottom of the results column, this lets you test "what-if" scenarios by multiplying key inputs:
                </p>
                <ul className="text-sm text-slate-300 list-disc list-inside ml-3 space-y-2">
                  <li><strong>Volume Multiplier (0.5x - 3.0x):</strong> Simulate lower or higher traffic (e.g., 2x = double your volume)</li>
                  <li><strong>Realization Rate Multiplier (0.5x - 1.5x):</strong> Test if AI performs worse/better than expected</li>
                  <li><strong>Cost Multiplier (0.5x - 2.0x):</strong> Model price changes (e.g., 1.5x = 50% cost increase)</li>
                  <li><strong>Value Multiplier (0.5x - 2.0x):</strong> Adjust business value estimates up or down</li>
                </ul>
                <p className="text-sm text-slate-300 mt-3 mb-2">
                  <strong>How to use:</strong>
                </p>
                <ol className="text-sm text-slate-300 list-decimal list-inside ml-3 space-y-1">
                  <li>Enter your best-guess inputs in the left column</li>
                  <li>Check the initial ROI results on the right</li>
                  <li>Move sensitivity sliders to see live updates to metrics</li>
                  <li>Example: Set Volume to 2x to see ROI if you doubled traffic</li>
                  <li>Click "Reset Simulation" to return to 1x multipliers</li>
                </ol>
                <p className="text-xs text-slate-300 mt-2">
                  💡 Tip: This does NOT change your base inputs—only multiplies them temporarily for analysis.
                </p>
              </div>

              {/* Tornado Chart Interpretation */}
              <div className="bg-[#2C2C2C] text-white p-4 rounded-lg border border-[#C1C1C1]">
                <h4 className="font-semibold text-white mb-2">🌪️ Tornado Chart - Impact Ranking</h4>
                <p className="text-sm text-slate-300 mb-3">
                  The tornado chart visualizes which variables have the most impact on your ROI when varied by ±20%:
                </p>

                <div className="mb-3">
                  <p className="text-sm text-slate-300 mb-2"><strong>How to read it:</strong></p>
                  <ul className="text-sm text-slate-300 list-disc list-inside ml-3 space-y-1">
                    <li><strong className="text-red-400">Red bars (left):</strong> ROI impact when variable decreases by 20% (downside risk)</li>
                    <li><strong className="text-green-400">Green bars (right):</strong> ROI impact when variable increases by 20% (upside potential)</li>
                    <li><strong>Vertical position:</strong> Variables ranked by total impact (most impactful at top)</li>
                    <li><strong>Impact Range:</strong> Total ROI swing between -20% and +20% scenarios</li>
                  </ul>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-slate-300 mb-2"><strong>Key insights:</strong></p>
                  <ul className="text-sm text-slate-300 list-disc list-inside ml-3 space-y-1">
                    <li><strong>Focus on top bars:</strong> These variables have the most impact on ROI. Small changes create large ROI swings.</li>
                    <li><strong>Asymmetric bars matter:</strong> If green bar is much longer than red (or vice versa), upside and downside risks are unequal.</li>
                    <li><strong>Prioritize monitoring:</strong> The top 1-2 variables are your critical metrics to track and optimize.</li>
                  </ul>
                </div>

                <p className="text-xs text-slate-300 mt-2">
                  💡 Key takeaway: Rank variables by impact range, then focus optimization efforts on the top 1-2 variables.
                </p>
              </div>

              {/* Scenario Manager */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-700 mb-2">📁 Scenario Manager</h4>
                <p className="text-sm text-slate-600 mb-2">
                  Save and compare multiple calculation scenarios (click folder icon in header):
                </p>
                <ul className="text-sm text-slate-600 list-disc list-inside ml-3 space-y-1">
                  <li><strong>Save:</strong> Enter a name/description, click "Save Scenario"</li>
                  <li><strong>Load:</strong> Click any saved scenario to restore those inputs</li>
                  <li><strong>Compare:</strong> Select 2+ scenarios, click "Compare" to see side-by-side charts</li>
                  <li><strong>Export/Import:</strong> Download scenarios as JSON files for backup or sharing</li>
                </ul>
                <p className="text-xs text-slate-500 mt-2">
                  💡 Tip: Create "Conservative", "Realistic", and "Optimistic" scenarios to present a range to stakeholders.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Tips & Best Practices */}
          <section className="bg-accent bg-opacity-10 p-6 rounded-lg border border-accent border-opacity-30">
            <h3 className="text-lg font-bold font-headline text-slate-800 mb-3">💡 Pro Tips</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start">
                <span className="text-[#2C2C2C] font-bold mr-2">✓</span>
                <span><strong>Start conservative:</strong> Use lower realization rates and deflection rates initially</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#2C2C2C] font-bold mr-2">✓</span>
                <span><strong>Test with presets:</strong> Load example profiles to understand the calculations</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#2C2C2C] font-bold mr-2">✓</span>
                <span><strong>Use Simple Mode first:</strong> Hide advanced options until you understand the basics</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#2C2C2C] font-bold mr-2">✓</span>
                <span><strong>Play with sensitivity:</strong> Use the sliders at the bottom to test different scenarios</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#2C2C2C] font-bold mr-2">✓</span>
                <span><strong>Export and iterate:</strong> Download JSON to save your work, copy markdown for reports</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#2C2C2C] font-bold mr-2">✓</span>
                <span><strong>Validate assumptions:</strong> Run small pilots to verify realization rates and costs before scaling</span>
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
