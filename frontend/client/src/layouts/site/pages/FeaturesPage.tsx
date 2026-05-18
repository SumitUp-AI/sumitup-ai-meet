import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, 
  Network, 
  ShieldCheck, 
  Video, 
  Zap, 
  FileJson,
  ArrowRight,
  Database,
  Cpu
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  }
};

const FeaturesPage = () => {
  return (
    <div className="bg-white min-h-screen font-sans selection:bg-primary/20">
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 max-w-6xl mx-auto text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-600">SumItUp Core Architecture</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-[1.1]"
        >
          Powerful AI capabilities. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Zero compromises.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
        >
          Discover the enterprise-grade architecture powering SumItUp. From lightning-fast Llama 3.1 inference to strict JSON extraction, our backend is built to process your meetings securely and flawlessly.
        </motion.p>
      </section>

      {/* Product Flow / Workflow Visual */}
      <section className="py-20 px-4 border-y border-gray-100 bg-gray-50/50 overflow-hidden relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">The Inference Pipeline</h2>
            <p className="text-gray-500 font-light">How raw audio transforms into structured intelligence in seconds.</p>
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 max-w-5xl mx-auto">
            {/* Connecting Lines (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 z-0">
               <motion.div 
                 className="h-full w-24 bg-primary rounded-full blur-sm"
                 animate={{ x: ['0%', '1000%'] }}
                 transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
               />
            </div>

            {/* Step 1 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="z-10 bg-white p-6 rounded-2xl border border-gray-200 shadow-xl w-full md:w-64 text-center group"
            >
              <div className="w-14 h-14 mx-auto bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 mb-4 group-hover:scale-110 transition-transform duration-300">
                <Video className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Ingestion</h3>
              <p className="text-xs text-gray-500">Zoom OAuth / Webhooks deliver raw diarized transcripts instantly.</p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="z-10 bg-white p-6 rounded-2xl border border-gray-200 shadow-xl w-full md:w-64 text-center relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 mx-auto bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 mb-4 group-hover:rotate-12 transition-transform duration-300">
                  <Cpu className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Refine Chain</h3>
                <p className="text-xs text-gray-500">Recursive character splitting processes chunks via Llama 3.1 LLM.</p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="z-10 bg-white p-6 rounded-2xl border border-gray-200 shadow-xl w-full md:w-64 text-center group"
            >
              <div className="w-14 h-14 mx-auto bg-green-50 rounded-xl flex items-center justify-center border border-green-100 mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileJson className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Structured Output</h3>
              <p className="text-xs text-gray-500">Pydantic parsers strictly extract JSON action items and deadlines.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-32 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Backend Capabilities</h2>
          <p className="text-lg text-gray-500 font-light">Built on FastAPI and optimized for massive concurrency.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Feature 1 (Large) */}
          <motion.div variants={itemVariants} className="md:col-span-2 bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <BrainCircuit className="w-64 h-64 text-primary" />
            </div>
            <div className="relative z-10 max-w-lg">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Llama-3.1-8b Powered Intelligence</h3>
              <p className="text-gray-500 leading-relaxed font-light text-lg mb-8">
                Leveraging Groq's ultra-fast inference APIs. Our recursive chunking and LangChain refine-chain architecture processes hours of transcripts in seconds, ensuring facts are grounded and hallucination-free.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                View pipeline architecture <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>

          {/* Feature 2 (Tall) */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileJson className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Precision JSON Extraction</h3>
            <p className="text-gray-500 leading-relaxed font-light mb-6">
              We don't just generate text. Our pipeline uses sophisticated Pydantic Output Parsers to strictly extract action items into validated JSON schemas.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                 Assignee Detection
              </li>
              <li className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                 Deadline Normalization
              </li>
              <li className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                 AI Confidence Scoring (&gt;0.5)
              </li>
            </ul>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={itemVariants} className="bg-[#0F172A] rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gray-800 text-white flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Enterprise Multi-Tenancy</h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Your data is strictly isolated. Our custom FastAPI Tenant Middleware and request limiters guarantee enterprise-grade security and prevent cross-tenant data bleed at the network edge.
              </p>
            </div>
          </motion.div>

          {/* Feature 4 (Wide) */}
          <motion.div variants={itemVariants} className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row gap-8 items-center group">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Network className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Native Zoom Integration & Webhooks</h3>
              <p className="text-gray-500 leading-relaxed font-light">
                Connect your Zoom account with a single click via secure OAuth 2.0. We handle token refresh lifecycles automatically so your transcripts sync without intervention. 
              </p>
            </div>
            <div className="w-full md:w-64 bg-gray-50 rounded-2xl p-4 border border-gray-100 shrink-0 relative overflow-hidden">
               {/* Mockup Terminal */}
               <div className="flex gap-1.5 mb-3">
                 <div className="w-2 h-2 rounded-full bg-red-400" />
                 <div className="w-2 h-2 rounded-full bg-yellow-400" />
                 <div className="w-2 h-2 rounded-full bg-green-400" />
               </div>
               <div className="font-mono text-[10px] space-y-2">
                 <div className="text-gray-400">POST /api/v1/zoom/callback</div>
                 <div className="text-green-600">200 OK</div>
                 <div className="text-gray-400">Fetching access_token...</div>
                 <div className="text-primary font-bold">Zoom Connected ✓</div>
               </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Database className="w-16 h-16 text-gray-300 mx-auto mb-8" />
          <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">Ready to leverage this architecture?</h2>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-light">
            Deploy on your own infrastructure or let us handle the compute. Either way, you get the same powerful backend.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/signup" className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
              Start Building Now
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default FeaturesPage;