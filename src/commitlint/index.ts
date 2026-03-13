import { UserConfig } from '@commitlint/types';

import configLoader from '../config-loader/configLoader.js';
import CommitWizardOptions from '../types/CommitWizardOptions.js';
import commitlintUserConfig from './userConfig.js';

const loadedConfig: CommitWizardOptions = configLoader();
const userConfig: UserConfig = commitlintUserConfig(loadedConfig);

export default userConfig;
