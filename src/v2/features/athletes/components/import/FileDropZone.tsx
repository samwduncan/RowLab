import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { SPRING_CONFIG, SPRING_FAST, usePrefersReducedMotion } from '@v2/utils/animations';

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  error: string | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_EXTENSIONS = ['.csv', '.txt'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isValidFile(file: File): string | null {
  const name = file.name.toLowerCase();
  const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));

  if (!hasValidExtension) {
    return 'Invalid file format. Please upload a .csv or .txt file.';
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File too large (${formatFileSize(file.size)}). Maximum size is 10 MB.`;
  }

  if (file.size === 0) {
    return 'File is empty. Please upload a file with data.';
  }

  return null;
}

export function FileDropZone({ onFileSelected, selectedFile, error }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  const displayError = error || localError;

  const handleFile = useCallback(
    (file: File) => {
      setLocalError(null);
      const validationError = isValidFile(file);
      if (validationError) {
        setLocalError(validationError);
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current += 1;
    if (dragCountRef.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current -= 1;
    if (dragCountRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCountRef.current = 0;
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input so same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFile]
  );

  const handleClearFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalError(null);
    // Trigger with a "null-like" state by calling onFileSelected with empty handling upstream
    // The parent wizard handles resetting selectedFile
  }, []);

  const springTransition = prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG;
  const fastTransition = prefersReducedMotion ? { duration: 0 } : SPRING_FAST;

  // File accepted state
  if (selectedFile && !displayError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springTransition}
        className="relative border-2 border-status-success/40 rounded-xl p-8 text-center
                   bg-status-success/5 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-status-success/20 flex items-center justify-center">
            <CheckCircle2 className="text-status-success" size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center">
              <FileText size={16} className="text-txt-secondary" />
              <span className="text-sm font-medium text-txt-primary">{selectedFile.name}</span>
            </div>
            <p className="text-xs text-txt-tertiary mt-1">{formatFileSize(selectedFile.size)}</p>
          </div>
        </div>

        <button
          onClick={(e) => {
            handleClearFile(e);
            handleClick();
          }}
          className="mt-3 text-xs text-interactive-primary hover:text-interactive-hover
                     underline underline-offset-2"
        >
          Choose a different file
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <motion.div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.005 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.995 }}
        transition={fastTransition}
        className={`
          relative cursor-pointer rounded-xl p-8 min-h-[200px]
          flex flex-col items-center justify-center gap-3
          border-2 border-dashed transition-colors duration-200
          ${
            isDragging
              ? 'border-interactive-primary bg-interactive-primary/10 backdrop-blur-sm'
              : displayError
                ? 'border-status-error/40 bg-status-error/5'
                : 'border-bdr-default hover:border-interactive-primary/60 hover:bg-bg-hover/50 bg-bg-surface/50 backdrop-blur-sm'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt,text/csv,text/plain"
          onChange={handleInputChange}
          className="hidden"
          aria-label="Upload CSV file"
        />

        <motion.div
          animate={isDragging ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
          transition={springTransition}
          className={`w-14 h-14 rounded-full flex items-center justify-center
            ${
              isDragging
                ? 'bg-interactive-primary/20'
                : displayError
                  ? 'bg-status-error/10'
                  : 'bg-bg-surface-elevated'
            }`}
        >
          {displayError ? (
            <AlertCircle size={28} className="text-status-error" />
          ) : (
            <Upload
              size={28}
              className={isDragging ? 'text-interactive-primary' : 'text-txt-tertiary'}
            />
          )}
        </motion.div>

        <div className="text-center">
          <p
            className={`text-sm font-medium ${isDragging ? 'text-interactive-primary' : 'text-txt-primary'}`}
          >
            {isDragging ? 'Drop your file here' : 'Drag and drop CSV file here or click to browse'}
          </p>
          <p className="text-xs text-txt-tertiary mt-1">Supports .csv and .txt files up to 10 MB</p>
        </div>
      </motion.div>

      {displayError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fastTransition}
          className="flex items-center gap-2 px-3 py-2 text-sm text-status-error
                     bg-status-error/10 border border-status-error/20 rounded-lg"
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{displayError}</span>
        </motion.div>
      )}
    </div>
  );
}
