import { useState, useEffect } from 'react';

import Input from '@root/components/react/system/Input.tsx';
import Button from '@root/components/react/system/Button.tsx';
import IconButton from '@root/components/react/system/IconButton.tsx';
import LicenseModal from '@root/components/react/system/LicenseModal.tsx';
import LicenseTimer from '@root/components/react/system/LicenseTimer.tsx';
import { type Part, encodePartToBase64 } from '@root/ssss/shamir.tsx';
import { partToHTML, partsToHTML } from '@root/ssss/html.tsx';
import { useStore } from './splitterStore';

interface SplitterProps {
  sessionId?: string | null;
}

export default function Splitter({ sessionId }: SplitterProps) {
  const store = useStore();
  const {
    password,
    description,
    threshold,
    totalParts,
    parts,
    licenseKey,
    setPassword,
    setDescription,
    setThreshold,
    setTotalParts,
    split: splitPassword,
  } = store;

  const [showLicenseModal, setShowLicenseModal] = useState(false);

  useEffect(() => {
    // Automatically open license modal if sessionId is provided
    if (sessionId) {
      console.log('Splitter received sessionId, opening license modal:', sessionId);
      setShowLicenseModal(true);
    }
  }, [sessionId]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const sanitizeDescriptionForFilename = (description?: string): string => {
    if (!description) return '';
    return description
      .slice(0, 50)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const downloadPartAsTxt = (part: Part) => {
    const base64Content = encodePartToBase64(part);
    const schemeId = part.metadata.schemeId;
    const sanitizedDescription = sanitizeDescriptionForFilename(part.metadata.description);
    const filename = sanitizedDescription
      ? `${sanitizedDescription}_${schemeId}_part_${part.position}.txt`
      : `${schemeId}_part_${part.position}.txt`;

    const blob = new Blob([base64Content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAllPartsAsTxt = () => {
    if (!parts) return;
    parts.forEach((part, index) => {
      setTimeout(() => downloadPartAsTxt(part), index * 100);
    });
  };

  const downloadPartAsPDF = (part: Part) => {
    openPrintPdfWindow(partToHTML(part));
  };

  const downloadAllPartsAsPDF = () => {
    if (!parts) return;
    openPrintPdfWindow(partsToHTML(parts));
  };

  const handleSplit = async () => {
    try {
      const result = await splitPassword();
      if (result === 'LICENSE_REQUIRED') {
        setShowLicenseModal(true);
      }
    } catch (error) {
      console.error('Error splitting password:', error);
    }
  };

  const handleCloseModal = () => {
    setShowLicenseModal(false);
  };

  return (
    <>
      <LicenseModal store={store} isOpen={showLicenseModal} onClose={handleCloseModal} sessionId={sessionId || undefined} />
      <div className="space-y-6">
        <Input
          label="Password to Split"
          multiline
          rows={4}
          wrap={false}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter your password here..."
        />

        <div className="space-y-2">
          <Input
            label="Description (optional)"
            value={description || ''}
            onChange={e => {
              const value = e.target.value;
              if (value.length <= 100) {
                setDescription(value);
              }
            }}
            placeholder="Optional description for this split..."
          />
          <div className="text-right text-xs text-gray-500 dark:text-gray-400">{(description || '').length}/100 characters</div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Threshold (minimum parts to reconstruct)"
            type="number"
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            min={2}
            max={totalParts}
          />

          <Input
            label="Total Parts"
            type="number"
            value={totalParts}
            onChange={e => setTotalParts(Number(e.target.value))}
            min={threshold}
            max={20}
          />
        </div>

        <div className="space-y-3">
          {licenseKey && licenseKey.expiresAt && <LicenseTimer expiresAt={licenseKey.expiresAt} />}
          <Button onClick={handleSplit} disabled={!password?.trim()} variant="primary" size="lg" fullWidth>
            Split Password
          </Button>
        </div>

        {parts && parts.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Parts</h3>
              <div className="flex gap-2">
                <IconButton onClick={downloadAllPartsAsTxt} variant="secondary" size="sm" icon="📄" aria-label="Download all parts as TXT">
                  Download All TXT
                </IconButton>
                <IconButton onClick={downloadAllPartsAsPDF} variant="accent" size="sm" icon="📄" aria-label="Download all parts as PDF">
                  Download All PDF
                </IconButton>
              </div>
            </div>
            <div className="grid gap-3">
              {parts.map((part, index) => {
                return (
                  <div
                    key={index}
                    className="rounded-lg border border-secondary-200 bg-secondary-50 p-4 dark:border-secondary-700 dark:bg-secondary-900"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-semibold text-secondary-800 dark:text-secondary-200">
                        Part {index + 1} of {parts?.length || 0}
                      </h4>
                      <div className="flex gap-2">
                        <IconButton
                          onClick={() => copyToClipboard(encodePartToBase64(part))}
                          variant="secondary"
                          size="xs"
                          icon="📋"
                          aria-label="Copy part data"
                        >
                          Copy Part
                        </IconButton>
                        <IconButton
                          onClick={() => downloadPartAsTxt(part)}
                          variant="secondary"
                          size="xs"
                          icon="📄"
                          aria-label="Download part as TXT"
                        >
                          TXT
                        </IconButton>
                        <IconButton
                          onClick={() => downloadPartAsPDF(part)}
                          variant="accent"
                          size="xs"
                          icon="📄"
                          aria-label="Download part as PDF"
                        >
                          PDF
                        </IconButton>
                      </div>
                    </div>
                    <code className="block break-all text-sm text-secondary-800 dark:text-secondary-200">{encodePartToBase64(part)}</code>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const openPrintPdfWindow = (htmlContent: string) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.body.innerHTML = htmlContent;
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
};
