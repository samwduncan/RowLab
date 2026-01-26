import { Link, useLocation } from 'react-router-dom';
import { CaretRight, House } from '@phosphor-icons/react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

// Generate breadcrumbs from route path
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // Map route segments to labels
  const labelMap: Record<string, string> = {
    app: 'Home',
    athletes: 'Athletes',
    erg: 'Erg Tests',
    lineups: 'Lineups',
    'seat-racing': 'Seat Racing',
    training: 'Training',
    regattas: 'Regattas',
    settings: 'Settings',
    sessions: 'Sessions',
  };

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Skip 'app' in breadcrumb display but include in path
    if (segment === 'app' && index === 0) return;

    // Check if this is an ID (cuid pattern) - show as detail
    const isId = segment.length > 15 || /^[a-z0-9]+$/.test(segment);

    if (isId) {
      items.push({
        label: 'Details',
        href: index < segments.length - 1 ? currentPath : undefined,
      });
    } else {
      items.push({
        label: labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: index < segments.length - 1 ? currentPath : undefined,
      });
    }
  });

  return items;
}

export function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  const location = useLocation();

  // Use provided items or generate from location
  const breadcrumbs = items || generateBreadcrumbs(location.pathname);

  if (breadcrumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {showHome && (
        <>
          <Link
            to="/app"
            className="text-txt-muted hover:text-txt-primary transition-colors p-1 rounded hover:bg-surface-hover"
            aria-label="Home"
          >
            <House className="w-4 h-4" />
          </Link>
          {breadcrumbs.length > 0 && (
            <CaretRight className="w-4 h-4 text-txt-muted" />
          )}
        </>
      )}

      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {item.href ? (
            <Link
              to={item.href}
              className="text-txt-muted hover:text-txt-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-txt-primary font-medium">{item.label}</span>
          )}

          {index < breadcrumbs.length - 1 && (
            <CaretRight className="w-4 h-4 text-txt-muted" />
          )}
        </div>
      ))}
    </nav>
  );
}
