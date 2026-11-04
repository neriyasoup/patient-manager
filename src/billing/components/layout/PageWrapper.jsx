export function PageWrapper({ title, actions, children }) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {(title || actions) && (
        <div className="flex items-center justify-between mb-6">
          {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
