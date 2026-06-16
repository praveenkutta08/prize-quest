// Allow side-effect CSS imports (e.g. `import "./casino-loud.css"`) under tsc.
// Vite/Storybook bundle the actual stylesheet; tsc just needs the module to exist.
// Pulled into consumers' programs via the triple-slash reference in index.ts.
declare module "*.css";
