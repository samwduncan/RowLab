import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useErgTests } from '@v2/hooks/useErgTests';
import { useAthletes } from '@v2/hooks/useAthletes';
import { useErgKeyboard } from '@v2/hooks/useErgKeyboard';
import { usePRCelebration } from '@v2/hooks/usePersonalRecords';
import { useRequireAuth } from '../../hooks/useAuth';
import { CrudModal } from '@v2/components/common/CrudModal';
import {
  ErgTestFilters,
  ErgTestForm,
  ErgTestsTable,
  TeamC2StatusList,
  ErgCSVImportModal,
  ErgLeaderboard,
} from '@v2/components/erg';
import { PRCelebration } from '@v2/features/gamification/components/PRCelebration';
import { Plus, Network, Upload, Keyboard, List, BarChart3, X } from 'lucide-react';
import { ErgPageSkeleton } from '@v2/features/erg/components/ErgSkeleton';
import { FADE_IN_VARIANTS, SPRING_GENTLE } from '@v2/utils/animations';
import type {
  ErgTest,
  ErgTestFilters as FilterState,
  CreateErgTestInput,
  UpdateErgTestInput,
} from '@v2/types/ergTests';

type ViewTab = 'tests' | 'leaderboard';

/**
 * Main Erg Tests page with table, filters, leaderboard, and CRUD operations
 */
