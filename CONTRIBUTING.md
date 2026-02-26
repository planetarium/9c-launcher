# The Guide for Nine Chronicles Launcher Contributors
Translations: [한국어](./CONTRIBUTING.ko.md).

## Prerequisites
* Node.js (v16)
* Yarn
* .NET Core SDK (v3.1+)
  * Not required if you don't wish to build the headless


## Setting things up

As this project uses Git submodules quite heavily, we recommend to use `--recursive` flag when cloning.

```sh
git clone --recursive <URL>
```

> If you prefer to do this on GitHub CLI, you can clone the repository by: `gh repo clone <repository> -- --recursive`


After cloning, you can install the required dependencies by running these commands:

```sh
yarn # installs npm dependencies
yarn build-headless # builds the headless
yarn codegen # generates the GraphQL glue code
```

If you're looking to submit patches to the project, we recommend to install Git hooks which check for our requirements:

```sh
yarn lefthook install
```

## Running the Launcher

To run the launcher, you should have the latest configuration file (`config.json`) in the `build` directory. You can download it here: https://release.nine-chronicles.com/9c-launcher-config.json.

This step can be done automatically by using this command too: `yarn download-config`.

After doing so, you can run the launcher by running:

```sh
yarn dev
```

## Making your changes

For contributing, we expect you to make a branch from the `development` branch, where most of our development happens. You should be on this branch when you cloned the repository; if not, please switch to `development`.

The branch name can be whatever you want (we don't have specific rules for them), but we recommend using one of these prefixes that match your changes: `fix/`, `chore/`, `feat/`.

After making changes in your branch, please push them into your fork and submit a PR with a description explaining the changes. The link to relevant issues would be helpful as well.
