import { useState, useCallback, useRef } from 'react';
import { Upload, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import {
  importFitFiles,
  formatDuration,
  formatDistance,
  formatWorkoutType,
} from '@/services/fitImportService';

/**
 * FIT import result from API
 */
interface ImportedWorkout {
  filename: string;
  type: string;
  duration: number;
  distance: number;
}

interface FailedImport {
  filename: string;
  error: string;
}

interface FitImportResult {
  imported: number;
  failed: number;
  results: {
    imported: ImportedWorkout[];
    failed: FailedImport[];
  };
}

/**
 * FitImportSection - Import .FIT files from Garmin, Polar, Suunto, Wahoo, or Concept2
 *
 * Features:
 * - File input accepting .fit files (multiple)
 * - Upload button with loading state
 * - Results display with imported files and failed imports
 * - Uses formatDuration, formatDistance, formatWorkoutType from fitImportService
 */
export function FitImportSection() {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<FitImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection and import
   */
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const fileArray = Array.from(files);
      const result = await importFitFiles(fileArray);
      setImportResult(result);
    } catch (error) {
      console.error('FIT import failed:', error);
      // Show error in result format
      setImportResult({
        imported: 0,
        failed: files.length,
        results: {
          imported: [],
          failed: Array.from(files).map((f) => ({
            filename: f.name,
            error: error instanceof Error ? error.message : 'Import failed',
          })),
        },
      });
    } finally {
      setIsImporting(false);
      // Reset file input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-status-success/10 flex items-center justify-center">
          <Upload className="w-4 h-4 text-status-success" />
        </div>
        <h3 className="text-lg font-semibold text-txt-primary">Garmin .FIT Import</h3>
      </div>

      <div className="space-y-4">
        {/* Upload Card */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-bg-surface-elevated/30 border border-bdr-subtle">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-status-success/20 border border-status-success/30 flex items-center justify-center">
              <span className="text-xl">⌚</span>
            </div>
            <div>
              <h4 className="font-medium text-txt-primary">Import .FIT Files</h4>
              <p className="text-sm text-txt-secondary">
                Upload files from Garmin, Polar, Suunto, Wahoo, or Concept2
              </p>
            </div>
          </div>
          <label
            className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all ${
              isImporting
                ? 'bg-bg-surface-elevated/50 border border-bdr-default text-txt-tertiary cursor-not-allowed'
                : 'bg-status-success text-txt-inverse border border-status-success hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]'
            }`}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Select Files
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".fit"
              multiple
              onChange={handleFileChange}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>

        {/* Import Results */}
        {importResult && (
          <div className="p-4 rounded-xl bg-bg-surface-elevated/30 border border-bdr-subtle">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-status-success" />
              <span className="font-medium text-txt-primary">
                Imported {importResult.imported} workout{importResult.imported !== 1 ? 's' : ''}
              </span>
              {importResult.failed > 0 && (
                <span className="text-sm text-status-warning">({importResult.failed} failed)</span>
              )}
            </div>

            {/* Imported files */}
            {importResult.results.imported.length > 0 && (
              <div className="space-y-2">
                {importResult.results.imported.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-bg-base/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-1 rounded bg-status-success/10 text-status-success border border-status-success/20">
                        {formatWorkoutType(item.type)}
                      </span>
                      <span className="text-sm text-txt-secondary truncate max-w-[200px]">
                        {item.filename}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-txt-tertiary">
                      <span>{formatDuration(item.duration)}</span>
                      <span>{formatDistance(item.distance)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Failed imports */}
            {importResult.results.failed.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-txt-tertiary">Failed imports:</p>
                {importResult.results.failed.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-lg bg-status-error/5 border border-status-error/10"
                  >
                    <XCircle className="w-4 h-4 text-status-error flex-shrink-0" />
                    <span className="text-sm text-txt-secondary truncate">{item.filename}</span>
                    <span className="text-xs text-status-error">{item.error}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-txt-secondary">
          Import .FIT files directly from your fitness devices. Supports rowing, running, cycling,
          and cross-training activities.
        </p>
      </div>
    </section>
  );
}

export default FitImportSection;
