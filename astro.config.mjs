import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://gyul.ai',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'never' },
});
