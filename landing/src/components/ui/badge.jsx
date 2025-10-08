import React from 'react'
import { cn } from '../../lib/utils'

export const Badge = ({ className, ...props }) => (
	<span
		className={cn(
			'inline-flex items-center gap-1 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-medium text-pink-600',
			className
		)}
		{...props}
	/>
)


