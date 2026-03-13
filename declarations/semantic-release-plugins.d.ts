declare module '@semantic-release/commit-analyzer' {
  import type { AnalyzeCommitsContext } from 'semantic-release';

  export function analyzeCommits(pluginConfig: unknown, context: AnalyzeCommitsContext): Promise<string | false>;
}

declare module '@semantic-release/git' {
  import type { PrepareContext, VerifyConditionsContext } from 'semantic-release';

  export function prepare(pluginConfig: unknown, context: PrepareContext): Promise<void>;
  export function verifyConditions(pluginConfig: unknown, context: VerifyConditionsContext): Promise<void>;
}

declare module '@semantic-release/npm' {
  import type { AddChannelContext, PrepareContext, PublishContext, VerifyConditionsContext } from 'semantic-release';

  export function addChannel(pluginConfig: unknown, context: AddChannelContext): Promise<void>;
  export function prepare(pluginConfig: unknown, context: PrepareContext): Promise<void>;
  export function publish(pluginConfig: unknown, context: PublishContext): Promise<unknown>;
  export function verifyConditions(pluginConfig: unknown, context: VerifyConditionsContext): Promise<void>;
}

declare module '@semantic-release/release-notes-generator' {
  import type { GenerateNotesContext } from 'semantic-release';

  export function generateNotes(pluginConfig: unknown, context: GenerateNotesContext): Promise<string>;
}

declare module '@semantic-release/github' {
  import type {
    AddChannelContext,
    FailContext,
    PublishContext,
    SuccessContext,
    VerifyConditionsContext,
  } from 'semantic-release';

  export function addChannel(pluginConfig: unknown, context: AddChannelContext): Promise<void>;
  export function fail(pluginConfig: unknown, context: FailContext): Promise<void>;
  export function publish(pluginConfig: unknown, context: PublishContext): Promise<unknown>;
  export function success(pluginConfig: unknown, context: SuccessContext): Promise<void>;
  export function verifyConditions(pluginConfig: unknown, context: VerifyConditionsContext): Promise<void>;
}
