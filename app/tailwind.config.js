import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		fontFamily: {
			sans: ['Inter', 'sans-serif', ...fontFamily.sans]
		},
		extend: {
			animation: {
				'spin-slow': 'spin 25s linear infinite',
				'spin-medium': 'spin 20s linear infinite'
			}
		},
		colors: {
			inherit: 'inherit',
			transparent: 'transparent',
			current: 'currentColor',
			black: 'rgb(0 0 0)',
			white: 'rgb(255 255 255)',
			violet: {
				100: '#A5B4FB',
				200: '#A8A6FF',
				300: '#918efa',
				400: '#807dfa'
			},
			pink: {
				200: '#FFA6F6',
				300: '#fa8cef',
				400: '#fa7fee'
			},
			red: {
				200: '#FF9F9F',
				300: '#fa7a7a',
				400: '#f76363'
			},
			orange: {
				200: '#FFC29F',
				300: '#FF965B',
				400: '#fa8543'
			},
			yellow: {
				200: '#FFF59F',
				300: '#FFF066',
				400: '#FFE500'
			},
			lime: {
				100: '#c6fab4',
				200: '#B8FF9F',
				300: '#9dfc7c',
				400: '#7df752'
			},
			cyan: {
				200: '#A6FAFF',
				300: '#79F7FF',
				400: '#53f2fc'
			},
			gray: {
				50: '#F6F7F9',
				100: '#ECEEF2',
				200: '#D5DAE2',
				300: '#B0BAC9',
				400: '#8594AB',
				500: '#667891',
				600: '#516078',
				700: '#424E62',
				800: '#394353',
				900: '#343B48',
				950: '#22262F'
			}
		}
	},
	plugins: []
};
