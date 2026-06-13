import { Link } from 'react-router-dom';
import heroPremiumImg from '../../../assets/home/hero-premium.png';
import { 
  CheckCircle2, 
  MessageSquare, 
  Share2, 
  Lock, 
  Zap, 
  ShieldCheck, 
  TrendingUp,
  GraduationCap,
  Briefcase,
  Rocket,
  ArrowRight,
  Play
} from 'lucide-react';

const HomePage = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">New: Visual Process Mapping v2.0</span>
              </div>
              
              {/* Heading */}
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight leading-[1.1]">
                Turn meetings into <br />
                <span className="text-primary">memory, clarity, and action.</span>
              </h1>
              
              {/* Description */}
              <p className="text-lg text-gray-500 mb-10 max-w-xl leading-relaxed font-light">
                Never miss a decision. We provide private, secure, and accurate AI summaries for your team, turning hours of talk into actionable insights.
              </p>
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link 
                  to="/signup" 
                  className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 text-center"
                >
                  Start Free Trial
                </Link>
                <Link 
                  to="/how-it-works" 
                  className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" /> See How It Works
                </Link>
              </div>
              
              {/* Trust Indicator */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc",
                    "https://images.unsplash.com/photo-1550525811-e5869dd03032",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                  ].map((src, i) => (
                    <img 
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                      src={src + "?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                      alt="User avatar"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-400">Trusted by <span className="font-bold text-gray-900">2,000+ teams</span> worldwide</p>
              </div>
            </div>
            
            {/* Hero Image */}
            <div data-aos="fade-left" className="relative lg:mt-0 mt-12">
              <div className="absolute -inset-4 bg-primary/10 rounded-[40px] blur-3xl opacity-50" />
              <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-gray-200/50">
                <img
                  className="w-full h-auto object-cover"
                  src={heroPremiumImg}
                  alt="Premium Meeting Assistant Dashboard"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Bar */}
      <section className="py-16 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-10">Trusted by innovative teams at</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale">
             {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-32 bg-gray-300 rounded" />
             ))}
          </div>
        </div>
      </section>

      {/* Why choose SumItUp? Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <span className="text-primary font-bold text-xs uppercase tracking-widest mb-4 block">Features</span>
          <h2 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">Why choose SumItUp?</h2>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
            Everything you need to make meetings productive, secure, and actionable, 
            without the administrative overhead.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Smart meeting summaries", desc: "Automated AI notes that capture every detail, action item, and decision point with human-level accuracy.", icon: <CheckCircle2 className="w-5 h-5" /> },
            { title: "Visual flow diagrams", desc: "Turn complex discussions into clear process maps and flowcharts instantly to visualize workflows.", icon: <TrendingUp className="w-5 h-5" /> },
            { title: "Chat with past meetings", desc: "Query your entire meeting history with natural language. Ask: \"What did we decide about Q3 budget?\"", icon: <MessageSquare className="w-5 h-5" /> },
            { title: "Self-hosted & privacy-first", desc: "Your data never leaves your infrastructure if you choose. Enterprise-grade security protocols included.", icon: <Lock className="w-5 h-5" /> },
            { title: "Affordable for teams", desc: "Simple per-seat pricing that scales with your organization. No hidden enterprise \"contact us\" walls.", icon: <Zap className="w-5 h-5" /> },
            { title: "Seamless integrations", desc: "Works with Zoom, Google Meet, Teams, and pushes action items directly to Jira, Asana, or Notion.", icon: <Share2 className="w-5 h-5" /> }
          ].map((feature, i) => (
            <div 
              key={i} 
              data-aos="fade-up" 
              data-aos-delay={i * 50}
              className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-8 text-primary group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed font-light">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Built for clarity across industries Section */}
      <section className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">Built for clarity across industries</h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
              Whether you are teaching the next generation or hiring them, SumItUp adapts to your conversation style.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Universities & Faculty", desc: "Capture lectures, seminars, and research discussions with precision. Generate study guides automatically from lecture transcripts.", icon: <GraduationCap className="w-6 h-6" />, color: "bg-blue-500" },
              { title: "Recruiters & HR", desc: "Document candidate responses and interviewer feedback effortlessly. Compare candidate answers side-by-side without bias.", icon: <Briefcase className="w-6 h-6" />, color: "bg-purple-500" },
              { title: "Startups & Remote", desc: "Keep distributed teams aligned with asynchronous updates. Turn a 30-minute sync into a 2-minute readable update for the team.", icon: <Rocket className="w-6 h-6" />, color: "bg-green-500" }
            ].map((industry, i) => (
              <div key={i} data-aos="fade-up" data-aos-delay={i * 100} className="p-10 rounded-[40px] bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all">
                <div className={`w-14 h-14 ${industry.color} rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg`}>
                  {industry.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{industry.title}</h3>
                <p className="text-gray-500 mb-10 leading-relaxed font-light">{industry.desc}</p>
                <Link to="#" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your data stays yours. Period. Section */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div data-aos="fade-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 mb-8">
               <ShieldCheck className="w-4 h-4 text-green-600" />
               <span className="text-xs font-bold uppercase tracking-wider text-green-700">Security First</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-8 tracking-tight">Your data stays yours. Period.</h2>
            <p className="text-xl text-gray-500 mb-12 font-light leading-relaxed">
              We believe that meeting data is sensitive intellectual property. 
              That's why we offer deployment options that prioritize your sovereignty.
            </p>
            
            <div className="space-y-8">
               {[
                  { title: "Self-Hosted Option", desc: "Deploy via Docker on your own AWS/Azure private cloud." },
                  { title: "Open Source Core", desc: "Inspect our processing logic on GitHub. No black boxes." },
                  { title: "SOC 2 Type II Compliant", desc: "Rigorously tested security controls and annual audits." }
               ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                     <div className="mt-1">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-gray-500 font-light">{item.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
          </div>
          
          <div data-aos="fade-left" className="relative">
             <div className="absolute -inset-10 bg-primary/5 rounded-full blur-3xl" />
             {/* Code/Terminal Mockup */}
             <div className="relative bg-[#0F172A] rounded-2xl p-6 shadow-2xl border border-gray-800 font-mono text-sm leading-relaxed overflow-hidden">
                <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                   <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                   </div>
                   <div className="text-[10px] text-gray-500 uppercase tracking-widest">docker-compose.yml</div>
                </div>
                <div className="space-y-1">
                   <div className="text-blue-400">services:</div>
                   <div className="pl-4 text-pink-400">sumitup-core:</div>
                   <div className="pl-8"><span className="text-green-400">image:</span> <span className="text-white">sumitup/enterprise:latest</span></div>
                   <div className="pl-8 text-pink-400">environment:</div>
                   <div className="pl-12"><span className="text-yellow-400">DATA_RESIDENCY:</span> <span className="text-white">"LOCAL"</span></div>
                   <div className="pl-12"><span className="text-yellow-400">ENCRYPTION:</span> <span className="text-white">"AES-256"</span></div>
                   <div className="pl-8 text-gray-500"># No external egress allowed</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Start using SumItUp today Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 text-center bg-white border-t border-gray-100">
        <h2 className="text-5xl font-bold text-gray-900 mb-8 tracking-tight">Start using SumItUp today</h2>
        <p className="text-xl text-gray-500 mb-14 max-w-2xl mx-auto font-light leading-relaxed">
          Join thousands of teams who have stopped taking notes and started taking action. 
          Free for your first 10 meetings.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link 
            to="/signup" 
            className="px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all"
          >
            Get Started for Free
          </Link>
          <Link 
            to="/contact" 
            className="px-10 py-5 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            Contact Sales
          </Link>
        </div>
        <p className="mt-8 text-xs text-gray-400 uppercase tracking-widest">No credit card required. Cancel anytime.</p>
      </section>
    </div>
  );
};

export default HomePage;