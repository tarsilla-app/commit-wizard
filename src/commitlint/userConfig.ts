import { UserConfig } from '@commitlint/types';

import CommitWizardOptions from '../types/CommitWizardOptions.js';

function userConfig({ maxLineLength }: CommitWizardOptions): UserConfig {
  return {
    extends: ['@commitlint/config-conventional'],
    parserPreset: {
      parserOpts: {
        headerPattern: /^(?<type>\w+)(?<exclamation1>!?)(?:\((?<scope>[^)]+)\)(?<exclamation2>!?))?: (?<subject>.+)$/,
        headerCorrespondence: ['type', 'exclamation1', 'scope', 'exclamation2', 'subject'],
      },
    },
    rules: {
      'header-max-length': [2, 'always', maxLineLength] as [number, 'always' | 'never', number],
    },
  };
}

export default userConfig;
