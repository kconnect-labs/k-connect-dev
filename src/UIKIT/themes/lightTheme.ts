import { createTheme } from '@mui/material'
import { baseTheme } from './baseTheme'

interface LightThemeSettings {
	enableBlur?: boolean
}
// TODO: поставить нормальные настройки
export function getLightTheme(themeSettings: LightThemeSettings = {}) {
	const enableBlur = themeSettings.enableBlur !== false // <-- костыль, надо будет че нить придумать
	const paperBg = enableBlur
		? 'rgba(255,255,255,0.5)'
		: 'rgba(255,255,255,0.03)'
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
