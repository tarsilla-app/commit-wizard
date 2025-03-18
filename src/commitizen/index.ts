import commitizenPrompter from './prompter.js';
import configLoader from '../configLoader/configLoader.js';
import Config from '../types/Config.js';

const loadedConfig: Config = configLoader();
const prompter = commitizenPrompter(loadedConfig);

export default prompter;
