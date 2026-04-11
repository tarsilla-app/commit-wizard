import { analyzeCommits } from '@semantic-release/commit-analyzer';
import { prepare as gitPrepare, verifyConditions as gitVerifyConditions } from '@semantic-release/git';
import {
  prepare as npmPrepare,
  publish as npmPublish,
  verifyConditions as npmVerifyConditions,
} from '@semantic-release/npm';
import { generateNotes } from '@semantic-release/release-notes-generator';

import { SemanticReleasePlugin } from '../types.js';

const analyzerConfig = {
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
};

const npmConfig = {
  npmPublish: true,
};

const gitConfig = {
  assets: ['package.json', 'package-lock.json'],
  message: 'chore(release): ${nextRelease.version}',
};

const plugin: SemanticReleasePlugin = {
  addChannel: async (_pluginConfig, _context) => {
    //await npmAddChannel(npmConfig, context);
  },
  analyzeCommits: async (_pluginConfig, context) => {
    return analyzeCommits(analyzerConfig, context);
  },

  fail: async (_pluginConfig, _context) => {
    //await gitFail(gitConfig, context);
  },

  generateNotes: async (_pluginConfig, context) => {
    return generateNotes({}, context);
  },

  prepare: async (_pluginConfig, context) => {
    await npmPrepare(npmConfig, context);
    await gitPrepare(gitConfig, context);
  },

  publish: async (_pluginConfig, context) => {
    await npmPublish(npmConfig, context);
    //await gitPublish(gitConfig, context);
  },

  success: async (_pluginConfig, _context) => {
    //await gitSuccess(gitConfig, context);
  },

  verifyConditions: async (_pluginConfig, context) => {
    await npmVerifyConditions(npmConfig, context);
    await gitVerifyConditions(gitConfig, context);
  },
};

export default plugin;
