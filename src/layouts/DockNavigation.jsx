import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Ship,
  Users,
  Activity,
  BarChart3,
  Eye,
  Sparkles
} from 'lucide-react';

const navItems = [
  { path: '/app', icon: LayoutDashboard, label: 'Dashboard', color: 'cyan', exact: true },
  { path: '/app/lineup', icon: Ship, label: 'Lineup', color: 'purple' },
  { path: '/app/boat-view', icon: Eye, label: 'Boats', color: 'pink' },
  { path: '/app/athletes', icon: Users, label: 'Athletes', color: 'amber' },
  { path: '/app/erg', icon: Activity, label: 'Erg', color: 'emerald' },
  { path: '/app/analytics', icon: BarChart3, label: 'Analytics', color: 'teal' },
];

const colorStyles = {
  cyan: {
    active: 'bg-shimmer-cyan/20 text-shimmer-cyan',
    glow: 'shadow-[0_0_20px_rgba(0,217,255,0.3)]',
    border: 'bg-shimmer-cyan',
  },
  purple: {
    active: 'bg-shimmer-purple/20 text-shimmer-purple',
    glow: 'shadow-[0_0_20px_rgba(167,139,250,0.3)]',
    border: 'bg-shimmer-purple',
  },
  pink: {
    active: 'bg-shimmer-pink/20 text-shimmer-pink',
    glow: 'shadow-[0_0_20px_rgba(244,114,182,0.3)]',
    border: 'bg-shimmer-pink',
  },
  amber: {
    active: 'bg-shimmer-amber/20 text-shimmer-amber',
    glow: 'shadow-[0_0_20px_rgba(252,211,77,0.3)]',
    border: 'bg-shimmer-amber',
  },
  emerald: {
    active: 'bg-shimmer-emerald/20 text-shimmer-emerald',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]',
    border: 'bg-shimmer-emerald',
  },
  teal: {
    active: 'bg-shimmer-teal/20 text-shimmer-teal',
    glow: 'shadow-[0_0_20px_rgba(45,212,191,0.3)]',
    border: 'bg-shimmer-teal',
  },
};

export const DockNavigation = ({ onAIClick }) => {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 h-20 backdrop-blur-xl bg-ocean-base/90 border-t border-white/[0.08]"
    >
      {/* Iridescent top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent 10%, rgba(0, 217, 255, 0.3), rgba(167, 139, 250, 0.3), rgba(244, 114, 182, 0.2), transparent 90%)',
        }}
      />

      <div className="max-w-2xl mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Main nav items */}
          <div className="flex items-center gap-1">
            {navItems.map(({ path, icon: Icon, label, color, exact }) => {
              const isActive = exact
                ? location.pathname === path
                : location.pathname.startsWith(path);
              const styles = colorStyles[color];

              return (
                <Link key={path} to={path}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex flex-col items-center gap-1 px-3 py-2"
                  >
                    {/* Active indicator - aurora bar at top */}
                    {isActive && (
                      <motion.div
                        layoutId="dockActiveIndicator"
                        className={`absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${styles.border}`}
                        style={{
                          boxShadow: `0 0 10px currentColor`,
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    {/* Icon container */}
                    <div
                      className={`
                        p-2.5 rounded-xl transition-all duration-200
                        ${isActive ? `${styles.active} ${styles.glow}` : 'text-neutral-500 hover:text-white hover:bg-white/[0.06]'}
                      `}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Label */}
                    <span
                      className={`
                        text-[10px] font-semibold uppercase tracking-wider transition-colors
                        ${isActive ? styles.active.split(' ')[1] : 'text-neutral-600'}
                      `}
                    >
                      {label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* AI Assistant Button */}
          <motion.button
            onClick={onAIClick}
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex flex-col items-center gap-1 px-3 py-2"
          >
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-shimmer-cyan to-shimmer-purple text-white shadow-[0_0_25px_rgba(0,217,255,0.3)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              AI
            </span>

            {/* Animated ring */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl border border-shimmer-cyan/30"
            />
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default DockNavigation;
