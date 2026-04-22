import clsx from 'clsx'

export default function Badge({ children, color = 'slate', className }) {
  return (
    <span className={clsx(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
      color,
      className,
    )}>
      {children}
    </span>
  )
}
