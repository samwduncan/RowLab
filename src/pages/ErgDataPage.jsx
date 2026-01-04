import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Activity,
  Upload,
  Plus,
  Clock,
  TrendingUp,
  TrendingDown,
  Award,
  Filter,
  Search,
  Calendar,
  Zap,
  Target,
  ChevronDown,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import useLineupStore from '../store/lineupStore';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

// Time formatting helpers
const formatTime = (seconds) => {
  if (!seconds) return '--:--.-';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  return `${mins}:${String(secs).padStart(2, '0')}.${tenths}`;
};

const parseTime = (timeStr) => {
  const match = timeStr.match(/(\d+):(\d+)\.?(\d)?/);
  if (!match) return null;
  const [, mins, secs, tenths = 0] = match;
  return parseInt(mins) * 60 + parseInt(secs) + parseInt(tenths) / 10;
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl p-3 border border-white/20 shadow-lg">
        <p className="font-medium text-white">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {formatTime(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Test type badge
const TestTypeBadge = ({ type }) => {
  const config = {
    '2k': { label: '2K', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    '6k': { label: '6K', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    '30min': { label: '30min', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    '60min': { label: '60min', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
    '500m': { label: '500m', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
  };

  const { label, color } = config[type] || { label: type, color: 'bg-gray-500/20 text-gray-400' };

  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
};

// Stat card
const StatCard = ({ icon: Icon, label, value, subValue, trend, color }) => (
  <motion.div
    variants={fadeInUp}
    className="glass-card rounded-2xl p-5 border border-white/10"
  >
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="mt-4">
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      {subValue && <div className="text-xs text-gray-500 mt-1">{subValue}</div>}
    </div>
  </motion.div>
);

// Add test modal
const AddTestModal = ({ isOpen, onClose, athletes }) => {
  const [formData, setFormData] = useState({
    athleteId: '',
    testType: '2k',
    time: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement save
    console.log('Saving test:', formData);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative glass-elevated rounded-3xl p-8 max-w-md w-full border border-white/20"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">
          Add Erg Test
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Athlete select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Athlete
            </label>
            <select
              value={formData.athleteId}
              onChange={(e) => setFormData({ ...formData, athleteId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-accent-blue outline-none text-white"
              required
            >
              <option value="">Select athlete...</option>
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.lastName}, {a.firstName}
                </option>
              ))}
            </select>
          </div>

          {/* Test type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Test Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['2k', '6k', '30min', '500m'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, testType: type })}
                  className={`py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.testType === type
                      ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Time input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time (mm:ss.t)
            </label>
            <input
              type="text"
              placeholder="6:30.0"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-accent-blue outline-none text-white font-mono"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-accent-blue outline-none text-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Test conditions, observations..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-accent-blue outline-none text-white resize-none"
              rows={2}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-medium hover:shadow-glow-blue transition-all"
          >
            Save Test
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

function ErgDataPage() {
  const { athletes, ergData } = useLineupStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [testTypeFilter, setTestTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock erg data for demonstration
  const mockErgData = useMemo(() => {
    // Generate some sample data
    return athletes.slice(0, 10).map((athlete, i) => ({
      id: `test-${i}`,
      athleteId: athlete.id,
      athleteName: `${athlete.lastName}, ${athlete.firstName}`,
      testType: ['2k', '6k', '30min'][i % 3],
      time: 380 + Math.random() * 40, // seconds
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      watts: 280 + Math.floor(Math.random() * 50),
      split: 95 + Math.random() * 10
    }));
  }, [athletes]);

  // Team stats
  const teamStats = useMemo(() => {
    if (mockErgData.length === 0) return null;

    const twoKTests = mockErgData.filter(t => t.testType === '2k');
    if (twoKTests.length === 0) return null;

    const times = twoKTests.map(t => t.time);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const best = Math.min(...times);
    const watts = twoKTests.map(t => t.watts);
    const avgWatts = Math.round(watts.reduce((a, b) => a + b, 0) / watts.length);

    return { avg, best, avgWatts, testCount: mockErgData.length };
  }, [mockErgData]);

  // Chart data - last 6 tests average
  const chartData = useMemo(() => {
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    return months.map((month, i) => ({
      month,
      teamAvg: 390 - i * 2 + Math.random() * 5,
      teamBest: 375 - i * 2 + Math.random() * 3
    }));
  }, []);

  // Filtered tests
  const filteredTests = useMemo(() => {
    let result = [...mockErgData];

    if (testTypeFilter !== 'all') {
      result = result.filter(t => t.testType === testTypeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => t.athleteName.toLowerCase().includes(query));
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [mockErgData, testTypeFilter, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Erg Data Center
          </h1>
          <p className="text-gray-400">
            Track and analyze erg test results
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card border border-white/10 text-gray-300 hover:bg-white/10 transition-all">
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-medium hover:shadow-glow-blue transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Test
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard
          icon={Clock}
          label="Team Avg 2K"
          value={teamStats ? formatTime(teamStats.avg) : '--:--.-'}
          color="from-blue-500 to-blue-600"
          trend={-2}
        />
        <StatCard
          icon={Award}
          label="Team Best 2K"
          value={teamStats ? formatTime(teamStats.best) : '--:--.-'}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          icon={Zap}
          label="Avg Watts"
          value={teamStats ? `${teamStats.avgWatts}W` : '--'}
          color="from-amber-500 to-orange-500"
          trend={5}
        />
        <StatCard
          icon={Target}
          label="Total Tests"
          value={teamStats ? teamStats.testCount : 0}
          color="from-teal-500 to-teal-600"
        />
      </motion.div>

      {/* Chart */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="glass-card rounded-2xl p-6 border border-white/10 mb-8"
      >
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent-blue" />
          2K Performance Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#888" fontSize={12} />
              <YAxis
                stroke="#888"
                fontSize={12}
                domain={['dataMin - 5', 'dataMax + 5']}
                tickFormatter={(v) => formatTime(v)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="teamAvg"
                name="Team Avg"
                stroke="#0a84ff"
                strokeWidth={2}
                dot={{ fill: '#0a84ff', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="teamBest"
                name="Team Best"
                stroke="#bf5af2"
                strokeWidth={2}
                dot={{ fill: '#bf5af2', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Test History */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="glass-card rounded-2xl border border-white/10 overflow-hidden"
      >
        {/* Filters */}
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search athletes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/10 focus:border-accent-blue outline-none text-white placeholder-gray-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', '2k', '6k', '30min'].map((type) => (
              <button
                key={type}
                onClick={() => setTestTypeFilter(type)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  testTypeFilter === type
                    ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {type === 'all' ? 'All' : type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Test list */}
        <div className="divide-y divide-white/5">
          {filteredTests.length > 0 ? (
            filteredTests.map((test, i) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-accent-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white">
                    {test.athleteName}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <TestTypeBadge type={test.testType} />
                    <span className="text-xs text-gray-500">{test.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-white">
                    {formatTime(test.time)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {test.watts}W • 1:{formatTime(test.split).slice(2)}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No Tests Found
              </h3>
              <p className="text-gray-500">
                {searchQuery || testTypeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first erg test to get started'}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add test modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddTestModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            athletes={athletes}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ErgDataPage;
