import React from 'react'
import { cn } from '../../lib/utils'

export const Card = ({ className, ...props }) => (
	<div className={cn('rounded-2xl border border-gray-200 bg-white shadow-sm', className)} {...props} />
)

export const CardHeader = ({ className, ...props }) => (
	<div className={cn('flex items-center gap-3 p-6', className)} {...props} />
)

export const CardTitle = ({ className, ...props }) => (
	<h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props} />
)

export const CardContent = ({ className, ...props }) => (
	<div className={cn('p-6 pt-0 text-gray-600', className)} {...props} />
)


