import React from 'react'
import { cn } from '../../lib/utils'

export const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
	return (
		<input
			ref={ref}
			type={type}
			className={cn(
				'flex h-11 w-full rounded-full border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300',
				className
			)}
			{...props}
		/>
	)
})

Input.displayName = 'Input'


