import React, { useState } from 'react';
import useLineupStore from '../../store/lineupStore';
import useAuthStore from '../../store/authStore';
import SavedLineupsModal from './SavedLineupsModal';
import ShellManagementModal from './ShellManagementModal';

/**
 * Toolbar for lineup management actions
 */
function LineupToolbar({ onExportPDF, onExportCSV }) {
  const { isAuthenticated } = useAuthStore();
  const {
    lineupName,
    activeBoats,
    saveLineupToAPI,
    currentLineupId,
    updateLineupInAPI,
    clearLineup,
  } = useLineupStore();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showShellModal, setShowShellModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const hasLineup = activeBoats.length > 0;

  const handleSave = async () => {
    if (!saveName.trim()) {
      setSaveError('Please enter a lineup name');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      if (currentLineupId) {
        await updateLineupInAPI(currentLineupId, saveName.trim(), saveNotes.trim());
      } else {
        await saveLineupToAPI(saveName.trim(), saveNotes.trim());
      }
      setShowSaveModal(false);
      setSaveName('');
      setSaveNotes('');
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewLineup = () => {
    if (hasLineup && !window.confirm('Clear current lineup? Unsaved changes will be lost.')) {
      return;
    }
    clearLineup();
  };

  return (
    <>
      <div className="flex items-center gap-2 p-2 bg-void-elevated/50 rounded-xl border border-white/10">
        {/* Lineup Name */}
        {lineupName && (
          <span className="px-3 py-1 bg-white/10 text-text-primary rounded-lg text-sm font-medium border border-white/10">
            {lineupName}
          </span>
        )}

        <div className="flex-1" />

        {/* New Lineup */}
        <button
          onClick={handleNewLineup}
          className="px-3 py-1.5 text-text-secondary hover:text-text-primary text-sm font-medium flex items-center gap-1 transition-colors"
          title="New Lineup"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </button>

        {/* Load */}
        <button
          onClick={() => setShowLoadModal(true)}
          className="px-3 py-1.5 text-text-secondary hover:text-text-primary text-sm font-medium flex items-center gap-1 transition-colors"
          title="Load Lineup"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Load
        </button>

        {/* Save */}
        {isAuthenticated && (
          <button
            onClick={() => {
              setSaveName(lineupName || '');
              setShowSaveModal(true);
            }}
            disabled={!hasLineup}
            className="px-3 py-1.5 bg-blade-blue hover:bg-blade-blue/90 disabled:bg-white/10 text-void-deep disabled:text-text-muted text-sm font-medium rounded-lg flex items-center gap-1 transition-all"
            title="Save Lineup"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save
          </button>
        )}

        {/* Shells */}
        {isAuthenticated && (
          <button
            onClick={() => setShowShellModal(true)}
            className="px-3 py-1.5 text-text-secondary hover:text-text-primary text-sm font-medium flex items-center gap-1 transition-colors"
            title="Manage Shells"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Shells
          </button>
        )}

        {/* Export Dropdown */}
        {hasLineup && (
          <div className="relative group">
            <button
              className="px-3 py-1.5 text-text-secondary hover:text-text-primary text-sm font-medium flex items-center gap-1 transition-colors"
              title="Export"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-void-elevated rounded-lg shadow-lg border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={onExportPDF}
                className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary rounded-t-lg transition-colors"
              >
                Export PDF
              </button>
              <button
                onClick={onExportCSV}
                className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary rounded-b-lg transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSaveModal(false)}
          />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md mx-4 animate-slide-up">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              {currentLineupId ? 'Update Lineup' : 'Save Lineup'}
            </h3>

            {saveError && (
              <div className="mb-4 p-3 bg-danger-red/10 text-danger-red rounded-lg text-sm border border-danger-red/20">
                {saveError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Lineup Name
              </label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-void-deep text-text-primary focus:ring-2 focus:ring-blade-blue/50 focus:border-blade-blue/50"
                placeholder="e.g., Race Day Lineup"
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Notes (optional)
              </label>
              <textarea
                value={saveNotes}
                onChange={(e) => setSaveNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-void-deep text-text-primary focus:ring-2 focus:ring-blade-blue/50 focus:border-blade-blue/50"
                placeholder="Any notes about this lineup..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blade-blue hover:bg-blade-blue/90 text-void-deep font-medium rounded-lg transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      <SavedLineupsModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onLoad={(lineup) => {
          // TODO: Wire up to parent via onLoadLineup prop
        }}
      />

      {/* Shell Management Modal */}
      <ShellManagementModal
        isOpen={showShellModal}
        onClose={() => setShowShellModal(false)}
      />
    </>
  );
}

export default LineupToolbar;
