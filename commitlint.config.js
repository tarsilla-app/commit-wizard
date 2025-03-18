export default {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(?<type>\w+)(?<exclamation1>!?)(?:\((?<scope>[^)]+)\)(?<exclamation2>!?))?: (?<subject>.+)$/,
      headerCorrespondence: ['type', 'exclamation1', 'scope', 'exclamation2', 'subject'],
    },
  },
  rules: {
    'header-max-length': [2, 'always', 120],
  },
};
