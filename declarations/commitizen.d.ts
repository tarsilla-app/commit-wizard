declare module 'commitizen' {
  import * as inquirer from 'inquirer';

  type ConfigLoader = {
    load: (config?, cwd?) => { maxLineLength: number };
  };

  type PromptModule = <T>(questions: inquirer.Question<T>[], answers?: Partial<T>) => Promise<T>;
  export const configLoader: ConfigLoader;

  export type Commitizen = {
    prompt: PromptModule;
  };

  export type Prompter = {
    prompter: (cz: Commitizen, commit: (message: string) => void) => void;
  };
}
