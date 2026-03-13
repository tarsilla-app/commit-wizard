declare module 'commitizen' {
  import * as inquirer from 'inquirer';

  interface ConfigLoader {
    load: (config?, cwd?) => { maxLineLength: number };
  }

  type PromptModule = <T>(questions: inquirer.Question<T>[], answers?: Partial<T>) => Promise<T>;
  export const configLoader: ConfigLoader;

  export interface Commitizen {
    prompt: PromptModule;
  }

  export interface Prompter {
    prompter: (cz: Commitizen, commit: (message: string) => void) => void;
  }
}
