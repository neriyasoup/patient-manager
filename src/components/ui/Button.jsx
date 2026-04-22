import clsx from 'clsx'

export default function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500': variant === 'primary',
          'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
          'text-slate-600 hover:bg-slate-100 focus:ring-slate-400': variant === 'ghost',
          'px-2 py-1 text-xs': size === 'xs',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-5 py-2.5 text-base': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
