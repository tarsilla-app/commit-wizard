module.exports = {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        parserOpts: {
          headerCorrespondence: ['type', 'exclamation1', 'scope', 'exclamation2', 'subject'],
          headerPattern: /^(?<type>\w+)(?<exclamation1>!?)(?:\((?<scope>[^)]+)\)(?<exclamation2>!?))?: (?<subject>.+)$/,
        },
        preset: 'conventionalcommits',
        releaseRules: [
          { exclamation1: '!', release: 'major', type: 'feat' },
          { exclamation2: '!', release: 'major', type: 'feat' },
          { release: 'minor', type: 'feat' },
          { release: 'patch', type: 'fix' },
          { release: 'patch', type: 'docs' },
          { release: 'patch', type: 'style' },
          { release: 'patch', type: 'refactor' },
          { release: 'patch', type: 'perf' },
          { release: 'patch', type: 'test' },
          { release: 'patch', type: 'build' },
          { release: 'patch', type: 'ci' },
          { release: 'patch', type: 'chore' },
          { release: 'patch', type: 'revert' },
        ],
      },
    ],
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        optional: false,
        tag: 'latest',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'package-lock.json'],
        message: 'chore(release): ${nextRelease.version}',
      },
    ],
  ],
  repositoryUrl: 'https://github.com/tarsilla-app/commit-wizard',
};
