import fs from 'fs';
import path from 'path';

import Config from '../types/Config.js';

const config: Config = {
  maxLineLength: 120,
};
const file = 'commit-wizard.config.json';

function configLoader(): Config {
  const configPath = path.resolve(process.cwd(), file);

  if (!fs.existsSync(configPath)) {
    return config;
  }

  const loadedConfig = require(configPath);
  return { ...config, ...loadedConfig };
}

export default configLoader;