export function ErgTestsPage() {
  // View tab state
  const [activeView, setActiveView] = useState<ViewTab>('tests');

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    testType: 'all',
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<ErgTest | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // C2 status panel state
  const [showC2Status, setShowC2Status] = useState(false);

  // PR celebration state
  const [lastCreatedTestId, setLastCreatedTestId] = useState<string | null>(null);
  const [prTestIds, setPrTestIds] = useState<Set<string>>(new Set());
  const [showPRBanner, setShowPRBanner] = useState(false);

  // Auth - redirects to login if not authenticated
  const { isLoading: isAuthLoading } = useRequireAuth();

  // Fetch erg tests with filters
  const {
    tests,
    isLoading,
    createTest,
    isCreating,
    updateTest,
    isUpdating,
    deleteTest,
    isDeleting,
  } = useErgTests(filters);

  // Fetch athletes for form dropdown
  const { athletes } = useAthletes();

  // PR celebration detection for last created test
  const { data: prData } = usePRCelebration(lastCreatedTestId || '');

  // Show PR banner when PR is detected
  useEffect(() => {
    if (prData && prData.contexts?.some((c) => c.isPR) && lastCreatedTestId) {
      setShowPRBanner(true);
      setPrTestIds((prev) => new Set(prev).add(lastCreatedTestId));

      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        setShowPRBanner(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [prData, lastCreatedTestId]);

  const handleDismissPR = useCallback(() => {
    setShowPRBanner(false);
  }, []);

  // Keyboard shortcuts for erg test navigation
  const { selectedIndex, setSelectedIndex, showHelp, setShowHelp } = useErgKeyboard({
    tests,
    onEdit: (test: ErgTest) => {
      setEditingTest(test);
      setIsModalOpen(true);
    },
    onDelete: (testId: string) => {
      const test = tests.find((t) => t.id === testId);
      if (!test) return;
      const athleteName = test.athlete
        ? `${test.athlete.firstName} ${test.athlete.lastName}`
        : 'this athlete';
      const testDate = new Date(test.testDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      if (confirm(`Delete ${test.testType} test for ${athleteName} on ${testDate}?`)) {
        deleteTest(testId);
      }
    },
    enabled: !isModalOpen && !isImportModalOpen && activeView === 'tests',
  });

  const handleOpenAddModal = () => {
    setEditingTest(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (test: ErgTest) => {
    setEditingTest(test);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing editing test to allow modal close animation
    setTimeout(() => setEditingTest(null), 300);
  };

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
  };

  const handleImportSuccess = (count: number) => {
    console.log(`Successfully imported ${count} erg tests`);
  };

  const handleSubmit = (data: CreateErgTestInput | UpdateErgTestInput) => {
    if (editingTest) {
      // Update existing test
      updateTest({ ...data, id: editingTest.id } as any, {
        onSuccess: () => {
          handleCloseModal();
        },
      });
    } else {
      // Create new test - track the created test ID for PR detection
      createTest(data as CreateErgTestInput, {
        onSuccess: (createdTest) => {
          if (createdTest?.id) {
            setLastCreatedTestId(createdTest.id);
          }
          handleCloseModal();
        },
      });
    }
  };

  const handleDelete = (testId: string) => {
    const test = tests.find((t) => t.id === testId);
    if (!test) return;

    const athleteName = test.athlete
      ? `${test.athlete.firstName} ${test.athlete.lastName}`
      : 'this athlete';
    const testDate = new Date(test.testDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (confirm(`Delete ${test.testType} test for ${athleteName} on ${testDate}?`)) {
      deleteTest(testId);
    }
  };

  const handleRowClick = (test: ErgTest) => {
    // For now, just open edit modal
    // In 07-03, this will open athlete erg history panel
    handleOpenEditModal(test);
  };

  // Show skeleton while checking auth
  if (isAuthLoading) {
    return <ErgPageSkeleton />;
  }

  return (
    <div className="flex flex-col h-full bg-bg-default">
      {/* PR Celebration Banner */}
      <AnimatePresence>
        {showPRBanner && prData && (
          <motion.div
            variants={FADE_IN_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={SPRING_GENTLE}
            className="flex-shrink-0 px-6 py-3 border-b border-accent-gold/30 bg-accent-gold/5 relative"
          >
            <div className="max-w-2xl mx-auto">
              <PRCelebration data={prData} compact />
            </div>
            <button
              onClick={handleDismissPR}
              className="absolute top-3 right-4 p-1 rounded-md text-txt-tertiary hover:text-txt-primary hover:bg-bg-active transition-colors"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-bdr-default bg-bg-surface">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-txt-primary">Erg Tests</h1>
            <p className="text-sm text-txt-tertiary mt-1">
              {tests.length} {tests.length === 1 ? 'test' : 'tests'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex gap-0.5 p-0.5 bg-bg-subtle rounded-md">
              <button
                onClick={() => setActiveView('tests')}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded transition-colors
                  ${
                    activeView === 'tests'
                      ? 'bg-interactive-primary text-white shadow-sm'
                      : 'text-txt-secondary hover:text-txt-primary'
                  }
                `}
                title="Tests view"
              >
                <List size={16} />
                Tests
              </button>
              <button
                onClick={() => setActiveView('leaderboard')}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded transition-colors
                  ${
                    activeView === 'leaderboard'
                      ? 'bg-interactive-primary text-white shadow-sm'
                      : 'text-txt-secondary hover:text-txt-primary'
                  }
                `}
                title="Leaderboard view"
              >
                <BarChart3 size={16} />
                Leaderboard
              </button>
            </div>

            <button
              onClick={() => setShowC2Status(!showC2Status)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium
                ${
                  showC2Status
                    ? 'bg-interactive-primary text-white hover:bg-interactive-primary-hover'
                    : 'bg-bg-subtle text-txt-secondary hover:bg-bg-default'
                }
              `}
              title={showC2Status ? 'Hide C2 Status' : 'Show C2 Status'}
            >
              <Network size={18} />
              C2 Status
            </button>

            <button
              onClick={handleOpenImportModal}
              className="flex items-center gap-2 px-4 py-2 bg-bg-subtle text-txt-secondary hover:bg-bg-default rounded-md transition-colors font-medium"
            >
              <Upload size={18} />
              Import CSV
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-interactive-primary text-white rounded-md hover:bg-interactive-primary-hover transition-colors"
            >
              <Plus size={18} />
              Add Test
            </button>
          </div>
        </div>

        {/* Filters - only show in tests view */}
        {activeView === 'tests' && <ErgTestFilters filters={filters} onFilterChange={setFilters} />}
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main content area */}
        <div className={`flex-1 overflow-hidden transition-all ${showC2Status ? 'mr-96' : ''}`}>
          <AnimatePresence mode="wait">
            {activeView === 'tests' ? (
              <motion.div
                key="tests"
                variants={FADE_IN_VARIANTS}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={SPRING_GENTLE}
                className="h-full"
              >
                <ErgTestsTable
                  tests={tests}
                  isLoading={isLoading}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDelete}
                  onRowClick={handleRowClick}
                  selectedIndex={selectedIndex}
                  prTestIds={prTestIds}
                />
              </motion.div>
            ) : (
              <motion.div
                key="leaderboard"
                variants={FADE_IN_VARIANTS}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={SPRING_GENTLE}
                className="h-full overflow-auto p-6"
              >
                <ErgLeaderboard className="max-w-2xl mx-auto" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* C2 Status panel - slide-out from right */}
        {showC2Status && (
          <div className="w-96 border-l border-bdr-default bg-bg-surface flex-shrink-0 overflow-hidden">
            <TeamC2StatusList />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <CrudModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTest ? 'Edit Erg Test' : 'Add Erg Test'}
      >
        <ErgTestForm
          initialData={editingTest || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          athletes={athletes}
          isSubmitting={isCreating || isUpdating}
        />
      </CrudModal>

      {/* CSV Import Modal */}
      <ErgCSVImportModal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        onSuccess={handleImportSuccess}
      />

      {/* Keyboard Shortcuts Help Overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-6 right-6 z-50 w-72 rounded-2xl overflow-hidden
              bg-white/[0.03] backdrop-blur-xl border border-white/10
              shadow-2xl shadow-black/50"
          >
            <div className="relative p-4">
              {/* Top gradient line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Keyboard size={16} className="text-interactive-primary" />
                  <h3 className="text-sm font-semibold text-txt-primary">Keyboard Shortcuts</h3>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-txt-tertiary hover:text-txt-primary transition-colors text-xs"
                >
                  Esc
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <ShortcutRow keys={['J', 'K']} label="Navigate rows" />
                <ShortcutRow keys={['E']} label="Edit selected" />
                <ShortcutRow keys={['Del']} label="Delete selected" />
                <ShortcutRow keys={['/']} label="Focus filter" />
                <ShortcutRow keys={['?']} label="Toggle this help" />
                <ShortcutRow keys={['Esc']} label="Clear selection" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Renders a single keyboard shortcut row for the help overlay.
 */
function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-txt-secondary">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((key) => (
          <kbd
            key={key}
            className="px-1.5 py-0.5 text-xs font-mono rounded-md
              bg-white/5 border border-white/10 text-txt-primary
              shadow-[0_1px_0_rgba(255,255,255,0.06)]"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

export default ErgTestsPage;
