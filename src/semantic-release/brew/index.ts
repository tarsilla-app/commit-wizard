import { execSync } from 'child_process';
import fs from 'fs';

//@ts-ignore
import { analyzeCommits as commitAnalyzerAnalyzeCommits } from '@semantic-release/commit-analyzer';
import {
  prepare as gitPrepare,
  verifyConditions as gitVerifyConditions,
  //@ts-ignore
} from '@semantic-release/git';
//@ts-ignore
import { generateNotes as notesGeneratorGenerateNotes } from '@semantic-release/release-notes-generator';
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

import { SemanticReleasePlugin } from '../types.js';

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

type PluginConfig = { tap?: string };

let verified = false;

function getFormulaFile(pluginConfig: PluginConfig, repositoryUrl: string): string {
  const url = new URL(repositoryUrl);
  const repositoryPath = url.pathname;
  const repository = repositoryPath.startsWith('/') ? repositoryPath.slice(1) : repositoryPath;
  const project = repository.split('/').pop();

  return pluginConfig.tap ?? `${project}.rb`;
}

async function updateFormulaFile(pluginConfig: PluginConfig, context: PrepareContext): Promise<void> {
  const { nextRelease, logger, options } = context;

  if (!nextRelease?.version) {
    throw new Error('Next release version is not available.');
  }

  const version = nextRelease.version;

  const repositoryUrl = options.repositoryUrl!; // Guaranteed to be defined by semantic-release

  const tarUrl = `${repositoryUrl}/archive/refs/tags/v${version}.tar.gz`;
  const sha256 = execSync(`curl -L ${tarUrl} | sha256sum | awk '{print $1}'`).toString().trim();
  const formulaFile = getFormulaFile(pluginConfig, repositoryUrl);

  let formulaContent = fs.readFileSync(formulaFile, 'utf8');
  formulaContent = formulaContent.replace(/url ".*"/, `url "${tarUrl}"`);
  formulaContent = formulaContent.replace(/sha256 ".*"/, `sha256 "${sha256}"`);
  fs.writeFileSync(formulaFile, formulaContent);

  logger.log(`Updated formula with version ${version}, URL ${tarUrl}, and SHA256 ${sha256}`);
}

async function addChannel(_pluginConfig: PluginConfig, _context: AddChannelContext): Promise<void> {
  //do nothing
}

async function analyzeCommits(pluginConfig: PluginConfig, context: AnalyzeCommitsContext): Promise<string | false> {
  if (!verified) {
    await verifyConditions(pluginConfig, context);
    verified = true;
  }

  return commitAnalyzerAnalyzeCommits(analyzerConfig, context);
}

async function fail(_pluginConfig: PluginConfig, _context: FailContext): Promise<void> {
  //do nothing
}

async function generateNotes(pluginConfig: PluginConfig, context: GenerateNotesContext): Promise<string> {
  if (!verified) {
    await verifyConditions(pluginConfig, context);
    verified = true;
  }

  return notesGeneratorGenerateNotes({}, context);
}

async function prepare(pluginConfig: PluginConfig, context: PrepareContext): Promise<void> {
  if (!verified) {
    await verifyConditions(pluginConfig, context);
    verified = true;
  }

  if (gitPrepare) {
    const { options } = context;
    const repositoryUrl = options.repositoryUrl!; // Guaranteed to be defined by semantic-release
    const formulaFile = getFormulaFile(pluginConfig, repositoryUrl);

    await updateFormulaFile(pluginConfig, context);

    await gitPrepare(
      {
        assets: [formulaFile],
        message: 'chore(release): ${nextRelease.version}',
      },
      context,
    );
  }
}

async function publish(_pluginConfig: PluginConfig, _context: PublishContext): Promise<unknown> {
  //do nothing
  return null;
}

async function success(_pluginConfig: PluginConfig, _context: SuccessContext): Promise<void> {
  //do nothing
}

async function verifyConditions(pluginConfig: PluginConfig, context: VerifyConditionsContext): Promise<void> {
  if (gitVerifyConditions) {
    const { options } = context;
    const repositoryUrl = options.repositoryUrl!; // Guaranteed to be defined by semantic-release
    const formulaFile = getFormulaFile(pluginConfig, repositoryUrl);
    await gitVerifyConditions(
      {
        assets: [formulaFile],
        message: 'chore(release): ${nextRelease.version}',
      },
      context,
    );
  }
  verified = true;
}

const plugin: SemanticReleasePlugin<{ tap: string }> = {
  addChannel,
  verifyConditions,
  analyzeCommits,
  generateNotes,
  prepare,
  publish,
  success,
  fail,
};

export default plugin;
