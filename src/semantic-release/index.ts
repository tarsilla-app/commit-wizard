//@ts-ignore
import { analyzeCommits } from '@semantic-release/commit-analyzer';
import {
  prepare as gitPrepare,
  verifyConditions as gitVerifyConditions,
  //@ts-ignore
} from '@semantic-release/git';
import {
  addChannel as npmAddChannel,
  prepare as npmPrepare,
  publish as npmPublish,
  verifyConditions as npmVerifyConditions,
  //@ts-ignore
} from '@semantic-release/npm';
//@ts-ignore
import { generateNotes } from '@semantic-release/release-notes-generator';
import {
  AddChannelContext,
  AnalyzeCommitsContext,
  FailContext,
  GenerateNotesContext,
  PrepareContext,
  PublishContext,
  SuccessContext,
  VerifyConditionsContext,
} from 'semantic-release';

// This interface describes the hooks exposed by a semantic-release plugin.
export type SemanticReleasePlugin = {
  addChannel?(pluginConfig: unknown, context: AddChannelContext): Promise<void>;
  analyzeCommits?(pluginConfig: unknown, context: AnalyzeCommitsContext): Promise<string | false>;
  fail?(pluginConfig: unknown, context: FailContext): Promise<void>;
  generateNotes?(pluginConfig: unknown, context: GenerateNotesContext): Promise<string>;
  prepare?(pluginConfig: unknown, context: PrepareContext): Promise<void>;
  publish?(pluginConfig: unknown, context: PublishContext): Promise<unknown>;
  success?(pluginConfig: unknown, context: SuccessContext): Promise<void>;
  verifyConditions?(pluginConfig: unknown, context: VerifyConditionsContext): Promise<void>;
};

const analyzerConfig = {
  preset: 'conventionalcommits',
  parserOpts: {
    headerPattern: /^(?<type>\w+)(?<exclamation1>!?)(?:\((?<scope>[^)]+)\)(?<exclamation2>!?))?: (?<subject>.+)$/,
    headerCorrespondence: ['type', 'exclamation1', 'scope', 'exclamation2', 'subject'],
  },
  releaseRules: [
    { type: 'feat', exclamation1: '!', release: 'major' },
    { type: 'feat', exclamation2: '!', release: 'major' },
    { type: 'feat', release: 'minor' },
    { type: 'fix', release: 'patch' },
    { type: 'docs', release: 'patch' },
    { type: 'style', release: 'patch' },
    { type: 'refactor', release: 'patch' },
    { type: 'perf', release: 'patch' },
    { type: 'test', release: 'patch' },
    { type: 'build', release: 'patch' },
    { type: 'ci', release: 'patch' },
    { type: 'chore', release: 'patch' },
    { type: 'revert', release: 'patch' },
  ],
};

const npmConfig = {
  tag: 'latest',
  npmPublish: true,
  optional: false,
};

const gitConfig = {
  assets: ['package.json', 'package-lock.json'],
  message: 'chore(release): ${nextRelease.version}',
};

const plugin: SemanticReleasePlugin = {
  addChannel: async (_pluginConfig, context) => {
    if (npmAddChannel) {
      await npmAddChannel(npmConfig, context);
    }
  },
  verifyConditions: async (_pluginConfig, context) => {
    if (npmVerifyConditions) {
      await npmVerifyConditions(npmConfig, context);
    }
    if (gitVerifyConditions) {
      await gitVerifyConditions(gitConfig, context);
    }
  },

  analyzeCommits: async (_pluginConfig, context) => {
    return analyzeCommits(analyzerConfig, context);
  },

  generateNotes: async (_pluginConfig, context) => {
    return generateNotes({}, context);
  },

  prepare: async (_pluginConfig, context) => {
    if (npmPrepare) {
      await npmPrepare(npmConfig, context);
    }
    if (gitPrepare) {
      await gitPrepare(gitConfig, context);
    }
  },

  publish: async (_pluginConfig, context) => {
    if (npmPublish) {
      await npmPublish(npmConfig, context);
    }
    /*if (gitPublish) {
      await gitPublish(gitConfig, context);
    }*/
  },

  success: async (_pluginConfig, _context) => {
    /*if (gitSuccess) {
      await gitSuccess(gitConfig, context);
    }*/
  },

  fail: async (_pluginConfig, _context) => {
    /*if (gitFail) {
      await gitFail(gitConfig, context);
    }*/
  },
};

export default plugin;
