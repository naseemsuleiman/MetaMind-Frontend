
// frontend/src/pages/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GiBrain, GiArcheryTarget, GiAlarmClock, GiProgression } from 'react-icons/gi';
import { IoIosRocket } from 'react-icons/io';
import { FiArrowRight, FiActivity, FiTrendingUp, FiUsers, FiBookOpen, FiTarget, FiCheck } from 'react-icons/fi';

const LandingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: <GiBrain />,
      title: "Metacognitive Monitoring",
      description: "Track your attention, focus, and comprehension in real-time",
      color: "from-mindful-blue to-cognitive-teal",
      bgColor: "bg-gradient-to-br from-mindful-blue/20 to-cognitive-teal/20",
      pulseColor: "bg-mindful-blue/30"
    },
    {
      icon: <GiArcheryTarget />,
      title: "Personalized Interventions",
      description: "Receive smart prompts when you're zoning out or stuck",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
      pulseColor: "bg-blue-500/30"
    },
    {
      icon: <GiAlarmClock />,
      title: "Optimal Learning Schedule",
      description: "Learn at times when your brain is most receptive",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
      pulseColor: "bg-green-500/30"
    },
    {
      icon: <GiProgression />,
      title: "Progress Visualization",
      description: "See your cognitive development over time",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-500/20 to-red-500/20",
      pulseColor: "bg-orange-500/30"
    }
  ];

  const learningStages = [
    {
      stage: "Input",
      title: "Passive Consumption",
      problem: "Reading/watching without engagement",
      solution: "Active monitoring prompts interaction",
      icon: <FiBookOpen />,
      color: "text-mindful-blue",
      bgColor: "bg-mindful-blue/10"
    },
    {
      stage: "Processing",
      title: "Surface Understanding",
      problem: "Memorizing facts vs understanding concepts",
      solution: "Depth-focused questioning system",
      icon: <FiTarget />,
      color: "text-cognitive-teal",
      bgColor: "bg-cognitive-teal/10"
    },
    {
      stage: "Output",
      title: "Application Gap",
      problem: "Knowing theory but struggling with practice",
      solution: "Context-based application exercises",
      icon: <FiActivity />,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      stage: "Retention",
      title: "Forgetting Curve",
      problem: "Losing knowledge over time",
      solution: "Spaced repetition optimized for you",
      icon: <FiTrendingUp />,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background-light via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-mindful-blue to-cognitive-teal flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <GiBrain className="text-white text-3xl" />
          </motion.div>
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-metacognitive-gray font-medium text-lg"
          >
            Loading MetaMind...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-light via-white to-gray-50 text-metacognitive-gray overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-gradient-to-r from-mindful-blue/5 to-cognitive-teal/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-gradient-to-r from-cognitive-teal/5 to-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-mindful-blue/3 to-transparent rounded-full blur-2xl"></div>
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed top-0 w-full bg-white/90 backdrop-blur-xl z-50 border-b border-gray-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => window.scrollTo(0, 0)}
            >
              <motion.div 
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-mindful-blue to-cognitive-teal flex items-center justify-center shadow-md"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <GiBrain className="text-white text-xl" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-mindful-blue to-cognitive-teal bg-clip-text text-transparent">
                MetaMind
              </span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              {["Features", "Science", "Process"].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-600 hover:text-metacognitive-gray font-medium relative group"
                  whileHover={{ y: -2 }}
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-mindful-blue to-cognitive-teal group-hover:w-full transition-all duration-300"></span>
                </motion.a>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-gray-600 hover:text-metacognitive-gray font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Sign In
              </motion.button>
              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="px-6 py-2.5 bg-gradient-to-r from-mindful-blue to-cognitive-teal text-white font-medium rounded-lg shadow-lg shadow-mindful-blue/30 hover:shadow-xl hover:shadow-mindful-blue/40 transition-all"
              >
                Start Learning
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center px-4 py-2.5 rounded-full bg-gradient-to-r from-mindful-blue/10 to-cognitive-teal/10 text-mindful-blue font-medium mb-8 border border-mindful-blue/20 shadow-sm"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <GiBrain />
                </motion.div>
                Cognitive Learning Platform
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-metacognitive-gray"
              >
                Learn How You
                <motion.span 
                  className="block bg-gradient-to-r from-mindful-blue via-blue-400 to-cognitive-teal bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  Actually Learn
                </motion.span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 mb-10 leading-relaxed"
              >
                Most learning platforms teach you <span className="font-semibold text-mindful-blue">what</span> to know. 
                MetaMind teaches you <span className="font-semibold text-cognitive-teal">how</span> you know it.
              </motion.p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <motion.button 
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="px-10 py-5 bg-gradient-to-r from-mindful-blue to-cognitive-teal text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center shadow-xl shadow-mindful-blue/30"
                >
                  Begin Your Journey
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <IoIosRocket className="ml-3 text-xl" />
                  </motion.div>
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.05, borderColor: "#4F46E5" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('science').scrollIntoView({ behavior: 'smooth' })}
                  className="px-10 py-5 border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:border-mindful-blue hover:text-mindful-blue transition-all bg-white/50 backdrop-blur-sm"
                >
                  Learn More
                </motion.button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: "Cognitive", sub: "Awareness", color: "text-mindful-blue" },
                  { label: "Personalized", sub: "Adaptation", color: "text-cognitive-teal" },
                  { label: "Real-time", sub: "Feedback", color: "text-blue-500" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                    className="p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className={`text-2xl font-bold ${item.color} mb-1`}>{item.label}</div>
                    <div className="text-sm text-gray-500">{item.sub}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
              className="relative"
            >
              {/* Learning Process Card */}
              <div className="relative p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-mindful-blue to-cognitive-teal text-white px-6 py-2 rounded-full shadow-lg">
                  <h3 className="font-bold">Learning Process</h3>
                </div>
                
                <div className="mb-10 mt-4 text-center">
                  <p className="text-gray-600">Four stages of knowledge acquisition</p>
                </div>

                {/* Animated Process Steps */}
                <div className="space-y-6">
                  {[
                    { name: "Attention", desc: "Focusing cognitive resources on relevant information", color: "bg-mindful-blue", delay: 0 },
                    { name: "Comprehension", desc: "Understanding and interpreting the information", color: "bg-cognitive-teal", delay: 0.1 },
                    { name: "Retention", desc: "Storing knowledge in long-term memory", color: "bg-green-500", delay: 0.2 },
                    { name: "Application", desc: "Applying knowledge to solve problems", color: "bg-orange-500", delay: 0.3 }
                  ].map((step, index) => (
                    <motion.div
                      key={step.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + step.delay }}
                      whileHover={{ x: 5 }}
                      className="flex items-start space-x-4 p-5 bg-gradient-to-r from-white to-gray-50/50 rounded-xl border border-gray-200 hover:border-mindful-blue/30 transition-all group"
                    >
                      <motion.div 
                        className={`flex-shrink-0 w-12 h-12 ${step.color}/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className={`w-3 h-3 rounded-full ${step.color}`}></div>
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-metacognitive-gray text-lg group-hover:text-mindful-blue transition-colors">
                            {step.name}
                          </h3>
                          <motion.span 
                            className={`text-sm ${step.color.replace('bg-', 'text-')}`}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                          >
                            {index + 1}
                          </motion.span>
                        </div>
                        <p className="text-gray-600 text-sm">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Animated Progress Bar */}
                <div className="mt-10">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-mindful-blue via-cognitive-teal to-green-500"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    ></motion.div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-500">Start</span>
                    <span className="text-xs text-gray-500">Complete</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="science" className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-metacognitive-gray">
              The Gap in Modern Learning
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Traditional education focuses on content delivery, not cognitive process
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="p-10 bg-white rounded-2xl border-2 border-red-100 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
              <div className="text-red-500 text-3xl mb-6">❌ The Problem</div>
              <h3 className="text-2xl font-bold mb-8 text-metacognitive-gray group-hover:text-red-600 transition-colors">
                Passive Learning Trap
              </h3>
              <ul className="space-y-6">
                {[
                  "Reading without comprehension",
                  "Memorizing instead of understanding",
                  "No feedback on learning quality",
                  "One-size-fits-all approach"
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start group/item"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-4 mt-1 group-hover/item:scale-110 transition-transform">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    </div>
                    <span className="text-gray-700 text-lg group-hover/item:text-red-600 transition-colors">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="p-10 bg-white rounded-2xl border-2 border-green-100 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <div className="text-green-500 text-3xl mb-6">✅ The Solution</div>
              <h3 className="text-2xl font-bold mb-8 text-metacognitive-gray group-hover:text-green-600 transition-colors">
                Active Cognitive Monitoring
              </h3>
              <ul className="space-y-6">
                {[
                  "Real-time attention tracking",
                  "Personalized comprehension checks",
                  "Adaptive difficulty adjustment",
                  "Cognitive pattern recognition"
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start group/item"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-4 mt-1 group-hover/item:scale-110 transition-transform">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-gray-700 text-lg group-hover/item:text-green-600 transition-colors">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-metacognitive-gray">
              Core Capabilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on cognitive science principles
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring" }}
                whileHover={{ 
                  y: -15,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                }}
                className="p-8 rounded-2xl bg-white border border-gray-200/50 hover:border-transparent transition-all relative group overflow-hidden"
              >
                {/* Pulsing background effect */}
                <motion.div 
                  className={`absolute inset-0 ${feature.pulseColor} opacity-0 group-hover:opacity-20 rounded-2xl`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                <div className={`relative w-16 h-16 rounded-xl flex items-center justify-center mb-8 ${feature.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <motion.div 
                    className={`text-3xl bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {feature.icon}
                  </motion.div>
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-metacognitive-gray group-hover:text-mindful-blue transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600">
                  {feature.description}
                </p>
                
                <motion.div 
                  className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Stages */}
      <section id="stages" className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-metacognitive-gray">
              The Learning Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              How MetaMind guides you through each cognitive stage
            </p>
          </motion.div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-mindful-blue via-cognitive-teal to-green-500 hidden md:block"></div>
            
            <div className="space-y-32">
              {learningStages.map((stage, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, type: "spring" }}
                  className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16`}
                >
                  <div className="md:w-1/2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-white to-gray-50 border border-gray-200 shadow-sm mb-6"
                    >
                      <span className="mr-3 font-bold text-gray-700">Stage {index + 1}</span>
                      <div className={`p-2 rounded-full ${stage.bgColor}`}>
                        <span className={stage.color}>{stage.icon}</span>
                      </div>
                    </motion.div>
                    
                    <h3 className="text-3xl font-bold mb-6 text-metacognitive-gray">{stage.title}</h3>
                    
                    <div className="mb-8">
                      <div className="flex items-center mb-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                        <div className="text-red-500 font-bold">Challenge:</div>
                      </div>
                      <p className="text-gray-700 text-lg pl-6">{stage.problem}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                        <div className="text-green-500 font-bold">MetaMind Solution:</div>
                      </div>
                      <p className="text-gray-700 text-lg pl-6">{stage.solution}</p>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2 relative">
                    {/* Timeline dot */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-4 border-mindful-blue rounded-full shadow-lg hidden md:block"></div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-lg group"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                          className="text-center"
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <div className={`text-6xl mb-4 ${stage.color} opacity-20`}>{stage.stage}</div>
                          <div className="text-gray-400">Process Visualization</div>
                        </motion.div>
                      </div>
                      
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="p-12 rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-mindful-blue to-cognitive-teal"></div>
            
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-6xl text-mindful-blue mx-auto mb-8 text-center"
            >
              <GiBrain />
            </motion.div>
            
            <blockquote className="text-2xl italic text-gray-700 mb-10 leading-relaxed text-center">
              "The most important thing in education is to teach how to learn, not just what to learn. 
              MetaMind is the tool that makes this possible."
            </blockquote>
            
            <div className="text-center text-gray-600 font-medium">
              — Cognitive Learning Philosophy
            </div>
            
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-mindful-blue/20 rounded-full"
                  animate={{
                    y: [0, -100, 0],
                    x: [0, Math.sin(i) * 50, 0]
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + i * 10}%`
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-16 rounded-3xl bg-gradient-to-br from-mindful-blue/10 via-white to-cognitive-teal/10 border-2 border-mindful-blue/20 shadow-2xl relative overflow-hidden"
          >
            {/* Animated background */}
            <motion.div 
              className="absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(79, 70, 229, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(79, 70, 229, 0.1) 0%, transparent 50%)'
                ]
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-metacognitive-gray text-center">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto text-center">
                Join the community of self-aware learners. It's completely free.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <motion.button 
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="px-12 py-5 bg-gradient-to-r from-mindful-blue to-cognitive-teal text-white font-bold rounded-xl shadow-xl shadow-mindful-blue/30 hover:shadow-2xl hover:shadow-mindful-blue/40 transition-all group"
                >
                  Create Your Account
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="inline-block ml-3"
                  >
                    <FiArrowRight className="text-xl" />
                  </motion.span>
                </motion.button>
                
                <button 
                  onClick={() => window.scrollTo(0, 0)}
                  className="px-8 py-4 text-gray-600 hover:text-metacognitive-gray font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Back to Top ↑
                </button>
              </div>
              
              <motion.div 
                className="mt-12 text-gray-600"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-wrap justify-center gap-8">
                  {["No credit card required", "Free forever", "Privacy focused"].map((item, index) => (
                    <motion.div 
                      key={item}
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center bg-white/50 px-4 py-2 rounded-lg backdrop-blur-sm"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                      >
                        <FiCheck className="mr-2 text-green-500" />
                      </motion.div>
                      {item}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 mb-6 md:mb-0"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mindful-blue to-cognitive-teal flex items-center justify-center shadow-md">
                <GiBrain className="text-white text-2xl" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-mindful-blue to-cognitive-teal bg-clip-text text-transparent">
                MetaMind
              </span>
            </motion.div>
            
            <div className="flex space-x-8 mb-6 md:mb-0">
              {["About", "Research", "Contact"].map((item, index) => (
                <motion.a
                  key={item}
                  href="#"
                  className="text-gray-600 hover:text-metacognitive-gray transition-colors relative group"
                  whileHover={{ y: -2 }}
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-mindful-blue to-cognitive-teal group-hover:w-full transition-all duration-300"></span>
                </motion.a>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-center md:text-right"
            >
              <div className="text-gray-500">© {new Date().getFullYear()} MetaMind</div>
              <div className="text-gray-400 text-sm mt-1">Teaching minds how to learn</div>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
