import { createCheckoutSession, doLoadStripe, getCheckoutSession, type SessionStatus } from '@root/backend/backend';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const stripePromise = doLoadStripe();
type CheckoutProps = {
  onLicenseKey: (licenseKey: string) => void;
  sessionId?: string;
};

export const Checkout = (props: CheckoutProps) => {
  let [sessionId, setSessionId] = useState<string | null>(props.sessionId || null);
  let [completed, setCompleted] = useState(false);
  let [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  let [licenseKey, setLicenseKey] = useState<string | null>(null);
  let [isRetrievingSession, setIsRetrievingSession] = useState(!!props.sessionId);

  useEffect(() => {
    let intervalId: number;

    // Unified session polling function
    const pollSessionStatus = async (targetSessionId: string) => {
      try {
        console.log('Polling session status for:', targetSessionId);
        let response = await getCheckoutSession(targetSessionId);
        let status = response.session.status;
        console.log('Session status retrieved:', status);

        if (status === 'Completed') {
          if (response.session.licenseKey) {
            setLicenseKey(response.session.licenseKey);
            setIsRetrievingSession(false);
            clearInterval(intervalId);
          }
        } else if (status === 'Unpaid') {
          setSessionStatus(status);
          setIsRetrievingSession(false);
        }
      } catch (error) {
        console.error('Error retrieving session:', error);
        setIsRetrievingSession(false);
      }
    };

    // Poll when we have a sessionId from props (initial retrieval)
    if (props.sessionId && isRetrievingSession) {
      pollSessionStatus(props.sessionId);
      // @ts-ignore
      intervalId = setInterval(() => pollSessionStatus(props.sessionId!), 1000);
    }

    // Poll when checkout is completed (post-payment polling)
    if (completed && sessionId && !licenseKey) {
      pollSessionStatus(sessionId);
      // @ts-ignore
      intervalId = setInterval(() => pollSessionStatus(sessionId), 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [completed, sessionId, props.sessionId, isRetrievingSession, licenseKey]);

  useEffect(() => {
    if (licenseKey) {
      props.onLicenseKey(licenseKey);
    }
  }, [licenseKey]);

  if (sessionStatus == 'Unpaid') {
    return <div>Unpaid</div>;
  }

  if (isRetrievingSession) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Retrieving session status</h3>
        <p className="max-w-md text-center text-gray-600 dark:text-gray-400">Checking your payment status...</p>
      </div>
    );
  }

  if (completed && !licenseKey) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Waiting for payment confirmation</h3>
        <p className="max-w-md text-center text-gray-600 dark:text-gray-400">
          License key will be also sent to your email, make sure to check spam folder
        </p>
      </div>
    );
  }

  // If we have a sessionId from props, don't create a new checkout session
  if (props.sessionId) {
    return null; // Session retrieval is handled in the useEffect above
  }

  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{
        fetchClientSecret: async () => {
          const response = await createCheckoutSession();
          setSessionId(response.session.id);
          return response.clientSecret;
        },
        onComplete: () => {
          setCompleted(true);
        },
      }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
};
