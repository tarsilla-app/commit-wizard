import { UserConfig } from '@commitlint/types';

import commitlintUserConfig from './userConfig.js';
import configLoader from '../configLoader/configLoader.js';
import Config from '../types/Config.js';

const loadedConfig: Config = configLoader();
const userConfig: UserConfig = commitlintUserConfig(loadedConfig);

export default userConfig;
