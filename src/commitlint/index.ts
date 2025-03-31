import { UserConfig } from '@commitlint/types';

import commitlintUserConfig from './userConfig.js';
import configLoader from '../config-loader/configLoader.js';
import CommitWizardOptions from '../types/CommitWizardOptions.js';

const loadedConfig: CommitWizardOptions = configLoader();
const userConfig: UserConfig = commitlintUserConfig(loadedConfig);

export default userConfig;
