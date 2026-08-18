const fs = require('fs');

fs.writeFileSync('postcss.config.js', 'export default { plugins: { tailwindcss: {}, autoprefixer: {} } }', 'utf8');
fs.writeFileSync('tailwind.config.js', 'export default { content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [] }', 'utf8');
fs.writeFileSync('vite.config.ts', 'import { defineConfig } from "vite"; import react from "@vitejs/plugin-react"; export default defineConfig({ plugins: [react()] });', 'utf8');
fs.writeFileSync('src/main.tsx', 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\nimport "./index.css";\n\nReactDOM.createRoot(document.getElementById("root")).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);', 'utf8');

const appContent = import React from 'react';
import GovernorDecreeView from './components/GovernorDecreeView';

export default function App() {
  const mockUser = {
    id: '123',
    role: 'Губернатор',
    full_name: 'Test Governor',
    discord_roles: ['1527281334135947285']
  };

  return (
    <div className="p-8">
      <GovernorDecreeView user={mockUser} />
    </div>
  );
};
fs.writeFileSync('src/App.tsx', appContent, 'utf8');

const indexHtml = <!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pardon System</title>
  </head>
  <body class="bg-gray-900 text-white min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>;
fs.writeFileSync('index.html', indexHtml, 'utf8');

const tsconfig = {
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
};
fs.writeFileSync('tsconfig.json', tsconfig, 'utf8');

let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.type = 'module';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2), 'utf8');
