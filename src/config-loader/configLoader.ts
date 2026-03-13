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

  const rawConfig = fs.readFileSync(configPath, 'utf8');
  const parsedConfig: unknown = JSON.parse(rawConfig);

  if (!parsedConfig || typeof parsedConfig !== 'object') {
    return config;
  }

  return { ...config, ...parsedConfig };
}

export default configLoader;
