import { forwardRef } from 'react';
import classNames from 'classnames';
import { Copy } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  multiline?: boolean;
  rows?: number;
  wrap?: boolean;
  enableCopy?: boolean;
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, multiline = false, rows = 4, wrap = true, enableCopy = false, className = '', ...props }, ref) => {
    const baseClasses =
      'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors';

    const handleCopy = () => {
      if (typeof props.value === 'string') {
        navigator.clipboard.writeText(props.value);
      }
    };

    const inputClasses = classNames(
      baseClasses,
      {
        'overflow-x-auto whitespace-nowrap': !wrap,
        'pr-12': enableCopy,
        '[&::-webkit-inner-spin-button]:h-6 [&::-webkit-inner-spin-button]:w-4 [&::-webkit-inner-spin-button]:cursor-pointer [&::-webkit-inner-spin-button]:bg-gradient-to-b [&::-webkit-inner-spin-button]:from-primary-500 [&::-webkit-inner-spin-button]:to-primary-600 [&::-webkit-inner-spin-button]:opacity-100 hover:[&::-webkit-inner-spin-button]:from-primary-600 hover:[&::-webkit-inner-spin-button]:to-primary-700 [&::-webkit-outer-spin-button]:cursor-pointer [&::-webkit-outer-spin-button]:opacity-100':
          props.type === 'number',
      },
      className
    );

    const inputElement = multiline ? (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        className={inputClasses}
        rows={rows}
        wrap={wrap ? 'soft' : 'off'}
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    ) : (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        className={inputClasses}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    );

    const inputWrapper = enableCopy ? (
      <div className="relative">
        {inputElement}
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-primary-500"
          aria-label="Copy to clipboard"
        >
          <Copy size={20} />
        </button>
      </div>
    ) : (
      inputElement
    );

    if (label) {
      return (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
          {inputWrapper}
        </div>
      );
    }

    return inputWrapper;
  }
);

Input.displayName = 'Input';

export default Input;
