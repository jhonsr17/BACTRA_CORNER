/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Poppins', 'system-ui', 'sans-serif'],
			},
			colors: {
				brand: {
					pink: '#FF6B81',
					purple: '#7C3AED',
					blue: '#60A5FA',
					dark: '#0E1E37',
				},
				text: {
					primary: '#111827',
					secondary: '#6B7280',
				},
			},
			boxShadow: {
				soft: '0 8px 24px rgba(17, 24, 39, 0.08)',
			},
		},
	},
	plugins: [],
}


