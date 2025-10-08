import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'primary' | 'ghost'
}

export default function Button ({ variant = 'primary', className = '', ...props }: ButtonProps) {
	const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
	const styles = variant === 'primary'
		? 'bg-primary text-white hover:bg-indigo-600'
		: 'bg-transparent text-textcolor hover:bg-gray-100 border border-gray-300'

	return <button className={`${base} ${styles} ${className}`} {...props} />
}


