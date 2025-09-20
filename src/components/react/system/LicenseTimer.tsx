import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import classNames from 'classnames';

interface LicenseTimerProps {
  expiresAt: Date;
}

export default function LicenseTimer({ expiresAt }: LicenseTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const isExpiringSoon = (() => {
    const diff = expiresAt.getTime() - new Date().getTime();
    return diff > 0 && diff < 5 * 60 * 1000; // Less than 5 minutes
  })();

  const isExpired = timeLeft === 'Expired';

  return (
    <div
      className={classNames(`flex items-center gap-2 rounded-md px-3 py-2`, {
        'bg-red-50 dark:bg-red-900/20': isExpired,
        'bg-yellow-50 dark:bg-yellow-900/20': isExpiringSoon,
        'bg-green-50 dark:bg-green-900/20': !isExpiringSoon,
      })}
    >
      <Clock
        className={classNames(`h-4 w-4`, {
          'text-red-600 dark:text-red-400': isExpired,
          'text-yellow-600 dark:text-yellow-400': isExpiringSoon,
          'text-green-600 dark:text-green-400': !isExpiringSoon,
        })}
      />
      <span
        className={classNames(`text-sm`, {
          'text-red-700 dark:text-red-300': isExpired,
          'text-yellow-700 dark:text-yellow-300': isExpiringSoon,
          'text-green-700 dark:text-green-300': !isExpiringSoon,
        })}
      >
        {isExpired ? 'License expired' : `License expires in: ${timeLeft}`}
      </span>
    </div>
  );
}
