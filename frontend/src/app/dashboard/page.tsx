'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Mail,
  MessageSquare,
  Monitor,
  Activity,
  Zap,
  Users,
  MessageCircle,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ticketsApi, TicketStats } from '@/lib/api';
import { clsx } from 'clsx';
import { useCounter } from '@/hooks/useCounter';

interface ChannelStats {
  email: number;
  whatsapp: number;
  webform: number;
}

// Sparkline demo data — dark theme ready
const sparklineData = [
  { time: '00:00', tickets: 12, resolved: 8 },
  { time: '04:00', tickets: 8, resolved: 6 },
  { time: '08:00', tickets: 24, resolved: 18 },
  { time: '12:00', tickets: 36, resolved: 28 },
  { time: '16:00', tickets: 28, resolved: 22 },
  { time: '20:00', tickets: 16, resolved: 12 },
  { time: '24:00', tickets: 10, resolved: 7 },
];

// Animated counter component
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const { count } = useCounter(value, { duration: 1200 });
  return <span>{prefix}{count}{suffix}</span>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [channelStats, setChannelStats] = useState<ChannelStats>({
    email: 0,
    whatsapp: 0,
    webform: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await ticketsApi.getStats();
      setStats(data);
      setChannelStats({
        email: data.by_channel?.email || 0,
        whatsapp: data.by_channel?.whatsapp || 0,
        webform: data.by_channel?.web_form || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const total = channelStats.email + channelStats.whatsapp + channelStats.webform;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-10 w-10 border-2 border-[#22d3ee]/30 border-t-[#22d3ee] rounded-full"
        />
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Tickets',
      value: stats?.total_tickets ?? 0,
      icon: Ticket,
      accentColor: '#22d3ee',
      bgGradient: 'from-[#22d3ee]/20 to-blue-500/20',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Open Tickets',
      value: stats?.open_tickets ?? 0,
      icon: Clock,
      accentColor: '#f59e0b',
      bgGradient: 'from-[#f59e0b]/20 to-orange-500/20',
      trend: '-5%',
      trendUp: false,
    },
    {
      title: 'Resolved',
      value: stats?.resolved_tickets ?? 0,
      icon: CheckCircle,
      accentColor: '#10b981',
      bgGradient: 'from-[#10b981]/20 to-emerald-500/20',
      trend: '+18%',
      trendUp: true,
    },
    {
      title: 'Escalated',
      value: stats?.escalated_tickets ?? 0,
      icon: AlertCircle,
      accentColor: '#ef4444',
      bgGradient: 'from-[#ef4444]/20 to-red-500/20',
      trend: '-2%',
      trendUp: true,
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[#64748b] mt-1 text-sm">
            Real-time overview of your customer support operations
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={loadStats}
          className="px-4 py-2 bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-[#22d3ee] rounded-lg text-sm font-medium hover:bg-[#22d3ee]/20 transition-all duration-200 flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          Refresh
        </motion.button>
      </motion.div>

      {/* KPI Cards — glassmorphism, staggered, hover scale */}
      <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <KPICard key={card.title} card={card} index={index} />
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Channel Distribution - 2 cols */}
        <motion.div
          variants={fadeInUp}
          className="xl:col-span-2 bg-[#0d1117] border border-[#1e2d3d] rounded-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[#1e2d3d]/60">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#f1f5f9]">Tickets by Channel</h2>
                <p className="text-xs text-[#64748b] mt-0.5">Distribution across intake channels</p>
              </div>
              <span className="text-xs text-[#64748b] px-2 py-1 bg-[#0d1117] border border-[#1e2d3d] rounded-md">
                {total} total
              </span>
            </div>
          </div>
          <div className="p-5 space-y-5">
            <ChannelBar
              icon={Mail}
              name="Email"
              count={channelStats.email}
              total={total}
              accentColor="#22d3ee"
              delay={0.1}
            />
            <ChannelBar
              icon={MessageSquare}
              name="WhatsApp"
              count={channelStats.whatsapp}
              total={total}
              accentColor="#10b981"
              delay={0.2}
            />
            <ChannelBar
              icon={Monitor}
              name="Web Form"
              count={channelStats.webform}
              total={total}
              accentColor="#7c3aed"
              delay={0.3}
            />
          </div>
        </motion.div>

        {/* Performance Metrics - 1 col */}
        <motion.div
          variants={fadeInUp}
          className="bg-[#0d1117] border border-[#1e2d3d] rounded-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[#1e2d3d]/60">
            <h2 className="text-base font-semibold text-[#f1f5f9]">Performance</h2>
            <p className="text-xs text-[#64748b] mt-0.5">Key operational metrics</p>
          </div>
          <div className="divide-y divide-[#1e2d3d]/40">
            <PerformanceRow
              label="Avg. Response Time"
              description="Time to first reply"
              value={`${stats?.avg_response_time_hours ?? 0}h`}
              target="< 4h"
              status="good"
              delay={0.1}
            />
            <PerformanceRow
              label="Resolution Rate"
              description="Tickets resolved first contact"
              value="87%"
              target="> 85%"
              status="good"
              delay={0.15}
            />
            <PerformanceRow
              label="Escalation Rate"
              description="Requires human intervention"
              value={
                stats?.total_tickets
                  ? `${Math.round((stats.escalated_tickets / stats.total_tickets) * 100)}%`
                  : '0%'
              }
              target="< 20%"
              status="good"
              delay={0.2}
            />
            <PerformanceRow
              label="Customer Satisfaction"
              description="Average CSAT score"
              value="4.6/5"
              target="> 4.5"
              status="good"
              delay={0.25}
            />
          </div>
        </motion.div>
      </div>

      {/* Sparkline + System Status */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sparkline Chart — dark theme recharts */}
        <motion.div
          variants={fadeInUp}
          className="bg-[#0d1117] border border-[#1e2d3d] rounded-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[#1e2d3d]/60">
            <h2 className="text-base font-semibold text-[#f1f5f9]">Ticket Activity</h2>
            <p className="text-xs text-[#64748b] mt-0.5">24-hour ticket volume</p>
          </div>
          <div className="p-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#64748b" strokeOpacity={0.1} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1117',
                    border: '1px solid #1e2d3d',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f1f5f9',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tickets"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="url(#cyanGradient)"
                  dot={false}
                  animationDuration={800}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fill="url(#violetGradient)"
                  dot={false}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* System Status — animated ripple indicators */}
        <motion.div
          variants={fadeInUp}
          className="bg-[#0d1117] border border-[#1e2d3d] rounded-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[#1e2d3d]/60">
            <h2 className="text-base font-semibold text-[#f1f5f9]">System Status</h2>
            <p className="text-xs text-[#64748b] mt-0.5">Service health and uptime</p>
          </div>
          <div className="p-5 space-y-3">
            <StatusIndicator name="Email Service" status="operational" uptime="99.97%" icon={Mail} delay={0.1} />
            <StatusIndicator name="WhatsApp Gateway" status="operational" uptime="99.95%" icon={MessageSquare} delay={0.15} />
            <StatusIndicator name="Web Form API" status="operational" uptime="99.99%" icon={Monitor} delay={0.2} />
            <StatusIndicator name="Kafka Event Bus" status="operational" uptime="99.99%" icon={Zap} delay={0.25} />
            <StatusIndicator name="PostgreSQL CRM" status="operational" uptime="99.98%" icon={Users} delay={0.3} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── KPI Card component — dark glassmorphism, hover glow, staggered ───
function KPICard({ card, index }: { card: any; index: number }) {
  const Icon = card.icon;
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative bg-[#0d1117] border border-[#1e2d3d] rounded-xl p-5 overflow-hidden transition-all duration-200 hover:border-[#1e2d3d]/80"
      style={{
        boxShadow: '0 0 0 rgba(0,0,0,0)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${card.accentColor}15, 0 0 32px ${card.accentColor}08`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 rgba(0,0,0,0)';
      }}
    >
      {/* Gradient overlay on hover */}
      <div className={clsx('absolute inset-0 bg-gradient-to-br', card.bgGradient, 'opacity-0 group-hover:opacity-100 transition-opacity duration-300')} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          {/* Icon badge — rounded-lg, colored bg */}
          <div
            className="p-2.5 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${card.accentColor}20, ${card.accentColor}10)`,
            }}
          >
            <Icon className="h-5 w-5" style={{ color: card.accentColor }} />
          </div>
        </div>

        <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-1">{card.title}</p>
        <p className="text-3xl font-bold text-[#f1f5f9] tracking-tight mb-3">
          <AnimatedNumber value={card.value} />
        </p>

        <div className="flex items-center gap-1.5">
          {card.trendUp ? (
            <TrendingUp className="h-3.5 w-3.5 text-[#10b981]" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-[#ef4444]" />
          )}
          <span
            className={clsx(
              'text-xs font-semibold px-1.5 py-0.5 rounded',
              card.trendUp
                ? 'text-[#10b981] bg-[#10b981]/10'
                : card.title === 'Escalated'
                ? 'text-[#10b981] bg-[#10b981]/10'
                : 'text-[#ef4444] bg-[#ef4444]/10'
            )}
          >
            {card.trend}
          </span>
          <span className="text-xs text-[#64748b] ml-1">vs last month</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Channel bar component — color left border, animated progress, count-up ───
function ChannelBar({
  icon: Icon,
  name,
  count,
  total,
  accentColor,
  delay,
}: {
  icon: any;
  name: string;
  count: number;
  total: number;
  accentColor: string;
  delay: number;
}) {
  const percentage = total ? Math.round((count / total) * 100) : 0;
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedWidth(percentage), delay * 1000);
    return () => clearTimeout(timeout);
  }, [percentage, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="border-l-[3px] pl-4 py-1"
      style={{ borderLeftColor: accentColor }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" style={{ color: accentColor }} />
          <span className="text-sm font-medium text-[#f1f5f9]">{name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-[#f1f5f9]">
            <AnimatedNumber value={count} />
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded bg-[#0d1117] border border-[#1e2d3d]"
            style={{ color: accentColor }}
          >
            {percentage}%
          </span>
        </div>
      </div>
      {/* Progress bar — animated */}
      <div className="h-1.5 bg-[#050813] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: accentColor }}
          initial={{ width: 0 }}
          animate={{ width: `${animatedWidth}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

// ─── Performance row — table-style, colored badges, hover ───
function PerformanceRow({
  label,
  description,
  value,
  target,
  status,
  delay,
}: {
  label: string;
  description: string;
  value: string;
  target: string;
  status: 'good' | 'warning' | 'bad';
  delay: number;
}) {
  const statusColorMap = {
    good: { text: '#10b981', bg: '#10b981/10', border: '#10b981/20' },
    warning: { text: '#f59e0b', bg: '#f59e0b/10', border: '#f59e0b/20' },
    bad: { text: '#ef4444', bg: '#ef4444/10', border: '#ef4444/20' },
  };

  const colors = statusColorMap[status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="flex items-center justify-between px-5 py-3.5 hover:bg-[#111827]/50 transition-colors duration-150 cursor-default"
    >
      <div>
        <p className="text-sm font-medium text-[#f1f5f9] group-hover:text-[#22d3ee] transition-colors">{label}</p>
        <p className="text-[11px] text-[#64748b] mt-0.5">{description} · Target: {target}</p>
      </div>
      <span
        className="px-2.5 py-1 rounded-md text-xs font-semibold border"
        style={{
          color: colors.text,
          backgroundColor: colors.bg,
          borderColor: colors.border,
        }}
      >
        {value}
      </span>
    </motion.div>
  );
}

// ─── Status indicator — ripple/ping animation, uptime ───
function StatusIndicator({
  name,
  status,
  uptime,
  icon: Icon,
  delay,
}: {
  name: string;
  status: string;
  uptime: string;
  icon: any;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between p-3 rounded-lg bg-[#050813] border border-[#1e2d3d]/40 hover:border-[#1e2d3d] transition-colors duration-150 group"
    >
      <div className="flex items-center gap-3">
        {/* Ripple/ping status dot */}
        <div className="relative flex items-center justify-center h-2.5 w-2.5">
          <div
            className="absolute h-2.5 w-2.5 rounded-full animate-ripple"
            style={{ backgroundColor: '#10b981' }}
          />
          <div
            className="relative h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: '#10b981' }}
          />
        </div>
        <Icon className="h-4 w-4 text-[#64748b] group-hover:text-[#22d3ee] transition-colors duration-150" />
        <div>
          <p className="text-sm font-medium text-[#f1f5f9]">{name}</p>
          <p className="text-[11px] text-[#10b981] capitalize">{status}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-[#f1f5f9]">{uptime}</p>
        <p className="text-[11px] text-[#64748b]">uptime</p>
      </div>
    </motion.div>
  );
}

// ─── Animation variants ───
const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.05 } },
};
