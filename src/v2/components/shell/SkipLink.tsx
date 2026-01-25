/**
 * Skip to main content link for accessibility
 *
 * WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks):
 * A mechanism is available to bypass blocks of content that are repeated on multiple Web pages.
 *
 * The skip link is visually hidden until focused, then appears at top of page.
 * Screen reader users can Tab to it as first focusable element.
 */

interface SkipLinkProps {
  targetId?: string;
  label?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  label = 'Skip to main content',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="
        skip-link
        sr-only focus:not-sr-only
        fixed top-2 left-1/2 -translate-x-1/2 z-[100]
        px-4 py-2 rounded-lg
        bg-bg-surface text-txt-primary
        border-2 border-interactive-primary
        font-medium text-sm
        focus:outline-none focus:ring-2 focus:ring-interactive-primary focus:ring-offset-2
        transition-[top]
      "
    >
      {label}
    </a>
  );
};

/**
 * Main content target for skip link
 * Wrap main content area with this
 */
export const MainContent: React.FC<{
  children: React.ReactNode;
  id?: string;
  className?: string;
}> = ({ children, id = 'main-content', className = '' }) => {
  return (
    <main id={id} tabIndex={-1} className={`outline-none ${className}`}>
      {children}
    </main>
  );
};

export default SkipLink;
