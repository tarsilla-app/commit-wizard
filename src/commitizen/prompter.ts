import { Commitizen, Prompter } from 'commitizen';

import CommitWizardOptions from '../types/CommitWizardOptions.js';

export type CommitAnswers = {
  confirmCommit: string;
  scope: string;
  subject: string;
  type: string;
};

function getCommitMessage({ answers }: { answers: Partial<CommitAnswers> }) {
  const scopeText = answers.scope ? `(${answers.scope})` : '';
  if (answers.type === 'break') {
    const message = `feat${scopeText}!: ${answers.subject}`;
    return message;
  }
  const message = `${answers.type}${scopeText}: ${answers.subject}`;
  return message;
}

function getMaxSubject({ answers, maxLineLength }: { answers: Partial<CommitAnswers>; maxLineLength: number }) {
  const scopeText = answers.scope ? `(${answers.scope})` : '';
  // +2 accounts for ": " after type and scope.
  const prefixLength = (answers.type ? answers.type.length : 0) + scopeText.length + 2;
  const maxSubject = maxLineLength - prefixLength;
  return maxSubject;
}

function prompter({ maxLineLength }: CommitWizardOptions): Prompter {
  return {
    prompter: function (cz: Commitizen, commit: (message: string) => void) {
      const questions = [
        {
          choices: [
            { name: '🚀 feat:     A new feature', value: 'feat' },
            { name: '🐛 fix:      A bug fix', value: 'fix' },
            { name: '📚 docs:     Documentation only changes', value: 'docs' },
            {
              name: '🎨 style:    Changes that do not affect the meaning of the code (white-space, formatting, etc)',
              value: 'style',
            },
            { name: '🔨 refactor: A code change that neither fixes a bug nor adds a feature', value: 'refactor' },
            { name: '⚡️ perf:     A code change that improves performance', value: 'perf' },
            { name: '🔍 test:     Adding missing tests or correcting existing tests', value: 'test' },
            { name: '📦 build:    Changes that affect the build system or external dependencies', value: 'build' },
            { name: '🤖 ci:       Changes to our CI configuration files and scripts', value: 'ci' },
            { name: "🧹 chore:    Other changes that don't modify src or test files", value: 'chore' },
            { name: '💥 break:    A change that breaks existing functionality', value: 'break' },
            { name: '⏪ revert:   Reverts a previous commit', value: 'revert' },
          ],
          message: "Select the type of change that you're committing:",
          name: 'type',
          type: 'list',
        },
        {
          message: 'What is the scope of this change (e.g. component or file name): (press enter to skip)',
          name: 'scope',
          type: 'input',
        },
        {
          message: (answers: Partial<CommitAnswers>) => {
            const maxSubject = getMaxSubject({ answers, maxLineLength });
            return `Write a short, imperative tense description of the change (max ${maxSubject} chars):`;
          },
          name: 'subject',
          transformer: (input: string, answers: Partial<CommitAnswers>) => {
            const maxSubject = getMaxSubject({ answers, maxLineLength });
            const remaining = maxSubject - input.length;
            if (remaining < 0) {
              // Red if remaining < 0: \u001b[31m is red, \u001b[39m resets the color.
              return `\n\u001b[31m(${input.length}) ${input}\u001b[39m`;
            }
            // Green if valid: \u001b[32m is green, \u001b[39m resets the color.
            return `\n\u001b[32m(${input.length}) ${input}\u001b[39m`;
          },
          type: 'input',
          validate: (input: string, answers: Partial<CommitAnswers>) => {
            if (!input.trim()) {
              // \u001b[31m is red
              return `\u001b[31mSubject is required\u001b[39m`;
            }
            const maxSubject = getMaxSubject({ answers: answers, maxLineLength });
            if (input.length <= maxSubject) {
              return true;
            }
            // \u001b[31m is red
            return `\u001b[31mSubject length must be less than or equal to ${maxSubject} characters. Current length is ${input.length} characters.\u001b[39m`;
          },
        },
        {
          choices: [
            { name: 'Yes', value: 'yes' },
            { name: 'Abort commit', value: 'no' },
          ],
          default: 0,
          message(answers: Partial<CommitAnswers>) {
            const SEP = '--------------------------------------------------------';
            const message = getCommitMessage({ answers });
            console.info(`\n${SEP}\n\n${message}\n\n${SEP}\n`);
            return 'Are you sure you want to proceed with the commit above?';
          },
          name: 'confirmCommit',
          type: 'list',
        },
      ];

      void cz.prompt<Partial<CommitAnswers>>(questions).then((answers) => {
        if (answers.confirmCommit === 'no') {
          console.info('Commit aborted.');
        } else {
          const message = getCommitMessage({ answers });
          commit(message);
        }
      });
    },
  };
}

export default prompter;
