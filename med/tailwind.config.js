/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: '#6c63ff',
				accent: '#e63946',
				background: '#f9fafb',
				textcolor: '#111827',
			},
		},
	},
	plugins: [],
}


