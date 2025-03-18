module.exports = {
  branches: ['main'],
  repositoryUrl: 'https://github.com/tarsilla-app/commit-wizard',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        parserOpts: {
          headerPattern: /^(?<type>\w+)(?<exclamation1>!?)(?:\((?<scope>[^)]+)\)(?<exclamation2>!?))?: (?<subject>.+)$/,
          headerCorrespondence: ['type', 'exclamation1', 'scope', 'exclamation2', 'subject'],
        },
        // Use a boolean for "breaking". If a commit includes "!" then breaking is truthy.
        releaseRules: [
          { type: 'feat', exclamation1: '!', release: 'major' },
          { type: 'feat', exclamation2: '!', release: 'major' },
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
        ],
      },
    ],
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/npm',
      {
        tag: 'latest',
        npmPublish: true,
        optional: false,
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
};
