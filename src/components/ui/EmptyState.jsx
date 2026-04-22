export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center px-6">
      {icon && <div className="text-4xl text-slate-300">{icon}</div>}
      <div>
        <p className="font-medium text-slate-500">{title}</p>
        {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}
