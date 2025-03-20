import commitizenPrompter from './prompter.js';
import configLoader from '../configLoader/configLoader.js';
import CommitWizardOptions from '../types/CommitWizardOptions.js';

const loadedConfig: CommitWizardOptions = configLoader();
const prompter = commitizenPrompter(loadedConfig);

export default prompter;
