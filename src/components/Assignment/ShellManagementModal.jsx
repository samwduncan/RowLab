import React, { useState, useEffect } from 'react';
import useShellStore from '../../store/shellStore';

/**
 * Modal for managing shells (equipment)
 */
function ShellManagementModal({ isOpen, onClose }) {
  const { shells, loading, error, fetchShells, createShell, updateShell, deleteShell, clearError } = useShellStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', boatClass: '8+', notes: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const boatClasses = ['8+', '4+', '4-', '4x', '2-', '2x', '1x'];

  useEffect(() => {
    if (isOpen) {
      fetchShells();
    }
  }, [isOpen, fetchShells]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateShell(editingId, formData);
        setEditingId(null);
      } else {
        await createShell(formData);
        setIsAdding(false);
      }
      setFormData({ name: '', boatClass: '8+', notes: '' });
    } catch (err) {
      // Error is handled by store
    }
  };

  const handleEdit = (shell) => {
    setEditingId(shell.id);
    setFormData({ name: shell.name, boatClass: shell.boatClass, notes: shell.notes || '' });
    setIsAdding(false);
  };

  const handleDelete = async (shellId) => {
    try {
      await deleteShell(shellId);
      setDeleteConfirm(null);
    } catch (err) {
      // Error is handled by store
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', boatClass: '8+', notes: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-2xl mx-4 animate-slide-up max-h-[80vh] overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🚣</div>
          <h2 className="text-2xl font-bold text-text-primary">
            Shell Management
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Manage your team's boats and equipment
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger-red/10 text-danger-red rounded-lg text-sm flex justify-between items-center border border-danger-red/20">
            <span>{error}</span>
            <button onClick={clearError} className="text-danger-red hover:text-danger-red/80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-void-elevated/50 rounded-xl border border-white/10">
            <h3 className="font-semibold text-text-primary mb-4">
              {editingId ? 'Edit Shell' : 'Add New Shell'}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Shell Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-void-deep text-text-primary focus:ring-2 focus:ring-blade-blue/50 focus:border-blade-blue/50"
                  placeholder="e.g., Varsity Eight"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Boat Class
                </label>
                <select
                  value={formData.boatClass}
                  onChange={(e) => setFormData({ ...formData, boatClass: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-void-deep text-text-primary focus:ring-2 focus:ring-blade-blue/50 focus:border-blade-blue/50"
                >
                  {boatClasses.map((bc) => (
                    <option key={bc} value={bc}>{bc}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-void-deep text-text-primary focus:ring-2 focus:ring-blade-blue/50 focus:border-blade-blue/50"
                placeholder="e.g., Empacher 2019, lightweight"
                rows={2}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blade-blue hover:bg-blade-blue/90 text-void-deep font-medium rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingId ? 'Update' : 'Add Shell')}
              </button>
            </div>
          </form>
        )}

        {/* Shell List */}
        <div className="flex-1 overflow-y-auto">
          {loading && shells.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-blade-blue" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : shells.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <div className="text-5xl mb-3">🛶</div>
              <p>No shells added yet</p>
              <p className="text-sm mt-2">Add your team's boats to assign them to lineups</p>
            </div>
          ) : (
            <div className="space-y-2">
              {boatClasses.map((boatClass) => {
                const classShells = shells.filter((s) => s.boatClass === boatClass);
                if (classShells.length === 0) return null;

                return (
                  <div key={boatClass} className="mb-4">
                    <h3 className="text-sm font-semibold text-text-muted mb-2 px-2">
                      {boatClass}
                    </h3>
                    {classShells.map((shell) => (
                      <div
                        key={shell.id}
                        className="p-3 bg-void-elevated/50 rounded-lg border border-white/10 mb-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-text-primary">
                              {shell.name}
                            </span>
                            {shell.notes && (
                              <p className="text-sm text-text-muted mt-1">
                                {shell.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(shell)}
                              className="px-2 py-1 text-text-muted hover:text-text-primary text-sm transition-colors"
                            >
                              Edit
                            </button>
                            {deleteConfirm === shell.id ? (
                              <>
                                <button
                                  onClick={() => handleDelete(shell.id)}
                                  className="px-2 py-1 text-danger-red hover:text-danger-red/80 text-sm font-medium"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2 py-1 text-text-muted hover:text-text-primary text-sm"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(shell.id)}
                                className="px-2 py-1 text-danger-red hover:text-danger-red/80 text-sm transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Button */}
        {!isAdding && !editingId && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              onClick={() => setIsAdding(true)}
              className="w-full px-4 py-2 bg-blade-blue hover:bg-blade-blue/90 text-void-deep font-medium rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Shell
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShellManagementModal;
