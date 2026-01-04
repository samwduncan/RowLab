import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Users,
  Ship,
  Target,
  Award,
  Clock,
  BarChart3,
  Activity
} from 'lucide-react';
import useLineupStore from '../store/lineupStore';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl p-3 border border-white/20 shadow-lg">
        <p className="font-medium text-white">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Chart card wrapper
const ChartCard = ({ title, icon: Icon, children, className = '' }) => (
  <motion.div
    variants={fadeInUp}
    className={`glass-card rounded-2xl p-6 border border-white/10 ${className}`}
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
    {children}
  </motion.div>
);

// Colors for charts
const COLORS = {
  blue: '#0a84ff',
  purple: '#bf5af2',
  teal: '#00C7BE',
  pink: '#FF2D55',
  amber: '#FFAB00',
  green: '#30D158',
  red: '#FF453A',
  port: '#ef4444',
  starboard: '#22c55e'
};

const PIE_COLORS = [COLORS.blue, COLORS.purple, COLORS.teal, COLORS.pink, COLORS.amber];

function AnalyticsPage() {
  const { athletes, activeBoats, boatConfigs, shells } = useLineupStore();

  // Calculate side distribution
  const sideDistribution = useMemo(() => {
    const counts = { Port: 0, Starboard: 0, Both: 0, Coxswain: 0 };
    athletes.forEach(athlete => {
      if (athlete.side === 'P') counts.Port++;
      else if (athlete.side === 'S') counts.Starboard++;
      else if (athlete.side === 'B') counts.Both++;
      else if (athlete.side === 'Cox') counts.Coxswain++;
    });
    return [
      { name: 'Port', value: counts.Port, color: COLORS.port },
      { name: 'Starboard', value: counts.Starboard, color: COLORS.starboard },
      { name: 'Both', value: counts.Both, color: COLORS.purple },
      { name: 'Coxswain', value: counts.Coxswain, color: COLORS.amber }
    ].filter(d => d.value > 0);
  }, [athletes]);

  // Calculate country distribution (top 8)
  const countryDistribution = useMemo(() => {
    const counts = {};
    athletes.forEach(athlete => {
      const country = athlete.country || 'Unknown';
      counts[country] = (counts[country] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [athletes]);

  // Mock erg data trends (would come from real data)
  const ergTrends = useMemo(() => {
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    return months.map((month, i) => ({
      month,
      avg2k: 400 - i * 3 + Math.random() * 5,
      teamBest: 375 - i * 2 + Math.random() * 3
    }));
  }, []);

  // Boat utilization data
  const boatUtilization = useMemo(() => {
    return boatConfigs.map(config => {
      const activeCount = activeBoats.filter(b =>
        b.boatConfig?.name === config.name
      ).length;
      return {
        name: config.name.replace('Varsity ', 'V').replace('Lightweight ', 'LW'),
        active: activeCount,
        available: 2 // Assuming 2 shells per boat class
      };
    }).slice(0, 6);
  }, [boatConfigs, activeBoats]);

  // Athlete capability radar (mock data)
  const capabilityData = useMemo(() => [
    { subject: 'Endurance', A: 85, fullMark: 100 },
    { subject: 'Power', A: 78, fullMark: 100 },
    { subject: 'Technique', A: 90, fullMark: 100 },
    { subject: 'Racing', A: 82, fullMark: 100 },
    { subject: 'Teamwork', A: 95, fullMark: 100 },
    { subject: 'Consistency', A: 88, fullMark: 100 }
  ], []);

  // Assignment progress over session
  const assignmentProgress = useMemo(() => {
    const totalSeats = activeBoats.reduce((sum, boat) => {
      return sum + boat.seats.length + (boat.boatConfig?.hasCoxswain ? 1 : 0);
    }, 0);
    const filledSeats = activeBoats.reduce((sum, boat) => {
      const filled = boat.seats.filter(s => s.athlete).length;
      return sum + filled + (boat.coxswain ? 1 : 0);
    }, 0);

    return [
      { name: 'Assigned', value: filledSeats },
      { name: 'Empty', value: Math.max(0, totalSeats - filledSeats) }
    ];
  }, [activeBoats]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Performance Analytics
        </h1>
        <p className="text-gray-400">
          Insights and trends from your team data
        </p>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <motion.div variants={fadeInUp} className="glass-card rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{athletes.length}</div>
              <div className="text-xs text-gray-500">Total Athletes</div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{boatConfigs.length}</div>
              <div className="text-xs text-gray-500">Boat Classes</div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{shells.length}</div>
              <div className="text-xs text-gray-500">Named Shells</div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{activeBoats.length}</div>
              <div className="text-xs text-gray-500">Active Lineups</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid lg:grid-cols-2 gap-6"
      >
        {/* Side Distribution Pie Chart */}
        <ChartCard title="Side Distribution" icon={Users}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sideDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {sideDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {sideDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-gray-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Country Distribution Bar Chart */}
        <ChartCard title="Athletes by Country" icon={Award}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="#888" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  fill={COLORS.blue}
                  radius={[0, 4, 4, 0]}
                  background={{ fill: 'rgba(255,255,255,0.05)' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Erg Trends Line Chart */}
        <ChartCard title="Erg Score Trends" icon={TrendingUp}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ergTrends}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis
                  stroke="#888"
                  fontSize={12}
                  domain={['dataMin - 10', 'dataMax + 10']}
                  tickFormatter={(value) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  formatter={(value) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="avg2k"
                  name="Team Avg"
                  stroke={COLORS.blue}
                  fillOpacity={1}
                  fill="url(#colorAvg)"
                />
                <Area
                  type="monotone"
                  dataKey="teamBest"
                  name="Team Best"
                  stroke={COLORS.purple}
                  fillOpacity={1}
                  fill="url(#colorBest)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Team Capability Radar */}
        <ChartCard title="Team Capabilities" icon={Target}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={capabilityData}>
                <PolarGrid stroke="rgba(255,255,255,0.2)" />
                <PolarAngleAxis dataKey="subject" stroke="#888" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#888" fontSize={10} />
                <Radar
                  name="Team"
                  dataKey="A"
                  stroke={COLORS.blue}
                  fill={COLORS.blue}
                  fillOpacity={0.3}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Boat Utilization */}
        <ChartCard title="Boat Class Utilization" icon={Ship} className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={boatUtilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="active" name="Active" fill={COLORS.teal} radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" name="Available" fill="rgba(0,199,190,0.3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 glass-card rounded-2xl p-6 border border-white/10 text-center"
      >
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-accent-purple opacity-50" />
        <h3 className="text-xl font-bold text-white mb-2">
          More Analytics Coming Soon
        </h3>
        <p className="text-gray-400 max-w-xl mx-auto">
          We're building out comprehensive performance analytics including erg score tracking,
          race result analysis, and AI-powered lineup optimization. Upload your erg data to unlock
          personalized insights.
        </p>
      </motion.div>
    </div>
  );
}

export default AnalyticsPage;
