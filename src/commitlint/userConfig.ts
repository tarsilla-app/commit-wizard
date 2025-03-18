import { UserConfig } from '@commitlint/types';

import Config from '../types/Config.js';

function userConfig({ maxLineLength }: Config): UserConfig {
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
