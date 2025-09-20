import { type ButtonHTMLAttributes } from 'react';

interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
}

export default function TabButton({ active = false, className = '', children, ...props }: TabButtonProps) {
  const baseClasses = 'px-6 py-3 text-sm font-medium transition-colors focus:outline-none';
  const activeClasses = active
    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
    : 'text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400';

  const buttonClasses = `
    ${baseClasses}
    ${activeClasses}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}
