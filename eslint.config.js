import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Stride layout & styling patterns — see stride-fe/CLAUDE.md "Layout & styling patterns"
      'no-restricted-syntax': [
        'warn',
        {
          // <Box sx={{ display: 'flex', ... }}>  → use <Stack> instead
          selector: "JSXElement[openingElement.name.name='Box'] JSXAttribute[name.name='sx'] Property[key.name='display'][value.value='flex']",
          message: "Pouzij <Stack direction='row|column'> misto <Box sx={{display:'flex'}}>. Stack uz ma useFlexGap default v theme.",
        },
        {
          // sx={{ fontSize: 13 }} — pouze top-level (ne nested v '& .selector')
          selector: "JSXAttribute[name.name='sx'] > JSXExpressionContainer > ObjectExpression > Property[key.name='fontSize'][value.type='Literal'][value.raw=/^[0-9]+$/]",
          message: "Pouzij Typography variant (label/caption/subtitle2/body2/...) misto sx={{fontSize:<n>}}. Pridavej nove varianty do theme.ts.",
        },
        {
          // inline style={{}} on JSX — zakazano v CLAUDE.md
          selector: "JSXAttribute[name.name='style'][value.expression.type='ObjectExpression']",
          message: "Inline style={{}} je zakazany. Pouzij sx prop (MUI) nebo theme overrides.",
        },
      ],
    },
  },
])
