import { Commitizen, Prompter, Question } from 'commitizen';

import CommitWizardOptions from '../types/CommitWizardOptions.js';

export type CommitAnswers = {
  type: string;
  scope: string;
  subject: string;
  confirmCommit: string;
};

function getCommitMessage({ answers }: { answers: CommitAnswers }) {
  const scopeText = answers.scope ? `(${answers.scope})` : '';
  if (answers.type === 'break') {
    const message = `feat${scopeText}!: ${answers.subject}`;
    return message;
  }
  const message = `${answers.type}${scopeText}: ${answers.subject}`;
  return message;
}

function getMaxSubject({ answers, maxLineLength }: { answers: CommitAnswers; maxLineLength: number }) {
  const scopeText = answers.scope ? `(${answers.scope})` : '';
  // +2 accounts for ": " after type and scope.
  const prefixLength = (answers.type ? answers.type.length : 0) + scopeText.length + 2;
  const maxSubject = maxLineLength - prefixLength;
  return maxSubject;
}

function prompter({ maxLineLength }: CommitWizardOptions): Prompter {
  return {
    prompter: function (cz: Commitizen, commit: (message: string) => void) {
      const questions: Question<CommitAnswers> = [
        {
          type: 'list',
          name: 'type',
          message: "Select the type of change that you're committing:",
          choices: [
            { value: 'feat', name: '🚀 feat:     A new feature' },
            { value: 'fix', name: '🐛 fix:      A bug fix' },
            { value: 'docs', name: '📚 docs:     Documentation only changes' },
            {
              value: 'style',
              name: '🎨 style:    Changes that do not affect the meaning of the code (white-space, formatting, etc)',
            },
            { value: 'refactor', name: '🔨 refactor: A code change that neither fixes a bug nor adds a feature' },
            { value: 'perf', name: '⚡️ perf:     A code change that improves performance' },
            { value: 'test', name: '🔍 test:     Adding missing tests or correcting existing tests' },
            { value: 'build', name: '📦 build:    Changes that affect the build system or external dependencies' },
            { value: 'ci', name: '🤖 ci:       Changes to our CI configuration files and scripts' },
            { value: 'chore', name: "🧹 chore:    Other changes that don't modify src or test files" },
            { value: 'break', name: '💥 break:    A change that breaks existing functionality' },
            { value: 'revert', name: '⏪ revert:   Reverts a previous commit' },
          ],
        },
        {
          type: 'input',
          name: 'scope',
          message: 'What is the scope of this change (e.g. component or file name): (press enter to skip)',
        },
        {
          type: 'input',
          name: 'subject',
          message: (answers) => {
            const maxSubject = getMaxSubject({ answers, maxLineLength });
            return `Write a short, imperative tense description of the change (max ${maxSubject} chars):`;
          },
          validate: (input, answers) => {
            if (!input.trim()) {
              // \u001b[31m is red
              return `\u001b[31mSubject is required\u001b[39m`;
            }
            const maxSubject = getMaxSubject({ answers: answers!, maxLineLength });
            if (input.length <= maxSubject) {
              return true;
            }
            // \u001b[31m is red
            return `\u001b[31mSubject length must be less than or equal to ${maxSubject} characters. Current length is ${input.length} characters.\u001b[39m`;
          },
          transformer: (input, answers) => {
            const maxSubject = getMaxSubject({ answers, maxLineLength });
            const remaining = maxSubject - input.length;
            if (remaining < 0) {
              // Red if remaining < 0: \u001b[31m is red, \u001b[39m resets the color.
              return `\n\u001b[31m(${input.length}) ${input}\u001b[39m`;
            }
            // Green if valid: \u001b[32m is green, \u001b[39m resets the color.
            return `\n\u001b[32m(${input.length}) ${input}\u001b[39m`;
          },
        },
        {
          type: 'list',
          name: 'confirmCommit',
          choices: [
            { value: 'yes', name: 'Yes' },
            { value: 'no', name: 'Abort commit' },
          ],
          default: 0,
          message(answers) {
            const SEP = '--------------------------------------------------------';
            const message = getCommitMessage({ answers });
            console.info(`\n${SEP}\n\n${message}\n\n${SEP}\n`);
            return 'Are you sure you want to proceed with the commit above?';
          },
        },
      ];

      cz.prompt(questions).then((answers) => {
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
