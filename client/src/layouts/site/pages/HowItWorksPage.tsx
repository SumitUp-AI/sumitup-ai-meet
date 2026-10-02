import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  UploadCloud, 
  ChevronDown, 
  Bot, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Lock,
  CheckCircle
} from 'lucide-react';

const HowItWorksPage = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 pb-20 text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Simple 5-Step Process</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-[1.1]">
          From Conversation to <br />Action in Minutes
        </h1>
        
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
          See how SumItUp transforms your chaotic meetings into organized, 
          searchable, and actionable insights securely without lifting a finger.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/signup" 
            className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            Start Free Trial
          </Link>
          <Link 
            to="/demo" 
            className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
          >
            View Demo
          </Link>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-gray-50/30 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          {/* Step 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full border border-primary/30 text-primary flex items-center justify-center text-xs font-bold bg-primary/5">01</div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">INPUT</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">Connect or Upload</h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed font-light">
                Seamlessly integrate with Zoom, Google Meet, or Microsoft Teams for auto-joining. 
                Have a pre-recorded session? Simply drag and drop your existing audio or video 
                files into the dashboard securely.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-primary" /> Auto-sync with calendar
                </li>
                <li className="flex items-center gap-3 text-gray-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-primary" /> Supports mp3, mp4, wav, and m4a
                </li>
              </ul>
            </div>
            
            <div data-aos="fade-left" className="relative w-full aspect-video bg-[#e6c1a8]/30 rounded-2xl flex items-center justify-center p-8 shadow-inner">
              <div className="w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 translate-y-[-10px]">
                <div className="h-10 bg-[#e0f2f1]/50 border-b border-gray-100 px-4 flex items-center">
                  <div className="text-[10px] font-bold text-gray-400 tracking-wider">UPLOAD FILES</div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-12 border border-gray-200 rounded-lg flex items-center px-4 justify-between bg-white shadow-sm">
                     <span className="text-sm text-gray-500">Video</span>
                     <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="h-12 border border-gray-200 rounded-lg flex items-center px-4 justify-between bg-gray-50">
                     <span className="text-sm text-gray-400">Audio</span>
                     <ChevronDown className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </div>
              {/* Overlapping Card */}
              <div className="absolute -bottom-6 left-8 right-12 bg-white rounded-xl shadow-2xl p-4 border border-gray-100 flex items-center gap-4 z-10">
                 <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                   <UploadCloud className="w-5 h-5" />
                 </div>
                 <div className="flex-1 space-y-2">
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-3/4 rounded-full"></div>
                    </div>
                    <div className="h-2 w-1/2 bg-gray-100 rounded-full"></div>
                 </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right" className="order-2 lg:order-1 relative w-full aspect-[4/3] bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col justify-center gap-8">
              <div className="flex gap-2 items-center absolute top-6 left-6">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              
              <div className="flex items-start gap-5 mt-6">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold shrink-0">JD</div>
                <div className="space-y-3 flex-1 pt-1">
                  <div className="h-2.5 bg-gray-100 rounded-full w-full"></div>
                  <div className="h-2.5 bg-gray-100 rounded-full w-5/6"></div>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">SM</div>
                <div className="space-y-3 flex-1 pt-1">
                  <div className="h-2.5 bg-gray-100 rounded-full w-4/5"></div>
                  <div className="h-2.5 bg-gray-100 rounded-full w-full"></div>
                  <div className="h-2.5 bg-gray-100 rounded-full w-2/3"></div>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-bold shrink-0">AL</div>
                <div className="space-y-3 flex-1 pt-1">
                  <div className="h-2.5 bg-gray-100 rounded-full w-3/4"></div>
                  <div className="h-2.5 bg-gray-100 rounded-full w-1/2"></div>
                </div>
              </div>
            </div>

            <div data-aos="fade-left" className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full border border-primary/30 text-primary flex items-center justify-center text-xs font-bold bg-primary/5">02</div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">PROCESSING</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">Instant Transcription</h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed font-light">
                Our engine processes audio in real-time, accurately distinguishing between speakers 
                (diarization) and delivering high-fidelity text with 98% accuracy across 30+ languages.
              </p>
              <div className="flex gap-4">
                <span className="px-4 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-600 bg-white shadow-sm">Speaker Diarization</span>
                <span className="px-4 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-600 bg-white shadow-sm">Multi-language</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full border border-primary/30 text-primary flex items-center justify-center text-xs font-bold bg-primary/5">03</div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">ANALYSIS</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">AI Context Engine</h2>
              <p className="text-lg text-gray-500 leading-relaxed font-light">
                Beyond simple text, SumItUp understands context. It identifies key decisions made, 
                action items assigned to specific people, and the overall sentiment of the discussion.
              </p>
            </div>
            
            <div data-aos="fade-left" className="relative w-full aspect-[4/3] bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
              {/* Grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              <div className="relative z-10 bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full mx-6 hover:-translate-y-1 transition-transform">
                <div className="flex justify-between items-center mb-6">
                   <span className="text-[10px] font-bold text-primary tracking-widest uppercase flex items-center gap-2">
                     <CheckCircle2 className="w-3 h-3" /> ACTION ITEM DETECTED
                   </span>
                   <div className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-full border border-purple-100">Decision</div>
                </div>
                <p className="text-gray-900 font-medium text-lg mb-8 leading-snug">"Update the Q3 financial roadmap by Friday"</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">TS</div>
                    <span className="text-xs text-gray-500">Assigned to <span className="font-semibold text-gray-900">Tom Smith</span></span>
                  </div>
                  <div className="w-8 h-4 bg-orange-100 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right" className="order-2 lg:order-1 relative w-full aspect-[4/3] bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center justify-center p-8">
              <div className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-lg z-10 shadow-lg shadow-primary/25">Meeting</div>
              <div className="w-0.5 h-8 bg-gray-200"></div>
              <div className="w-56 h-0.5 bg-gray-200"></div>
              <div className="flex justify-between w-56">
                <div className="w-0.5 h-8 bg-gray-200"></div>
                <div className="w-0.5 h-8 bg-gray-200"></div>
              </div>
              <div className="flex gap-8 z-10 w-64 justify-between">
                <div className="px-4 py-3 border border-gray-200 bg-white text-gray-600 text-xs font-semibold rounded-lg shadow-sm flex-1 text-center">Design Review</div>
                <div className="px-4 py-3 border border-gray-200 bg-white text-gray-600 text-xs font-semibold rounded-lg shadow-sm flex-1 text-center">Dev Sync</div>
              </div>
              <div className="flex justify-between w-56">
                <div className="w-0.5 h-8 bg-gray-200"></div>
                <div className="w-0.5 h-8 bg-gray-200"></div>
              </div>
              <div className="w-56 h-0.5 bg-gray-200"></div>
              <div className="w-0.5 h-8 bg-gray-200"></div>
              <div className="px-8 py-3 border border-gray-200 bg-gray-50 text-gray-500 text-xs font-bold rounded-lg z-10 shadow-sm">Launch v2</div>
            </div>

            <div data-aos="fade-left" className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full border border-primary/30 text-primary flex items-center justify-center text-xs font-bold bg-primary/5">04</div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">OUTPUT</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">Summaries & Flowcharts</h2>
              <p className="text-lg text-gray-500 leading-relaxed font-light">
                Get a concise executive summary instantly. SumItUp also visualizes complex discussions 
                into linear flowcharts, making it easy to see process changes or project roadmaps at a glance.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full border border-primary/30 text-primary flex items-center justify-center text-xs font-bold bg-primary/5">05</div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">INTERACT</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">Chat with Your Meeting</h2>
              <p className="text-lg text-gray-500 leading-relaxed font-light">
                Forget scrolling through hours of video. Use the built-in AI chat assistant to ask specific 
                questions like <span className="italic">"What was the budget for marketing?"</span> and get an instant, cited answer.
              </p>
            </div>
            
            <div data-aos="fade-left" className="w-full aspect-[4/3] bg-gray-50/50 rounded-2xl border border-gray-200 shadow-xl flex flex-col overflow-hidden">
              <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                   <Bot className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-gray-500 tracking-widest">SUMITUP ASSISTANT</span>
              </div>
              <div className="flex-1 p-6 space-y-6 overflow-hidden bg-gray-50">
                <div className="flex justify-end">
                  <div className="bg-primary text-white text-sm px-5 py-3 rounded-2xl rounded-tr-sm shadow-md">
                    What is the deadline for the beta?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 text-gray-600 text-sm px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm max-w-[90%] leading-relaxed">
                    The beta deadline is set for <span className="font-bold text-gray-900">November 30th</span>, according to the product manager's update at 14:32.
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded p-1.5 text-[10px] text-gray-500 font-medium">
                       <FileText className="w-3 h-3" /> Compare 14:32
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white border-t border-gray-100">
                 <div className="h-10 bg-gray-50 rounded-lg flex items-center px-4 justify-between border border-gray-200">
                    <span className="text-sm text-gray-400">Ask a question...</span>
                    <div className="w-7 h-7 bg-primary rounded flex items-center justify-center text-white shadow-sm">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Enterprise-Grade Security</h2>
          <p className="text-gray-500 mb-12 font-light">
            Your conversations are private. We do not train our AI models on your data.
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-2">
               <CheckCircle className="w-5 h-5 text-gray-400" />
               <span className="text-sm font-semibold text-gray-700">SOC2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
               <Lock className="w-5 h-5 text-gray-400" />
               <span className="text-sm font-semibold text-gray-700">AES-256 Encryption</span>
            </div>
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-5 h-5 text-gray-400" />
               <span className="text-sm font-semibold text-gray-700">GDPR Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-primary rounded-[40px] text-center p-12 md:p-20 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow effect */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Ready to make meetings useful?
            </h2>
            <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto font-light">
              Join 10,000+ teams who save hours every week with SumItUp.
            </p>
            <div className="flex flex-col items-center gap-4">
              <Link 
                to="/signup" 
                className="px-10 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-lg"
              >
                Get Started for Free
              </Link>
              <p className="text-xs text-white/60 mt-2 tracking-widest">
                NO CREDIT CARD REQUIRED. CANCEL ANYTIME.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HowItWorksPage;