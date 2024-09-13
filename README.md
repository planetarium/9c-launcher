<br>

<div align="center">

[<img src="./src/main/resources/logo.png" width="144"/>](https://nine-chronicles.com/)

  <h1 align="center">Nine Chronicles Launcher</h1>

  <p align="center">
    <strong>Game Launcher with embedded NCG Wallet</strong>
  </p>
  
[![Discord](https://img.shields.io/discord/539405872346955788?color=6278DA&label=Planetarium&logo=discord&logoColor=white)](https://discord.gg/JyujU8E4SD)
[![Planetarium-Dev Discord Invite](https://img.shields.io/discord/928926944937013338?color=6278DA&label=Planetarium-dev&logo=discord&logoColor=white)](https://discord.gg/RYJDyFRYY7)

</div>

## Overview

9c-launcher is a game launcher to run [Nine Chronicles](https://github.com/planetarium/NineChronicles), with embedded private key management & NCG wallet capabilities.
The launcher is written in Typescript, and uses GraphQL, Electron, React.

## Features
- Game execution and update, with multiple release channel support.
- Automatically selects optimized RPC server for user's network
- Private key creation, import from QR code or raw secp256k1 key, encrypt using [Web3 Secret Storage](https://ethereum.org/en/developers/docs/data-structures-and-encoding/web3-secret-storage/) specs.
- [NCG](https://gold.nine-chronicles.com/) wallet: Send NCG to other addresses or swap to WNCG.
- Supports Windows, macOS, Linux.

## Setup

First, install all dependencies required for development.

```bash
yarn
```

After, run the following command.

```bash
yarn codegen
yarn dev
```

## Development

The basic frontend has `webpack-hot-reload`, which automatically reflects code changes.
Developing the renderer process does not require electron relaunch. However, when there's a change in the main process, electron relaunch is required.

## Build

```bash
yarn
yarn codegen
yarn build  # development build
yarn build-prod  # production build
```

## Packaging
> **Note**
> This section hasn't been used in production and it's likely outdated.

```bash
# generate/sign a new APV with the given private key and pack
APV_SIGN_KEY=... yarn pack-all
# generate/sign a specific APV with the given private key and pack
APV_SIGN_KEY=... APV_NO=1234 yarn pack-all
# pack with the given APV
APV=... yarn pack-all
# pack without APV (for reusing the APV of the latest release)
yarn pack-all
```

Packaging requires the following environment variables. If both the `APV` and `APV_SIGN_KEY` are ommited,
APV(App Protocol Version) signing will not take place.

- `APV`: APV token
  ([`Libplanet.Net.AppProtocolVersion.Token`][appprotocolversion.token]).
  If an APV is provided, the other environment variables will be ignored and the build and packaged app will be configured to use that `APV`.
- `APV_SIGN_KEY`: Hexadecimal string of the private key used for APV signing
- `APV_NO`: APV number
  ([`Libplanet.Net.AppProtocolVersion.Version`][appprotocolversion.version]).
  When ommited, packaging will automatically use [download.nine-chronicles.com](https://download.nine-chronicles.com/)'s latest version number plus 1.

[appprotocolversion.token]: https://docs.libplanet.io/master/api/Libplanet.Net.AppProtocolVersion.html#Libplanet_Net_AppProtocolVersion_Token
[appprotocolversion.version]: https://docs.libplanet.io/master/api/Libplanet.Net.AppProtocolVersion.html#Libplanet_Net_AppProtocolVersion_Version

### Replacing config.json content after packaging
> **Note**
> This section hasn't been used in production and it's likely outdated.

For replacing the configuration content of _config.json_ in the already packed _Windows.zip_ or _macOS.tar.gz_, it's convenient to use the _scripts/extract-config.sh_ and _scripts/replace-config.sh_ scripts.

```bash
# extract config.json content from package (supports Windows.zip and macOS.tar.gz)
scripts/extract-config.sh path/Windows.zip > config.json
# replace config.json content in package (supports Windows.zip and macOS.tar.gz)
scripts/replace-config.sh path/Windows.zip < config.json
```

### Packaging with electron-builder
Note that building with electron-builder is experimental.

```bash
# Windows (nsis)
# macOS (dmg, zip)
yarn pack-all:electron-builder
```

## Log Path

Logs are saved in the following paths:

```
- on macOS: ~/Library/Logs/Nine Chronicles/{process type}.log
- on Windows: %USERPROFILE%\AppData\Roaming\Nine Chronicles\logs\{process type}.log
```

### Visual Studio Code Extensions

Install the following extensions in the Visual Studio Code extensions page(Windows: <kbd>⇧⌃X</kbd>, macOS: <kbd>⇧⌘X</kbd>):

- [EditorConfig]
- [ESlint]
- [Prettier]

[editorconfig]: https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig
[eslint]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
[prettier]: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
