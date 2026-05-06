'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Mail,
  MessageSquare,
  Monitor,
  Activity,
  ArrowRight,
  Database,
  Shield,
  Zap,
  Globe,
  Brain,
  BarChart3,
  GitBranch,
} from 'lucide-react';

// Dynamic import for Three.js to avoid SSR
const ParticleGlobe = dynamic(() => import('@/components/ParticleGlobe'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// Counter hook with IntersectionObserver
function useCounter(end: number, duration: 2, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return count;
}

// Metrics counter component
function MetricsCounter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const metrics = [
    { value: 24, suffix: '/7', label: 'Availability' },
    { value: 87, suffix: '%', label: 'Resolution Rate' },
    { value: 3, suffix: 's', label: 'Response Time', prefix: '<' },
    { value: 95, suffix: '%', label: 'Cross-Channel ID' },
  ];

  return (
    <motion.section
      ref={ref}
      id="metrics"
      className="py-20 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
    >
      <div className="max-w-6xl mx-auto">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                variants={fadeInUp}
                className="text-center"
              >
                <motion.div
                  className="text-4xl md:text-6xl font-black text-white mb-2 glow-cyan-text"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  <CounterAnimation end={metric.value} start={isInView} prefix={metric.prefix} suffix={metric.suffix} />
                </motion.div>
                <p className="text-sm md:text-base text-cyan-300/80 font-medium">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function CounterAnimation({ end, start, prefix = '', suffix = '' }: { end: number; start: boolean; prefix?: string; suffix?: string }) {
  const count = useCounter(end, 2, start);
  return <span>{prefix}{count}{suffix}</span>;
}

// Architecture Flow Component
function ArchitectureFlow() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const nodes = [
    { icon: Mail, label: 'Email', color: 'from-blue-500 to-cyan-400' },
    { icon: MessageSquare, label: 'WhatsApp', color: 'from-green-500 to-emerald-400' },
    { icon: Monitor, label: 'Web Form', color: 'from-purple-500 to-violet-400' },
    { icon: Activity, label: 'Kafka', color: 'from-orange-500 to-yellow-400' },
    { icon: Brain, label: 'AI Agent', color: 'from-cyan-500 to-blue-400' },
    { icon: Database, label: 'PostgreSQL', color: 'from-indigo-500 to-blue-400' },
    { icon: Zap, label: 'Reply', color: 'from-pink-500 to-rose-400' },
  ];

  return (
    <motion.section
      ref={ref}
      className="py-20 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
    >
      <div className="max-w-7xl mx-auto">
        <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-black text-center mb-4">
          Architecture <span className="text-cyan-400">Flow</span>
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Seamless event-driven pipeline from intake to response
        </motion.p>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-2">
          {nodes.map((node, i) => (
            <motion.div
              key={node.label}
              variants={fadeInUp}
              custom={i}
              className="flex flex-col md:flex-row items-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className={`relative bg-gradient-to-br ${node.color} p-1 rounded-2xl glow-cyan`}
              >
                <div className="bg-[#0a0f1e] rounded-xl px-6 py-4 flex flex-col items-center gap-2">
                  <node.icon className="w-8 h-8 text-white" />
                  <span className="text-white font-bold text-sm">{node.label}</span>
                </div>
              </motion.div>

              {i < nodes.length - 1 && (
                <motion.div
                  className="hidden md:flex items-center"
                  initial={{ opacity: 0.3 }}
                  animate={isInView ? { opacity: [0.3, 1, 0.3] } : {}}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  <ArrowRight className="w-6 h-6 text-cyan-400" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile flow */}
        <div className="md:hidden mt-8 space-y-2">
          {nodes.map((node, i) => (
            <motion.div
              key={node.label}
              variants={fadeInUp}
              custom={i}
              className="flex items-center gap-3"
            >
              <div className={`bg-gradient-to-br ${node.color} p-1 rounded-lg`}>
                <div className="bg-[#0a0f1e] rounded-lg p-2">
                  <node.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="text-white font-medium text-sm">{node.label}</span>
              {i < nodes.length - 1 && <ArrowRight className="w-4 h-4 text-cyan-400 ml-2 rotate-90" />}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// Main Landing Page
export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);

  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Zap, title: 'Sub-3s AI Responses', desc: 'GPT-4o powered instant responses with intelligent context handling' },
    { icon: Globe, title: 'Omnichannel Intake', desc: 'Email, WhatsApp, Web Form — unified ticket ingestion via Kafka' },
    { icon: Brain, title: 'Sentiment Intelligence', desc: 'Real-time sentiment analysis with automatic escalation triggers' },
    { icon: BarChart3, title: 'Live CRM Analytics', desc: 'PostgreSQL-backed dashboards with real-time metrics and trends' },
    { icon: GitBranch, title: 'Event-Driven Architecture', desc: 'Apache Kafka event bus for reliable, scalable message processing' },
    { icon: Shield, title: 'Smart Guardrails', desc: 'Built-in safety rules: no competitor talk, feature promises, or tone mismatches' },
  ];

  const channels = [
    {
      name: 'Email',
      icon: Mail,
      color: 'from-blue-500 to-cyan-400',
      specs: ['IMAP Polling / IDLE', 'SMTP with STARTTLS', 'Threading via References', 'Gmail, Outlook, Yahoo'],
    },
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-400',
      specs: ['Whapi.Cloud Integration', 'Webhook Handlers', 'Media & Group Support', 'Delivery Receipts'],
    },
    {
      name: 'Web Form',
      icon: Monitor,
      color: 'from-purple-500 to-violet-400',
      specs: ['FastAPI Endpoint', 'Embeddable Form', 'Email Confirmation', 'RESTful API'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#050813] bg-grid">
      {/* Fixed Navigation */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navScrolled ? 'bg-[#050813]/90 backdrop-blur-xl border-b border-cyan-500/20' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-2">
              <span className="text-2xl">☁️</span>
              <span className="text-xl md:text-2xl font-black text-white">
                Cloud<span className="text-cyan-400">Manage</span> FTE
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">Features</a>
              <a href="#metrics" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">Metrics</a>
              <a href="#channels" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">Channels</a>
            </div>

            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-6 py-2.5 rounded-full font-bold text-white overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  Open Dashboard <ArrowRight className="w-4 h-4" />
                </span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-screen flex items-center pt-20 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight">
                Your AI
                <br />
                <span className="gradient-text">Customer Success</span>
                <br />
                Employee
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed">
                A <span className="text-cyan-400 font-bold">24/7 AI Digital FTE</span> handling Email, WhatsApp & Web Form — powered by GPT-4o, Apache Kafka, Neon PostgreSQL. Replacing a <span className="text-violet-400 font-bold">$75K/yr</span> role at under <span className="text-cyan-400 font-bold">$1,000/year</span>.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative px-8 py-4 rounded-full text-lg font-bold text-white overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-500 blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-3">
                      See Dashboard <ArrowRight className="w-5 h-5" />
                    </span>
                  </motion.button>
                </Link>

                <a href="#features">
                  <motion.button
                    whileHover={{ scale: 1.05, borderColor: '#22d3ee' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-full text-lg font-bold text-white border-2 border-gray-600 hover:border-cyan-400 transition-colors"
                  >
                    Explore Features ↓
                  </motion.button>
                </a>
              </motion.div>

              {/* Channel badges */}
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 pt-4">
                {[
                  { label: 'Email · IMAP/SMTP', color: 'bg-blue-500' },
                  { label: 'WhatsApp · Whapi', color: 'bg-green-500' },
                  { label: 'Web Form · FastAPI', color: 'bg-purple-500' },
                  { label: 'Kafka · Event Bus', color: 'bg-orange-500' },
                ].map((badge) => (
                  <motion.div
                    key={badge.label}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700"
                  >
                    <span className={`pulse-dot w-2 h-2 rounded-full ${badge.color}`} />
                    <span className="text-sm text-gray-300">{badge.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right side - Three.js Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative h-[400px] md:h-[600px] lg:h-[700px] will-change-transform"
            >
              <ParticleGlobe className="w-full h-full" />
              {/* Glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050813] via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Metrics Strip */}
      <MetricsCounter />

      {/* Features Grid */}
      <motion.section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-black text-center mb-4">
            Powerful <span className="text-cyan-400">Features</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Everything you need to automate customer support at enterprise scale
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative bg-gray-900/50 rounded-2xl p-6 border border-gray-800 hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Architecture Flow */}
      <ArchitectureFlow />

      {/* Channels Section */}
      <motion.section
        id="channels"
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-black text-center mb-4">
            Multi-Channel <span className="text-cyan-400">Intake</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Connect with customers on their preferred platform
          </motion.p>

          <div className="grid md:grid-cols-3 gap-6">
            {channels.map((channel, i) => (
              <motion.div
                key={channel.name}
                variants={fadeInUp}
                whileHover={{
                  rotateY: 5,
                  rotateX: -5,
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative bg-gray-900/50 rounded-2xl p-6 border border-gray-800 hover:border-cyan-500/30 transition-all"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${channel.color} rounded-xl flex items-center justify-center mb-4`}>
                  <channel.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{channel.name}</h3>
                <ul className="space-y-2">
                  {channel.specs.map((spec) => (
                    <li key={spec} className="flex items-center gap-2 text-gray-400 text-sm">
                      <ArrowRight className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Banner */}
      <motion.section
        className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {/* Particle background effect */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-black mb-8">
            Start <span className="gradient-text">Automating</span> Your
            <br />
            Customer Support
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Deploy your AI Digital FTE today and transform your customer experience
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-12 py-6 rounded-full text-xl font-bold text-white overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-500 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-3">
                  Open Dashboard <ArrowRight className="w-6 h-6" />
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            ☁️ CloudManage FTE · CRM Digital FTE Factory Hackathon 2025 · Built with OpenAI Agents SDK + Kafka + PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  );
}
