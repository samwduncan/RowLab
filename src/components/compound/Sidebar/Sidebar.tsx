import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Anchor,
  BarChart3,
  Dumbbell,
  Settings,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSettingsClick?: () => void;
}

const navItems = [
  { label: 'Dashboard', icon: Home, path: '/app', end: true },
  { label: 'Lineup', icon: Anchor, path: '/app/lineup', end: false },
  { label: 'Athletes', icon: Users, path: '/app/athletes', end: false },
  { label: 'Erg Data', icon: Dumbbell, path: '/app/erg', end: false },
  { label: 'Analytics', icon: BarChart3, path: '/app/analytics', end: false },
  { label: 'Settings', icon: Settings, path: '/app/settings', end: false },
];

export default function Sidebar({ isOpen = true, onClose, onSettingsClick }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">R</div>
        <span className="sidebar-brand">RowLab</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="nav-item" onClick={onSettingsClick}>
          <Shield size={18} />
          <span>Admin Panel</span>
        </button>
      </div>
    </aside>
  );
}
