export default {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerCorrespondence: ['type', 'exclamation1', 'scope', 'exclamation2', 'subject'],
      headerPattern: /^(?<type>\w+)(?<exclamation1>!?)(?:\((?<scope>[^)]+)\)(?<exclamation2>!?))?: (?<subject>.+)$/,
    },
  },
  rules: {
    'header-max-length': [2, 'always', 120],
  },
};
