import { Shield, Cpu, Lock, CheckCircle2, ArrowRight, History, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import sarahImg from "../../../assets/about/sarah.png";
import markImg from "../../../assets/about/mark.png";
import elenaImg from "../../../assets/about/elena.png";
import davidImg from "../../../assets/about/david.png";

const AboutPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div 
          data-aos="fade-up"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-10"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Our Mission</span>
        </div>
        
        <h1 
          data-aos="fade-up"
          data-aos-delay="100"
          className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 tracking-tight"
        >
          We don't just transcribe.<br />
          <span className="text-primary">We understand.</span>
        </h1>
        
        <p 
          data-aos="fade-up"
          data-aos-delay="200"
          className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-light"
        >
          Turning talk into truth. Modern work is drowning in meetings—<br className="hidden md:block" />
          SumItUp extracts structured knowledge, not just raw words. We help<br className="hidden md:block" />
          teams move faster by cutting through the noise.
        </p>
      </section>

      {/* The Transcript Trap */}
      <section className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div data-aos="fade-right">
              <h2 className="text-5xl font-bold text-gray-900 mb-8 tracking-tight">The Transcript Trap</h2>
              <div className="space-y-6 text-xl text-gray-500 leading-relaxed font-light">
                <p>
                  Reading a 1-hour transcript takes too long. Existing tools fall short by 
                  focusing only on raw text, leaving you to sift through "umms," "ahhs," 
                  and small talk to find the one decision that matters.
                </p>
                <p>
                  We believe your time is better spent executing decisions, not hunting 
                  for them in a wall of text.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-16">
                <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6">
                    <History className="w-6 h-6 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">The Old Way</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Endless scrolling, lost context, and privacy risks from cloud storage.
                  </p>
                </div>
                <div className="p-8 rounded-3xl bg-white border border-primary/10 shadow-sm transition-all hover:shadow-md ring-1 ring-primary/5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2">The SumItUp Way</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Instant structured data, local processing, and actionable summaries.
                  </p>
                </div>
              </div>
            </div>
            
            <div data-aos="fade-left" className="relative lg:ml-auto w-full max-w-lg">
              {/* Background Mockup Container */}
              <div className="relative aspect-[4/3] bg-gray-100 rounded-[32px] overflow-hidden border border-gray-200 shadow-inner flex items-center justify-center p-12">
                {/* Blurred transcript lines in background */}
                <div className="absolute inset-0 p-8 space-y-4 opacity-20">
                  <div className="h-2 w-3/4 bg-gray-400 rounded-full" />
                  <div className="h-2 w-1/2 bg-gray-400 rounded-full" />
                  <div className="h-2 w-2/3 bg-gray-400 rounded-full" />
                  <div className="h-2 w-1/3 bg-gray-400 rounded-full" />
                  <div className="h-2 w-3/4 bg-gray-400 rounded-full" />
                </div>

                {/* The Floating Action Items Card */}
                <div className="relative w-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-6 md:p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                      <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                    <span className="font-bold text-gray-900 text-sm md:text-base">Action Items Extracted</span>
                  </div>

                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-5 h-5 rounded border-2 border-gray-100 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <div className="h-2 w-24 bg-gray-100 rounded-full" />
                          <div className="h-2 w-full bg-gray-50 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Decorative Blur */}
              <div className="absolute -inset-10 bg-primary/5 rounded-[40px] blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 
          data-aos="fade-up"
          className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 tracking-tight"
        >
          Built for the Enterprise,<br />designed for humans.
        </h2>
        <p 
          data-aos="fade-up"
          data-aos-delay="100"
          className="text-xl text-gray-400 mb-24 max-w-3xl mx-auto font-light"
        >
          We prioritize clarity and security above all else. Here is what makes SumItUp 
          the trusted choice for modern organizations.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { 
              title: "Structured Knowledge", 
              desc: "We don't just dump text. Our AI identifies decisions, tasks, sentiment, and blockers, converting conversation into a database.",
              icon: <Cpu className="w-7 h-7" />
            },
            { 
              title: "Privacy First", 
              desc: "Your data stays yours. We do not train our models on your proprietary secrets. SOC2 Type II compliant and GDPR ready.",
              icon: <Lock className="w-7 h-7" />
            },
            { 
              title: "Transparent Pricing", 
              desc: "Enterprise power without the enterprise tax. Predictable per-seat pricing with no hidden overage fees or complex contracts.",
              icon: <Shield className="w-7 h-7" />
            }
          ].map((feature, i) => (
            <div key={i} data-aos="fade-up" data-aos-delay={200 + (i * 100)} className="group">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                <div className="text-white">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed font-light">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section className="py-32 bg-white border-y border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-20">
          <div data-aos="fade-right" className="max-w-2xl text-center lg:text-left">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">Enterprise-Grade Security</h2>
            <p className="text-xl text-gray-500 mb-10 font-light leading-relaxed">
              Security isn't an afterthought; it's our foundation. From end-to-end encryption 
              to granular permission controls, SumItUp is built to protect your most sensitive conversations.
            </p>
            <Link to="/security" className="inline-flex items-center gap-2 text-primary font-bold text-lg hover:gap-4 transition-all">
              Read our Security Whitepaper <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
          
          <div data-aos="fade-left" className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full lg:w-auto">
            {[
              { label: 'SOC2 Type II', icon: <CheckCircle2 className="w-8 h-8" /> },
              { label: 'GDPR Ready', icon: <CheckCircle2 className="w-8 h-8" /> },
              { label: 'Encrypted', icon: <Lock className="w-8 h-8" /> }
            ].map((item, idx) => (
              <div key={idx} className="w-44 h-36 rounded-3xl bg-gray-50/50 flex flex-col items-center justify-center gap-4 border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-500">
                <div className="text-gray-300">
                  {item.icon}
                </div>
                <span className="text-sm font-bold uppercase tracking-widest text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center lg:text-left mb-24">
          <h2 data-aos="fade-up" className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">The Team</h2>
          <p data-aos="fade-up" data-aos-delay="100" className="text-xl text-gray-500 font-light">
            Engineers, linguists, and designers obsessed with clarity.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { name: "Sarah Chen", role: "Co-Founder & CEO", img: sarahImg },
            { name: "Mark Davis", role: "CTO", img: markImg },
            { name: "Elena Rodriguez", role: "Head of Product", img: elenaImg },
            { name: "David Kim", role: "Lead Engineer", img: davidImg }
          ].map((member, idx) => (
            <div 
              key={idx} 
              data-aos="fade-up" 
              data-aos-delay={idx * 100}
              className="group cursor-default"
            >
              <div className="relative overflow-hidden rounded-[32px] aspect-[4/5] mb-8 grayscale group-hover:grayscale-0 transition-all duration-700 shadow-lg group-hover:shadow-2xl">
                <img 
                  src={member.img} 
                  alt={member.name} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
              <p className="text-lg font-medium text-primary">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div 
          data-aos="zoom-in"
          className="max-w-6xl mx-auto rounded-[48px] bg-primary py-24 px-12 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/30"
        >
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-[100px]" />
          
          <h2 className="text-5xl md:text-6xl font-bold mb-8 relative z-10 tracking-tight leading-tight">
            Ready for better meetings?
          </h2>
          <p className="text-xl md:text-2xl text-white/80 mb-14 max-w-2xl mx-auto relative z-10 font-light leading-relaxed">
            Join thousands of forward-thinking teams turning conversation into their competitive advantage.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
            <Link 
              to="/signup" 
              className="px-10 py-5 rounded-2xl bg-white text-primary font-bold text-lg hover:shadow-xl hover:shadow-black/10 transition-all transform hover:-translate-y-1"
            >
              Get Started for Free
            </Link>
            <Link 
              to="/demo" 
              className="px-10 py-5 rounded-2xl bg-primary-dark border-2 border-white/20 text-white font-bold text-lg hover:bg-white/10 transition-all transform hover:-translate-y-1"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;