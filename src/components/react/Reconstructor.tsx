import { useRef, useEffect } from 'react';
import Input from '@root/components/react/system/Input';
import Button from '@root/components/react/system/Button.tsx';
import { useReconstructorStore } from './reconstructorStore';

interface ReconstructorProps {}

export default function Reconstructor({}: ReconstructorProps) {
  const {
    parts,
    currentPartInput,
    reconstructedPassword,
    error,
    threshold,
    schemeId,
    setCurrentPartInput,
    addManualPart,
    addFilePart,
    removePart,
    reconstruct: handleReconstruct,
  } = useReconstructorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const reconstructedPasswordRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      addFilePart(content, file.name);
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canReconstruct = parts.length > 0 && threshold !== undefined && parts.length >= threshold;
  const needsMoreParts = threshold !== undefined && parts.length < threshold;

  useEffect(() => {
    if (reconstructedPassword && reconstructedPasswordRef.current) {
      reconstructedPasswordRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [reconstructedPassword]);

  return (
    <div className="space-y-6">
      {threshold !== undefined && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
              Progress: {parts.length} / {threshold} parts
            </h3>
            {needsMoreParts && (
              <span className="text-sm text-green-600 dark:text-green-400">
                Need {threshold - parts.length} more part
                {threshold - parts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {schemeId && parts.length > 0 && parts[0].part.metadata.description && (
            <div className="mt-3">
              <Input label="Description" value={parts[0].part.metadata.description} disabled readOnly />
            </div>
          )}
          <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${(parts.length / threshold) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Add Parts</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Input
              label="Manual Part Input"
              value={currentPartInput}
              onChange={e => setCurrentPartInput(e.target.value)}
              placeholder="Paste part here..."
            />
            <Button onClick={() => addManualPart()} disabled={!currentPartInput.trim()} variant="secondary" size="sm" fullWidth>
              Add Manual Part
            </Button>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Part File</label>
            <input ref={fileInputRef} type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} variant="secondary" size="sm" fullWidth>
              Choose File
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900">
          <h3 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">Error</h3>
          <div className="text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}

      {parts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Added Parts ({parts.length})</h3>
          <div className="grid gap-3">
            {parts.map(partWithUI => (
              <div
                key={partWithUI.id}
                className="rounded-lg border border-secondary-200 bg-secondary-50 p-4 dark:border-secondary-700 dark:bg-secondary-900"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-semibold text-secondary-800 dark:text-secondary-200">
                    Part {partWithUI.part.position} of {partWithUI.part.metadata.totalParts}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-secondary-600 dark:text-secondary-400">
                      {partWithUI.source === 'file' ? `File: ${partWithUI.fileName}` : 'Manual input'}
                    </span>
                    <Button onClick={() => removePart(partWithUI.id)} variant="secondary" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
                <code className="block break-all text-sm text-secondary-800 dark:text-secondary-200">{partWithUI.part.part}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {parts.length > 0 && (
        <Button onClick={() => handleReconstruct()} disabled={!canReconstruct} variant="primary" size="lg" fullWidth>
          {canReconstruct
            ? 'Reconstruct Password'
            : `Need ${threshold ? threshold - parts.length : 1} more part${threshold && threshold - parts.length !== 1 ? 's' : ''}`}
        </Button>
      )}

      <div
        ref={reconstructedPasswordRef}
        className="rounded-lg border border-accent-200 bg-accent-50 p-4 dark:border-accent-700 dark:bg-accent-900"
      >
        <h3 className="mb-2 text-lg font-semibold text-accent-800 dark:text-accent-200">Reconstructed Password</h3>
        <div className="min-h-[100px] rounded border bg-white p-3 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {reconstructedPassword ? (
            <code className="break-all">{reconstructedPassword}</code>
          ) : (
            <em>Add parts above and click reconstruct when ready</em>
          )}
        </div>
      </div>
    </div>
  );
}
