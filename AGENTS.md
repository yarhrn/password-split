# Agent Guidelines for password-split-private

## Commands

- **Build**: `yarn build` or `npm run build`
- **Dev**: `yarn dev` or `npm run dev`
- **Preview**: `yarn preview` or `npm run preview`
- **No test/lint commands defined** - ESLint and Prettier are configured but no scripts

## Code Style

- **Framework**: Astro with TypeScript (strict mode)
- **CSS**: Tailwind CSS for styling
- **Formatting**: Prettier with 2-space tabs, single quotes, semicolons, 80 char width
- **Imports**: Use relative imports (e.g., `../styles/global.css`, `../components/`)
- **Naming**: camelCase for functions/variables, kebab-case for files/classes
- **Components**: Use `.astro` extension, frontmatter with `---` separators
- **Scripts**: Use `is:inline` for client-side scripts in components
- **Theme**: Dark/light mode support with `dark:` Tailwind classes
- **Accessibility**: Include ARIA labels (`aria-label`) for interactive elements
- **Error Handling**: Check for element existence before DOM manipulation
- **Event Listeners**: Wrap in `DOMContentLoaded` for safety
- **CSS Classes**: Use semantic Tailwind utility classes with transitions
- There are ready to use components like input and button in ./src/components/\*
- Prefer `null` to empty string and undefineds.
- use lucide icon for icons, dont create custom svgs
- **Color pallete**: use colors from tailwind css

```
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
    },
  },
  plugins: [],
};
```

## Project Structure

- Components in `src/components/`
- Pages in `src/pages/`
- Scripts in `src/scripts/`
- Styles in `src/styles/`
