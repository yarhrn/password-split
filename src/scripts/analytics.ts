import { reportEvent } from '@root/backend/backend';

type BotCheckResult = {
  isBot: boolean;
  reason?: string;
};

const detectBot = (): BotCheckResult => {
  if (typeof window === 'undefined') {
    return { isBot: true, reason: 'no_window' };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'java', 'http', 'phantom', 'headless'];

  for (const pattern of botPatterns) {
    if (userAgent.includes(pattern)) {
      return { isBot: true, reason: 'user_agent' };
    }
  }

  if (navigator.webdriver) {
    return { isBot: true, reason: 'webdriver' };
  }

  if (window.document.documentElement.getAttribute('webdriver')) {
    return { isBot: true, reason: 'webdriver_attr' };
  }

  if ((window as any).__nightmare || (window as any)._phantom || (window as any).callPhantom) {
    return { isBot: true, reason: 'automation_tool' };
  }

  if (!navigator.languages || navigator.languages.length === 0) {
    return { isBot: true, reason: 'no_languages' };
  }

  if (!window.screen || window.screen.width === 0 || window.screen.height === 0) {
    return { isBot: true, reason: 'invalid_screen' };
  }

  return { isBot: false };
};

export const trackPageView = async () => {
  try {
    const botCheck = detectBot();

    if (botCheck.isBot) {
      return;
    }

    await reportEvent('page_view');
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};
