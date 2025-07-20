
```bash
# Форматировать все файлы
npm run format

# Проверить форматирование без изменений
npm run format:check

# Форматировать с игнорированием неизвестных файлов
npm run format:fix
```

И добавить в package.json:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
```

## Troubleshooting

### Конфликты с ESLint

Если есть конфликты между Prettier и ESLint:
1. Убедитесь, что `eslint-config-prettier` установлен
2. Добавьте `"prettier"` в extends массив ESLint конфигурации

### Проблемы с VS Code

Если автоформатирование не работает:
1. Проверьте, что установлено расширение Prettier
2. Убедитесь, что Prettier выбран как форматтер по умолчанию
3. Перезапустите VS Code

### Игнорирование файлов

Чтобы исключить файл из форматирования, добавьте в начало файла:

```javascript
// prettier-ignore
const uglyCode = {   a:1,    b:2   };
```

Или добавьте файл в `.prettierignore`. 