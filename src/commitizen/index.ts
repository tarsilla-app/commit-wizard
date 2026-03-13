import configLoader from '../config-loader/configLoader.js';
import CommitWizardOptions from '../types/CommitWizardOptions.js';
import commitizenPrompter from './prompter.js';

const loadedConfig: CommitWizardOptions = configLoader();
const prompter = commitizenPrompter(loadedConfig);

export default prompter;
