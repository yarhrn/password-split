import { loadStripe } from '@stripe/stripe-js';

type CreateCheckoutSessionResponse = {
  clientSecret: string;
  session: CheckoutSession;
};

type GetCheckoutSessionResponse = {
  session: CheckoutSession;
};

export type SessionStatus = 'Completed' | 'Open' | 'Expired' | 'Unpaid';
type CheckoutSession = {
  id: string;
  status: SessionStatus;
  licenseKey?: string;
};

export type GetStringPublishableKeyResponse = {
  publishableKey: string;
};

let password = window.localStorage.getItem('checkout-password');

export const isCheckoutPasswordSet = () => {
  return !!window.localStorage.getItem('checkout-password');
};

export const createCheckoutSession = async () => {
  let response = await fetch('https://api.omegaparcel.com/api/passwordsplit/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });

  let body = await response.json();

  return body as unknown as CreateCheckoutSessionResponse;
};

export const reportEvent = async (event: string) => {
  await fetch('https://api.omegaparcel.com/api/passwordsplit/report-event', {
    method: 'POST',
    body: JSON.stringify({ event, path: window.location.pathname }),
  });
};

export const getCheckoutSession = async (sessionId: string) => {
  let response = await fetch('https://api.omegaparcel.com/api/passwordsplit/get-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ password, sessionId }),
  });

  let body = await response.json();

  return body as unknown as GetCheckoutSessionResponse;
};

export const getStripePublishableKey = async () => {
  let response = await fetch('https://api.omegaparcel.com/api/passwordsplit/get-stripe-publishable-key', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });

  let body = response.json();

  return body as unknown as GetStringPublishableKeyResponse;
};

export const doLoadStripe = async () => {
  let key = await getStripePublishableKey();
  return await loadStripe(key.publishableKey);
};
