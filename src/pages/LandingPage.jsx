import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Waves,
  Users,
  BarChart3,
  Shield,
  Github,
  Linkedin,
  ArrowRight,
  ChevronDown,
  Target,
  Layers,
  Activity,
  Play,
  Anchor,
} from 'lucide-react';

// Shimmer text component
const ShimmerText = ({ children, className = '' }) => (
  <span className={`text-shimmer ${className}`}>{children}</span>
);

// Static gradient text
const GradientText = ({ children, className = '' }) => (
  <span
    className={className}
    style={{
      background: 'linear-gradient(135deg, #6366F1 0%, #a78bfa 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}
  >
    {children}
  </span>
);

// Animated gradient background with mesh overlay
const AnimatedBackground = () => (
  <>
    <div className="gradient-bg" />
    <div className="mesh-overlay" />
  </>
);

// Simple boat preview - reduced animations, mobile responsive
const BoatPreview = () => (
  <div className="flex items-center justify-center gap-1 sm:gap-1.5 py-4 overflow-x-auto">
    {/* Cox */}
    <div className="w-7 h-9 sm:w-8 sm:h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
      <Anchor className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
    </div>
    {/* Rowers */}
    {[8, 7, 6, 5, 4, 3, 2, 'B'].map((seat, i) => {
      const isPort = i % 2 === 0;
      return (
        <div
          key={i}
          className={`w-8 h-10 sm:w-9 sm:h-12 rounded-lg border flex items-center justify-center transition-transform hover:scale-105 flex-shrink-0 ${
            isPort
              ? 'bg-rose-500/15 border-rose-500/30'
              : 'bg-emerald-500/15 border-emerald-500/30'
          }`}
        >
          <span className={`text-[10px] sm:text-xs font-bold ${isPort ? 'text-rose-400' : 'text-emerald-400'}`}>
            {seat}
          </span>
        </div>
      );
    })}
  </div>
);

// Feature card
const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="landing-card p-6 hover:shadow-card transition-shadow"
  >
    <div className={`feature-icon ${color} mb-4`}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-white/60 leading-relaxed">{description}</p>
  </motion.div>
);

// Stat card
const StatCard = ({ value, label }) => (
  <div className="landing-card p-5 text-center">
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-white/50 uppercase tracking-widest font-medium">{label}</div>
  </div>
);

const LandingPage = () => {
  const features = [
    {
      icon: Users,
      title: 'Visual Lineup Builder',
      description: 'Drag-and-drop athletes into boats with real-time validation.',
      color: 'indigo',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track erg scores, monitor progress, and find your fastest combinations.',
      color: 'purple',
    },
    {
      icon: Target,
      title: 'Smart Optimization',
      description: 'AI-powered lineup suggestions based on performance data.',
      color: 'rose',
    },
    {
      icon: Layers,
      title: 'Multi-Boat Management',
      description: 'Manage your entire fleet from varsity 8+ to singles.',
      color: 'amber',
    },
    {
      icon: Activity,
      title: 'Erg Data Tracking',
      description: 'Import and analyze erg test results with splits analysis.',
      color: 'emerald',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Role-based access ensures only authorized coaches see data.',
      color: 'cyan',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-900 overflow-hidden">
      <AnimatedBackground />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
              >
                <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold">
                <ShimmerText>RowLab</ShimmerText>
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="https://github.com/swdrow/RowLab"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/samwduncan"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <Link to="/app" className="landing-btn landing-btn-primary !w-auto !px-4 sm:!px-6">
                <span className="hidden sm:inline">Launch App</span>
                <span className="sm:hidden">Launch</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 mb-6 sm:mb-8"
          >
            <span className="text-xs sm:text-sm text-white/60">Built for Competitive Rowing Teams</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
          >
            <span className="text-white">Build Faster </span>
            <ShimmerText>Lineups</ShimmerText>
            <br />
            <span className="text-white">Win More </span>
            <GradientText>Races</GradientText>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base sm:text-lg text-white/70 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2"
          >
            The modern platform for rowing coaches. Visualize your roster, optimize boat
            assignments, and track performance with beautiful analytics.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-12 px-4 sm:px-0"
          >
            <Link to="/app" className="landing-btn landing-btn-primary text-base">
              <Play className="w-4 h-4" />
              Get Started Free
            </Link>
            <a href="#features" className="landing-btn landing-btn-secondary text-base">
              See Features
              <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Boat Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="landing-card max-w-2xl mx-auto p-4 sm:p-6"
          >
            <div className="text-xs text-white/40 mb-2 sm:mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Preview: Varsity 8+
            </div>
            <BoatPreview />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-white/20" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value="53+" label="Athletes" />
            <StatCard value="9" label="Boat Classes" />
            <StatCard value="15" label="Named Shells" />
            <StatCard value="100%" label="Open Source" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-white">Everything You Need to </span>
              <ShimmerText>Win</ShimmerText>
            </h2>
            <p className="text-base text-white/60 max-w-md mx-auto">
              Purpose-built tools for rowing coaches who demand excellence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-white">Ready to </span>
              <ShimmerText>Dominate</ShimmerText>
              <span className="text-white">?</span>
            </h2>
            <p className="text-base text-white/60 mb-8">
              Start building championship lineups today.
            </p>
            <Link to="/app" className="landing-btn landing-btn-primary text-lg px-8 py-4">
              Launch RowLab
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
              >
                <Waves className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold">
                <ShimmerText>RowLab</ShimmerText>
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-white/40">
              <span>&copy; {new Date().getFullYear()} RowLab</span>
              <a
                href="https://github.com/swdrow/RowLab"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/70 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/samwduncan"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/70 transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
