/**
 * TemplateManager - Phase 18 LINEUP-03
 *
 * Manages lineup templates: save current lineup as template,
 * list existing templates, and apply templates to create lineups.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileStack,
  Plus,
  Trash2,
  Star,
  StarOff,
  ChevronDown,
  ChevronUp,
  Play,
} from 'lucide-react';
import {
  useLineupTemplates,
  useCreateTemplate,
  useDeleteTemplate,
  useApplyTemplate,
  useUpdateTemplate,
} from '@v2/hooks/useLineupTemplates';
import type { LineupTemplate, TemplateAssignment } from '@v2/types/lineupTemplate';

interface TemplateManagerProps {
  boatClass?: string;
  currentAssignments?: TemplateAssignment[];
  onApplyTemplate: (result: {
    templateName: string;
    assignedAthletes: Array<{
      seatNumber: number;
      athleteId: string;
      athleteName: string;
      side: 'Port' | 'Starboard';
    }>;
    unfilledSeats: number[];
  }) => void;
  className?: string;
}

interface SaveTemplateDialogProps {
  boatClass: string;
  assignments: TemplateAssignment[];
  onSave: (name: string, isDefault: boolean) => void;
  onCancel: () => void;
}

function SaveTemplateDialog({
  boatClass,
  onSave,
  onCancel,
}: SaveTemplateDialogProps) {
  const [name, setName] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), isDefault);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-3 bg-bg-default border border-bdr-default rounded-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-txt-primary mb-1">
            Template Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`${boatClass} Template...`}
            className="w-full px-3 py-2 text-sm rounded border border-bdr-default
                       bg-bg-elevated focus:outline-none focus:ring-2 focus:ring-interactive-primary"
            autoFocus
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-txt-secondary">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="rounded border-bdr-default"
          />
          Set as default for {boatClass}
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-txt-secondary hover:text-txt-primary
                       hover:bg-bg-hover rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-3 py-1.5 text-sm text-white bg-interactive-primary
                       hover:bg-interactive-primary-hover rounded transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Template
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function TemplateCard({
  template,
  onApply,
  onDelete,
  onToggleDefault,
  isApplying,
}: {
  template: LineupTemplate;
  onApply: () => void;
  onDelete: () => void;
  onToggleDefault: () => void;
  isApplying: boolean;
}) {
  return (
    <div className="p-3 border border-bdr-default rounded-lg bg-bg-default hover:border-bdr-hover transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-txt-primary">{template.name}</h4>
            {template.isDefault && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">
                Default
              </span>
            )}
          </div>
          <p className="text-xs text-txt-tertiary mt-0.5">
            {template.boatClass} • {template.assignments.length} seats
          </p>
          {template.description && (
            <p className="text-xs text-txt-secondary mt-1">{template.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleDefault}
            className="p-1.5 text-txt-tertiary hover:text-amber-500 rounded
                       hover:bg-bg-hover transition-colors"
            title={template.isDefault ? 'Remove as default' : 'Set as default'}
          >
            {template.isDefault ? (
              <Star className="h-4 w-4 fill-current text-amber-500" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-txt-tertiary hover:text-red-500 rounded
                       hover:bg-bg-hover transition-colors"
            title="Delete template"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        onClick={onApply}
        disabled={isApplying}
        className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5
                   text-sm text-interactive-primary hover:text-interactive-primary-hover
                   border border-interactive-primary hover:bg-interactive-primary/10
                   rounded transition-colors disabled:opacity-50"
      >
        <Play className="h-3.5 w-3.5" />
        {isApplying ? 'Applying...' : 'Apply Template'}
      </button>
    </div>
  );
}

export function TemplateManager({
  boatClass,
  currentAssignments,
  onApplyTemplate,
  className = '',
}: TemplateManagerProps) {
  const [expanded, setExpanded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const { data: templates, isLoading } = useLineupTemplates(boatClass);
  const createMutation = useCreateTemplate();
  const deleteMutation = useDeleteTemplate();
  const updateMutation = useUpdateTemplate();
  const applyMutation = useApplyTemplate();

  const canSave = currentAssignments && currentAssignments.length > 0 && boatClass;

  const handleSaveTemplate = async (name: string, isDefault: boolean) => {
    if (!boatClass || !currentAssignments) return;

    try {
      await createMutation.mutateAsync({
        name,
        boatClass,
        assignments: currentAssignments,
        isDefault,
      });
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleApplyTemplate = async (templateId: string) => {
    try {
      const result = await applyMutation.mutateAsync(templateId);
      onApplyTemplate({
        templateName: result.templateName,
        assignedAthletes: result.assignedAthletes,
        unfilledSeats: result.unfilledSeats,
      });
    } catch (error) {
      console.error('Failed to apply template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await deleteMutation.mutateAsync(templateId);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleToggleDefault = async (template: LineupTemplate) => {
    try {
      await updateMutation.mutateAsync({
        templateId: template.id,
        data: { isDefault: !template.isDefault },
      });
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  return (
    <div className={`bg-bg-elevated rounded-lg border border-bdr-default ${className}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-bg-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileStack className="h-4 w-4 text-txt-secondary" />
          <span className="font-medium text-txt-primary">Templates</span>
          {templates && templates.length > 0 && (
            <span className="text-xs text-txt-tertiary">({templates.length})</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-txt-tertiary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-txt-tertiary" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-bdr-default">
              {/* Save current as template */}
              <div className="pt-3">
                <AnimatePresence mode="wait">
                  {showSaveDialog && canSave ? (
                    <SaveTemplateDialog
                      key="dialog"
                      boatClass={boatClass!}
                      assignments={currentAssignments!}
                      onSave={handleSaveTemplate}
                      onCancel={() => setShowSaveDialog(false)}
                    />
                  ) : (
                    <motion.button
                      key="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowSaveDialog(true)}
                      disabled={!canSave}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2
                                 text-sm border border-dashed border-bdr-default rounded
                                 hover:border-interactive-primary hover:text-interactive-primary
                                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                      Save Current as Template
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Template list */}
              <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-24 rounded bg-bg-hover" />
                    <div className="h-24 rounded bg-bg-hover" />
                  </div>
                ) : templates && templates.length > 0 ? (
                  templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onApply={() => handleApplyTemplate(template.id)}
                      onDelete={() => handleDeleteTemplate(template.id)}
                      onToggleDefault={() => handleToggleDefault(template)}
                      isApplying={applyMutation.isPending}
                    />
                  ))
                ) : (
                  <p className="text-sm text-txt-tertiary py-4 text-center">
                    No templates saved{boatClass ? ` for ${boatClass}` : ''}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TemplateManager;
