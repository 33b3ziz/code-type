/**
 * Step Header Component
 * Title and description for wizard steps
 */

export interface StepHeaderProps {
  title: string
  description: string
}

export function StepHeader({ title, description }: StepHeaderProps) {
  return (
    <div className="text-center mb-6">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-gray-400 text-sm mt-1">{description}</p>
    </div>
  )
}

export default StepHeader
