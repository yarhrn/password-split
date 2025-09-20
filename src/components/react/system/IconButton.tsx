import { type ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';

type IconButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger';
type IconButtonSize = 'xs' | 'sm' | 'md';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon: string;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
  accent: 'bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
};

export default function IconButton({
  variant = 'secondary',
  size = 'sm',
  icon,
  className = '',
  disabled,
  children,
  ...props
}: IconButtonProps) {
  const baseClasses = 'font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const buttonClasses = classNames(
    baseClasses,
    disabled ? 'cursor-not-allowed bg-gray-400 hover:bg-gray-400' : variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <button className={buttonClasses} disabled={disabled} {...props}>
      <span className="inline-flex items-center gap-1">
        <span>{icon}</span>
        <span>{children}</span>
      </span>
    </button>
  );
}
