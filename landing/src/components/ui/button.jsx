import React from 'react'
import { cn } from '../../lib/utils'

const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-5'

const variants = {
	default: 'bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-400',
	outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
	ghost: 'bg-transparent hover:bg-gray-100',
	gradient: 'text-white bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 focus-visible:ring-pink-300',
}

export const Button = ({ className, variant = 'default', asChild, ...props }) => {
	const Comp = asChild ? 'span' : 'button'
	return <Comp className={cn(base, variants[variant], className)} {...props} />
}

export default Button


