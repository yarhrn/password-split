import { useState, useEffect, useRef } from 'react';
import Button from '@root/components/react/system/Button';
import Input from '@root/components/react/system/Input';
import { CircleCheck, Lock, AlertCircle, XCircle, Clock, ChevronDown } from 'lucide-react';
import { Checkout } from '@root/components/react/Checkout';
import { verifyLicenseKey, type LicenseKeyVerificationError } from '@root/ssss/jwt.tsx';
import { isLeft, isRight } from '@root/ssss/either';
import type { SplitterStore } from '@root/components/react/splitterStore';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: SplitterStore;
  sessionId?: string;
}

export default function LicenseModal({ isOpen, onClose, store, sessionId }: LicenseModalProps) {
  const [mounted, setMounted] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [validationError, setValidationError] = useState<LicenseKeyVerificationError | null>(null);
  const [exceptionMessage, setExceptionMessage] = useState<string | null>();
  const [isValidating, setIsValidating] = useState(false);
  const [showSupportSection, setShowSupportSection] = useState(false);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // If sessionId is provided, automatically show checkout and start retrieving session
    if (sessionId && isOpen) {
      console.log('LicenseModal received sessionId, showing checkout:', sessionId);
      setShowCheckout(true);
    }
  }, [sessionId, isOpen]);

  useEffect(() => {
    setValidationError(null);
    setExceptionMessage(null);
  }, [licenseKey]);

  const handleSubmit = async () => {
    if (!licenseKey.trim()) return;

    setIsValidating(true);
    setValidationError(null);
    setExceptionMessage(null);

    try {
      const verificationResult = await verifyLicenseKey(licenseKey.trim(), null);

      if (isLeft(verificationResult)) {
        setValidationError(verificationResult.value.error);
        return;
      }

      if (isRight(verificationResult)) {
        store.setLicenseKey(verificationResult.value);
      }

      setValidationError(null);
      onClose();
    } catch (error) {
      if (error && error.toString) {
        setExceptionMessage(error.toString());
      }
      setValidationError('VERIFICATION_EXCEPTION');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePurchase = () => {
    setShowCheckout(true);

    setTimeout(() => {
      if (checkoutRef.current && scrollContainerRef.current) {
        const checkoutTop = checkoutRef.current.offsetTop;
        const containerHeight = scrollContainerRef.current.clientHeight;
        const scrollTop = checkoutTop - containerHeight / 2 + checkoutRef.current.clientHeight / 2;

        scrollContainerRef.current.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        });
      }
    }, 100);
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex w-full items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="relative mx-4 flex max-h-[90vh] w-full max-w-lg transform flex-col overflow-hidden rounded-xl bg-white shadow-2xl transition-all dark:bg-gray-800">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
              <div className="text-primary-600 dark:text-primary-400">
                <Lock />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Premium License Required</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Custom passwords require a license</p>
          </div>

          {/* Content */}
          <div className="mb-6 space-y-4">
            <div className="rounded-lg bg-accent-50 p-4 dark:bg-accent-900/20">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">Premium License</span>
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">$2</span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Valid for 20 minutes for unlimited splits</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowSupportSection(!showSupportSection)}
                className="group flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4 text-left shadow-sm transition-all hover:border-primary-300 hover:from-primary-50 hover:to-white hover:shadow-md dark:border-gray-600 dark:from-gray-800 dark:to-gray-700 dark:hover:border-primary-600 dark:hover:from-gray-700 dark:hover:to-gray-800"
                aria-expanded={showSupportSection}
              >
                <div className="flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 group-hover:bg-primary-200 dark:bg-primary-900 dark:group-hover:bg-primary-800">
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">?</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                    Why should I pay for bunch of js on client?
                  </h4>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-all group-hover:text-primary-500 ${showSupportSection ? 'rotate-180' : ''}`}
                />
              </button>

              {showSupportSection && (
                <div className="space-y-3 pl-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The critical value of this site is to{' '}
                    <strong className="text-gray-800 dark:text-gray-200">stay online as long as possible</strong> so that everyone can
                    reconstruct their passwords when needed. The goal is to maintain this project indefinitely and add new features to make
                    it even more secure and useful.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">New features include but are not limited to:</p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <CircleCheck className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
                      <span>Email notifications to regularly check recoverability of the key</span>
                    </li>
                    <li className="flex items-start">
                      <CircleCheck className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
                      <span>Steganography support for hiding splits in images</span>
                    </li>
                    <li className="flex items-start">
                      <CircleCheck className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
                      <span>Constant maintenance and security updates</span>
                    </li>
                    <li className="flex items-start">
                      <CircleCheck className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
                      <span>Cover hosting and development costs</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* License Input */}
            <Input
              label="License Key"
              value={licenseKey}
              onChange={e => setLicenseKey(e.target.value)}
              placeholder="Enter your license key..."
              className="text-sm"
              enableCopy
            />

            {/* Error States */}
            {validationError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0">
                    {validationError === 'EXPIRED' && <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />}
                    {validationError === 'SIGNATURE_NOT_VALID' && <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
                    {validationError === 'VERIFICATION_EXCEPTION' && <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">
                      {validationError === 'EXPIRED' && 'License Expired'}
                      {validationError === 'SIGNATURE_NOT_VALID' && 'Invalid License Key'}
                      {validationError === 'VERIFICATION_EXCEPTION' && 'Verification Failed'}
                    </h4>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                      {validationError === 'EXPIRED' && 'This license key has expired. Please purchase a new license to continue.'}
                      {validationError === 'SIGNATURE_NOT_VALID' && 'The license key format is invalid or has been tampered with.'}
                      {validationError === 'VERIFICATION_EXCEPTION' && (
                        <span>
                          An error occurred while verifying your license key.
                          {exceptionMessage && (
                            <span className="mt-2 block rounded bg-red-100 p-2 font-mono text-xs text-red-800 dark:bg-red-800/30 dark:text-red-200">
                              {exceptionMessage}
                            </span>
                          )}
                          <span className="mt-2 block text-xs">
                            For security reasons, we don't use automatic error capture services. Please contact support at{' '}
                            <a href="mailto:support@passwordsplit.com" className="underline hover:no-underline">
                              support@passwordsplit.com
                            </a>{' '}
                            with the error details above.
                          </span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {showCheckout && (
              <div ref={checkoutRef}>
                <Checkout
                  sessionId={sessionId}
                  onLicenseKey={licenseKey => {
                    setLicenseKey(licenseKey);
                    setShowCheckout(false);
                  }}
                />
              </div>
            )}
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="flex-1 border border-gray-300 !bg-white !text-gray-700 hover:!bg-gray-50 dark:border-gray-600 dark:!bg-gray-700 dark:!text-gray-300 dark:hover:!bg-gray-600"
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!licenseKey.trim() || isValidating} className="flex-1">
                {isValidating ? 'Validating...' : 'Verify License'}
              </Button>
            </div>

            {!showCheckout && (
              <Button variant="accent" size="md" onClick={handlePurchase} fullWidth>
                Purchase License
              </Button>
            )}
          </div>

          {/* Footer */}
          <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">Try with "MyPassword123" for free demo</p>
        </div>
      </div>
    </div>
  );
}
