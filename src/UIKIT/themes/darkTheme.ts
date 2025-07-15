import { createTheme } from '@mui/material'
import { baseTheme } from './baseTheme'

interface DarkThemeSettings {
	enableBlur?: boolean
}
// TODO: поставить нормальные настройки
export function getDarkTheme(themeSettings: DarkThemeSettings = {}) {
	const enableBlur = themeSettings.enableBlur !== false
	const paperBg = enableBlur
		? 'rgba(0, 0, 0, 0.51)'
		: 'rgba(0, 0, 0, 0.03)'
	return createTheme({
		...baseTheme,
		palette: {
			mode: 'light',
			primary: {
				main: '#1976d2',
			},
			background: {
				default: '#f5f5f5',
				paper: paperBg,
			},
			text: {
				primary: '#000000',
			},
		},
		components: {
			MuiPaper: {
				styleOverrides: {
					root: {
						backgroundColor: paperBg,
						border: '1px solid #e0e0e0',
					},
				},
			},
			MuiCard: {
				styleOverrides: {
					root: {
						backgroundColor: paperBg,
					},
				},
			},
		},
	})
}
