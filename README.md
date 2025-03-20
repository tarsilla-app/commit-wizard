# @tarsilla/commit-wizard

A custom configuration library for [commitizen](https://github.com/commitizen/cz-cli), [commitlint](https://github.com/conventional-changelog/commitlint), and [semantic-release](https://github.com/semantic-release/semantic-release).

## Features

**@tarsilla/commit-wizard** provides a unified solution to enforce standardized commit messages and automate releases. It bundles tailored configurations for:
- **Commitizen** – interactive commit prompt
- **Commitlint** – commit message linting
- **Semantic-release** – automated release management

## Installation

Install the package as a dev dependency:

```sh
npm install --save-dev @tarsilla/commit-wizard
```

or

```sh
yarn add --dev @tarsilla/commit-wizard
```

## Usage

### Commitizen

Create a `.czrc` file in your project root with the following content:

```json
{
  "path": "@tarsilla/commit-wizard/commitizen"
}
```

When you run `npx git-cz`, Commitizen will present you with an interactive prompt to format your commit messages.

### Commitlint

Create a `commitlint.config.mjs` file in your project root with the following content:

```js
export default {
  extends: ['@tarsilla/commit-wizard/commitlint'],
};
```

Commitlint enforces commit message conventions by using the conventional commits preset.
It is recommended to run commitlint during your commit process, ex. using husky (e.g. see [.husky/commit-msg](src/commitlint/commit-msg)).

### Semantic-release

Create a `.releaserc.cjs` file in your project root with the following content:

```js
module.exports = {
  branches: ['main'],
  repositoryUrl: 'path to your git repository',
  plugins: ['@tarsilla/commit-wizard/semantic-release'],
};
```

The semantic-release configuration automates version management and changelog generation. 
It is recommended to configure CI/CD to run semantic-release, ex. using github actions (e.g. see [.github/workflows/npm-publish.yml](src/semantic-release/npm-publish.yml)).

## Customization

You can override default settings by creating a `commit-wizard.config.json` file in your project root.
The plugin accepts an object of type `CommitWizardOptions`:

| Option   | Type   | Description                                                  | Default     |
|----------|--------|--------------------------------------------------------------|-------------|
| maxLineLength | number | The maximum length of the commit message. If not provided, the plugin will run with the default settings. | 120 |


Example `commit-wizard.config.json`:
```json
{
  "maxLineLength": 100
}
```

## Contributing

Contributions are welcome! Please ensure your pull request adheres to the project's linting and testing guidelines.

## License

Released under the [MIT License](LICENSE).