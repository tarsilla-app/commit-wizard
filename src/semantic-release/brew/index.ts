import crypto from 'crypto';
import fs from 'fs';

import { Octokit } from '@octokit/rest';
//@ts-ignore
import { analyzeCommits as commitAnalyzerAnalyzeCommits } from '@semantic-release/commit-analyzer';
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

async function commitFormulaFile(pluginConfig: PluginConfig, context: PrepareContext): Promise<void> {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not set in the environment.');
  }

  const { nextRelease, logger, options } = context;

  const repositoryUrl = options.repositoryUrl!; // Guaranteed to be defined by semantic-release
  const [owner, repo] = new URL(repositoryUrl).pathname.slice(1).split('/');

  const formulaFile = getFormulaFile(pluginConfig, repositoryUrl);
  const branchName = options.branch ?? 'main';

  logger.log(`Committing updated formula file ${formulaFile} to branch ${branchName}...`);

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  try {
    // Get the latest commit SHA and tree SHA from the branch
    const { data: branch } = await octokit.repos.getBranch({
      owner,
      repo,
      branch: branchName,
    });

    const latestCommitSha = branch.commit.sha;
    const baseTreeSha = branch.commit.commit.tree.sha;

    logger.log(`Latest commit SHA: ${latestCommitSha}`);
    logger.log(`Base tree SHA: ${baseTreeSha}`);

    // Read the updated formula file content
    const formulaContent = fs.readFileSync(formulaFile, 'utf8');

    // Create a new blob for the updated formula file
    const { data: blob } = await octokit.git.createBlob({
      owner,
      repo,
      content: formulaContent,
      encoding: 'utf-8',
    });

    logger.log(`Created blob for ${formulaFile} with SHA: ${blob.sha}`);

    // Create a new tree with the updated formula file
    const { data: newTree } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: [
        {
          path: formulaFile,
          mode: '100644',
          type: 'blob',
          sha: blob.sha,
        },
      ],
    });

    logger.log(`Created new tree with SHA: ${newTree.sha}`);

    // Create a new commit with the updated tree
    const commitMessage = `chore(release): ${nextRelease.version}`;
    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: newTree.sha,
      parents: [latestCommitSha],
    });

    logger.log(`Created new commit with SHA: ${newCommit.sha}`);

    // Update the branch reference to point to the new commit
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branchName}`,
      sha: newCommit.sha,
    });

    logger.log(`Branch ${branchName} updated to commit ${newCommit.sha}`);
  } catch (error) {
    logger.error(`Failed to commit formula file: ${(error as Error).message}`);
    throw error;
  }
}

async function calculateSha256(url: string, context: PrepareContext): Promise<string> {
  const { logger } = context;

  logger.log(`Calculating SHA256 for URL: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch file. Status Code: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Response body is null.');
  }

  const hash = crypto.createHash('sha256');
  const reader = response.body.getReader();

  return new Promise((resolve, reject) => {
    function read() {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) {
            resolve(hash.digest('hex'));
            return;
          }
          if (value) {
            hash.update(value);
          }
          read();
        })
        .catch(reject);
    }
    read();
  });
}

async function updateFormulaFile(pluginConfig: PluginConfig, context: PrepareContext): Promise<void> {
  const { nextRelease, logger, options } = context;

  if (!nextRelease?.version) {
    throw new Error('Next release version is not available.');
  }

  const tagName = `v${nextRelease.version}`;

  const repositoryUrl = options.repositoryUrl!; // Guaranteed to be defined by semantic-release
  const url = new URL(repositoryUrl);
  const repositoryPath = url.pathname;
  const repository = repositoryPath.startsWith('/') ? repositoryPath.slice(1) : repositoryPath;

  const tarUrl = `https://codeload.github.com/${repository}/tar.gz/refs/tags/${tagName}`;
  const sha256 = await calculateSha256(tarUrl, context);
  const formulaFile = getFormulaFile(pluginConfig, repositoryUrl);

  let formulaContent = fs.readFileSync(formulaFile, 'utf8');
  formulaContent = formulaContent.replace(/url ".*"/, `url "${tarUrl}"`);
  formulaContent = formulaContent.replace(/sha256 ".*"/, `sha256 "${sha256}"`);
  fs.writeFileSync(formulaFile, formulaContent);

  logger.log(`Updated formula with version ${tagName}, URL ${tarUrl}, and SHA256 ${sha256}`);
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

async function prepare(_pluginConfig: PluginConfig, _context: PrepareContext): Promise<void> {
  //do nothing
}

async function publish(pluginConfig: PluginConfig, context: PublishContext): Promise<unknown> {
  if (!verified) {
    await verifyConditions(pluginConfig, context);
    verified = true;
  }

  await updateFormulaFile(pluginConfig, context);

  await commitFormulaFile(pluginConfig, context);

  return null;
}

async function success(_pluginConfig: PluginConfig, _context: SuccessContext): Promise<void> {
  //do nothing
}

async function verifyConditions(_pluginConfig: PluginConfig, _context: VerifyConditionsContext): Promise<void> {
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
