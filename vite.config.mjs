import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const config = require('./vite.config.ts');
export default config.default;