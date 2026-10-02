import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Code2, 
  Check, 
  AlertCircle, 
  CheckCircle2,
  Minus
} from 'lucide-react';

const PricingPage = () => {
  const [sliderValue, setSliderValue] = useState(20);

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Hero Section */}
      <section className="pt-32 pb-24 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
          Simple pricing. <br className="hidden md:block" />
          <span className="text-primary">90% cheaper</span> than the rest.
        </h1>
        <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
          Choose between total control with self-hosting or the convenience of our managed cloud. 
          No per-user lock-in. Transparent costs.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> SOC2 COMPLIANT
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" /> GDPR READY
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4" /> OPEN SOURCE
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="pb-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative -mt-10 md:mt-0">
          
          {/* Community / Self-Hosted Card */}
          <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Community / Self-Hosted</h3>
            <p className="text-gray-500 font-light mb-8">Perfect for developers and privacy-first teams.</p>
            
            <div className="flex items-end gap-1 mb-8">
              <span className="text-5xl font-extrabold text-gray-900">$0</span>
              <span className="text-gray-400 font-medium pb-1">/mo</span>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-start gap-3 mb-8">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
              <p className="text-xs text-orange-700 font-medium">You pay your own OpenAI / Anthropic API costs directly to the provider.</p>
            </div>

            <a 
              href="https://github.com/sumitup-ai" 
              target="_blank" 
              rel="noreferrer"
              className="w-full py-4 rounded-xl font-bold text-center border-2 border-gray-100 text-gray-700 hover:bg-gray-50 transition-colors mb-10"
            >
              Download on GitHub
            </a>

            <ul className="space-y-4 flex-1">
              {[
                "Bring your own API Key",
                "Community Support",
                "Full Code Access",
                "No per-user fees"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600 text-sm font-light">
                  <Check className="w-4 h-4 text-primary shrink-0" /> {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Cloud Pro Card */}
          <div className="bg-white rounded-3xl p-10 border-2 border-primary shadow-2xl flex flex-col h-full relative transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-md">
              MOST POPULAR
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">Cloud Pro</h3>
            <p className="text-gray-500 font-light mb-8">Fully managed service. We handle the heavy lifting.</p>
            
            <div className="flex items-end gap-1 mb-8">
              <span className="text-5xl font-extrabold text-gray-900">$15</span>
              <span className="text-gray-400 font-medium pb-1">/mo</span>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3 mb-8">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-primary font-medium">Includes hosting, maintenance, and standard API usage.</p>
            </div>

            <Link 
              to="/signup" 
              className="w-full py-4 rounded-xl font-bold text-center bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 mb-10 block"
            >
              Start 14-Day Free Trial
            </Link>

            <ul className="space-y-4 flex-1">
              {[
                "We handle hosting & API keys",
                "Priority Support",
                "Secure Cloud Storage (SOC2)",
                "Best for Non-Technical Teams",
                "Advanced Analytics Dashboard"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600 text-sm font-light">
                  <Check className="w-4 h-4 text-primary shrink-0" /> {feature}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* Savings Calculator Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">See how much you save</h2>
            <p className="text-gray-500 font-light">
              Drag the slider to estimate your monthly cost comparison based on meeting volume.
            </p>
          </div>

          <div className="bg-gray-50 rounded-[32px] p-8 md:p-12 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-end mb-8">
              <span className="text-sm font-medium text-gray-700">Estimated meeting hours per month</span>
              <span className="text-3xl font-bold text-primary">{sliderValue} hours</span>
            </div>

            {/* Slider Mockup/Input */}
            <div className="mb-16">
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={sliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-3 font-medium">
                <span>1 hour</span>
                <span>100 hours</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Competitor Box */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 block">Typical Competitor</span>
                <div className="flex items-end gap-1 opacity-50">
                  <span className="text-4xl font-bold text-gray-400">${sliderValue * 3}</span>
                  <span className="text-gray-400 font-medium pb-1">/mo</span>
                </div>
              </div>
              
              {/* SumItUp Box */}
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-bl-xl">
                  YOU SAVE {Math.round((1 - 15 / Math.max(sliderValue * 3, 15)) * 100)}%
                </div>
                <span className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 block flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" /> SumItUp Cloud
                </span>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">$15</span>
                  <span className="text-gray-500 font-medium pb-1">/mo</span>
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400 text-center mt-8 italic">
              * Competitor pricing estimated based on per-user seat cost of major meeting assistants.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Feature Comparison */}
      <section className="py-24 bg-gray-50/50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Detailed Feature Comparison</h2>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-6 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest w-1/3">Feature</th>
                  <th className="py-6 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest w-1/3">Self-Hosted</th>
                  <th className="py-6 px-8 text-xs font-bold text-primary uppercase tracking-widest w-1/3">Cloud Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-8 text-sm font-medium text-gray-900">Hosting</td>
                  <td className="py-5 px-8 text-sm text-gray-500 font-light">Your Server</td>
                  <td className="py-5 px-8 text-sm font-semibold text-primary">Managed Cloud</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-8 text-sm font-medium text-gray-900">Meeting Recording</td>
                  <td className="py-5 px-8"><Check className="w-5 h-5 text-gray-400" /></td>
                  <td className="py-5 px-8"><Check className="w-5 h-5 text-primary" /></td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-8 text-sm font-medium text-gray-900">AI Summaries</td>
                  <td className="py-5 px-8"><Check className="w-5 h-5 text-gray-400" /></td>
                  <td className="py-5 px-8"><Check className="w-5 h-5 text-primary" /></td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-8 text-sm font-medium text-gray-900">API Key Management</td>
                  <td className="py-5 px-8 text-sm text-gray-500 font-light">You manage keys</td>
                  <td className="py-5 px-8 text-sm font-semibold text-gray-900">Included</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-8 text-sm font-medium text-gray-900">Team Collaboration</td>
                  <td className="py-5 px-8"><Minus className="w-5 h-5 text-gray-300" /></td>
                  <td className="py-5 px-8"><Check className="w-5 h-5 text-primary" /></td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-8 text-sm font-medium text-gray-900">SSO / SAML</td>
                  <td className="py-5 px-8"><Minus className="w-5 h-5 text-gray-300" /></td>
                  <td className="py-5 px-8 text-sm text-gray-500 font-light">Add-on</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-12">
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">How does the self-hosted version work?</h4>
              <p className="text-gray-500 font-light leading-relaxed">
                You download the Docker container from our GitHub, run it on your own server (or laptop), 
                and plug in your OpenAI or Anthropic API key. You only pay the API provider for what you use.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Is my data secure on the Cloud plan?</h4>
              <p className="text-gray-500 font-light leading-relaxed">
                Absolutely. We are SOC2 Type II compliant. Your audio data is processed ephemerally and 
                encrypted at rest. We do not train our models on your meeting data.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Can I switch from Cloud to Self-Hosted later?</h4>
              <p className="text-gray-500 font-light leading-relaxed">
                Yes. You can export your data anytime in standard JSON/Markdown formats and migrate to a 
                self-hosted instance. No lock-in.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default PricingPage;