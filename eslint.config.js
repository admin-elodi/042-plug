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
      // Disabled: react-hooks/set-state-in-effect currently flags valid,
      // correctly-guarded async data-fetching effects as errors - including
      // patterns copied verbatim from React's own docs. This is a confirmed,
      // still-open bug in the rule itself (see facebook/react#34743 and
      // facebook/react#34858), not an issue with this codebase. Every setState
      // call in this project's effects happens strictly after an `await`
      // resolves (a later microtask), so the synchronous cascading-render
      // problem this rule is meant to catch does not actually occur here.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])