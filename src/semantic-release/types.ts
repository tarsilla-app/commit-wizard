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

type SemanticReleasePlugin<T = unknown> = {
  addChannel?(pluginConfig: T, context: AddChannelContext): Promise<void>;
  analyzeCommits?(pluginConfig: T, context: AnalyzeCommitsContext): Promise<string | false>;
  fail?(pluginConfig: T, context: FailContext): Promise<void>;
  generateNotes?(pluginConfig: T, context: GenerateNotesContext): Promise<string>;
  prepare?(pluginConfig: T, context: PrepareContext): Promise<void>;
  publish?(pluginConfig: T, context: PublishContext): Promise<unknown>;
  success?(pluginConfig: T, context: SuccessContext): Promise<void>;
  verifyConditions?(pluginConfig: T, context: VerifyConditionsContext): Promise<void>;
};

export { type SemanticReleasePlugin };
