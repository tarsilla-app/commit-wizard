import { execSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';

//@ts-ignore
import { analyzeCommits as commitAnalyzerAnalyzeCommits } from '@semantic-release/commit-analyzer';
import {
  prepare as gitPrepare,
  verifyConditions as gitVerifyConditions,
  //@ts-ignore
} from '@semantic-release/git';
import {
  addChannel as gitHubAddChanel,
  fail as gitHubFail,
  publish as gitHubPublish,
  success as gitHubSuccess,
  verifyConditions as gitHubVerifyConditions,
  //@ts-ignore
} from '@semantic-release/github';
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

const tarballFile = 'nextTag-stable.tar.gz';

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

function getFormulaFile(pluginConfig: PluginConfig, context: PrepareContext): string {
  const { options } = context;
  const repositoryUrl = options.repositoryUrl!;
  const url = new URL(repositoryUrl);
  const repositoryPath = url.pathname;
  const repository = repositoryPath.startsWith('/') ? repositoryPath.slice(1) : repositoryPath;
  const project = repository.split('/').pop();

  return pluginConfig.tap ?? `${project}.rb`;
}

function generateTarball(_pluginConfig: PluginConfig, context: PrepareContext) {
  const { nextRelease } = context;

  const nextTag = `v${nextRelease.version}`;
  const tarFilePath = tarballFile.replace('nextTag', nextTag);

  execSync(`git archive --format=tar.gz --output=${tarFilePath} HEAD`);
}

function calculateSha256(_pluginConfig: PluginConfig, context: PrepareContext) {
  const { nextRelease } = context;

  const nextTag = `v${nextRelease.version}`;
  const tarFilePath = tarballFile.replace('nextTag', nextTag);

  const fileBuffer = fs.readFileSync(tarFilePath);
  const hash = crypto.createHash('sha256');
  hash.update(fileBuffer);

  return hash.digest('hex');
}

async function updateFormulaFile(pluginConfig: PluginConfig, context: PrepareContext): Promise<void> {
  const { nextRelease, options } = context;

  const nextTag = `v${nextRelease.version}`;

  const repositoryUrl = options.repositoryUrl!;
  const url = new URL(repositoryUrl);
  const repositoryPath = url.pathname;
  const repository = repositoryPath.startsWith('/') ? repositoryPath.slice(1) : repositoryPath;
  const tarFilePath = tarballFile.replace('nextTag', nextTag);

  const tarUrl = `https://github.com/${repository}/releases/download/${nextTag}/${tarFilePath}`;
  //const tarUrl = `https://codeload.github.com/${repository}/tar.gz/refs/tags/${tarFilePath}`;

  const sha256 = calculateSha256(pluginConfig, context);
  const formulaFile = getFormulaFile(pluginConfig, context);

  let formulaContent = fs.readFileSync(formulaFile, 'utf8');
  formulaContent = formulaContent.replace(/url ".*"/, `url "${tarUrl}"`);
  formulaContent = formulaContent.replace(/sha256 ".*"/, `sha256 "${sha256}"`);
  fs.writeFileSync(formulaFile, formulaContent);
}

async function addChannel(pluginConfig: PluginConfig, context: AddChannelContext): Promise<void> {
  if (!verified) {
    await verifyConditions(pluginConfig, context);
    verified = true;
  }

  if (gitHubAddChanel) {
    await gitHubAddChanel(pluginConfig, context);
  }
}

async function analyzeCommits(pluginConfig: PluginConfig, context: AnalyzeCommitsContext): Promise<string | false> {
  if (!verified) {
    await verifyConditions(pluginConfig, context);
    verified = true;
  }

  return commitAnalyzerAnalyzeCommits(analyzerConfig, context);
}

async function fail(pluginConfig: PluginConfig, context: FailContext): Promise<void> {
  if (gitHubFail) {
    await gitPrepare(pluginConfig, context);
  }
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
    const { nextRelease } = context;
    if (!nextRelease?.version) {
      throw new Error('Next release version is not available.');
    }

    const formulaFile = getFormulaFile(pluginConfig, context);

    generateTarball(pluginConfig, context);

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

async function publish(pluginConfig: PluginConfig, context: PublishContext): Promise<unknown> {
  if (!verified) {
    await verifyConditions(pluginConfig, context);
    verified = true;
  }

  if (gitHubPublish) {
    const { nextRelease } = context;
    const nextTag = `v${nextRelease.version}`;
    const tarFilePath = tarballFile.replace('nextTag', nextTag);

    const customPluginConfig = {
      ...pluginConfig,
      assets: [
        {
          path: tarFilePath,
          label: `Homebrew Tarball (${nextTag})`,
        },
      ],
    };
    await gitHubPublish(customPluginConfig, context);
  }
  //await updateFormulaFile(pluginConfig, context);

  //await commitFormulaFile(pluginConfig, context);

  return null;
}

async function success(pluginConfig: PluginConfig, context: SuccessContext): Promise<void> {
  if (!verified) {
    await verifyConditions(pluginConfig, context);
    verified = true;
  }

  if (gitHubSuccess) {
    await gitHubSuccess(pluginConfig, context);
  }
}

async function verifyConditions(pluginConfig: PluginConfig, context: VerifyConditionsContext): Promise<void> {
  if (gitHubVerifyConditions) {
    await gitHubVerifyConditions(pluginConfig, context);
  }
  if (gitVerifyConditions) {
    await gitVerifyConditions(pluginConfig, context);
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
