declare module 'commitizen' {
  import * as inquirer from 'inquirer';

  type ConfigLoader = {
    load: (config?, cwd?) => { maxLineLength: number };
  };
  export const configLoader: ConfigLoader;

  export type Commitizen = {
    prompt: inquirer.PromptModule;
  };

  export type Question<T> = inquirer.QuestionCollection<T>;

  export type Prompter = {
    prompter: (cz: Commitizen, commit: (message: string) => void) => void;
  };
}
