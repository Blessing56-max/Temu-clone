import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionTo, actionOnClick }) {
  return (
    <div className="text-center py-20 px-6">
      {Icon && (
        <div className="mx-auto size-16 rounded-full bg-onLight/5 flex items-center justify-center mb-5">
          <Icon size={26} className="text-onLight/30" />
        </div>
      )}
      <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
      {description && <p className="text-onLight/50 text-sm max-w-sm mx-auto mb-6">{description}</p>}
      {actionTo && (
        <Link to={actionTo}><Button>{actionLabel}</Button></Link>
      )}
      {actionOnClick && !actionTo && (
        <Button onClick={actionOnClick}>{actionLabel}</Button>
      )}
    </div>
  )
}