// Local test server for the portal workflow harness. Not part of the site build.
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
export default {
  root: here,
  server: { port: 4180, strictPort: true, fs: { allow: [fileURLToPath(new URL('../../..', import.meta.url)), '/Users/lukeminshall/Downloads'] } },
  optimizeDeps: { exclude: ['@electric-sql/pglite'] }
};
