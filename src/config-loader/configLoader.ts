import fs from 'fs';
import path from 'path';

import CommitWizardOptions from '../types/CommitWizardOptions.js';

const config: CommitWizardOptions = {
  maxLineLength: 120,
};
const file = 'commit-wizard.config.json';

function configLoader(): CommitWizardOptions {
  const configPath = path.resolve(process.cwd(), file);

  if (!fs.existsSync(configPath)) {
    return config;
  }

  const loadedConfig = require(configPath);
  return { ...config, ...loadedConfig };
}

export default configLoader;
