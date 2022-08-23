# Nine Chronicles Launcher
[![Discord](https://img.shields.io/discord/539405872346955788?color=6278DA&label=Planetarium&logo=discord&logoColor=white)](https://discord.gg/JyujU8E4SD)
[![Planetarium-Dev Discord Invite](https://img.shields.io/discord/928926944937013338?color=6278DA&label=Planetarium-dev&logo=discord&logoColor=white)](https://discord.gg/RYJDyFRYY7)
## Overview

[WE HAVE WIKI WORKING IN PROGRESS!](https://github.com/planetarium/9c-launcher/wiki)

This is an electron based multi-platform launcher to run Nine Chronicles.
The basic structure is as follows:

```
./src
|   +-- resources
|   +-- styles
|   +-- views
|   |   +-- MainView.tsx
|   |   +-- LoginView.tsx
|   |   +-- LobbyView.tsx
|   +-- main-process.ts
|   +-- App.tsx
```

## Installation

First, install all dependencies required for development.

```bash
yarn
```

In addition, there are two binaries required.

- 9C Headless (Standalone): can be built with `yarn build-headless`
  (.NET Core SDK required)
- 9C Unity Player (_9c.exe_/_9c.app_): can be downloaded with `yarn bundle-player`
  - `yarn bundle-player` downloads the CI-built binary from the NineChronicles repository based on the `NineChronicles` git submodule commit hash.
  - Download may fail if the CI-build hasn't been completed. In this case, you can directly build to `dist` as the output directory with Unity Editor.

Before build 9C Headless and Unity Player, you should download these source from git submodule: `git submodule update --recursive`

Place the two binaries in the exact path as visualized below:

```
./src
./dist
|   +-- 9c.(exe|app) // 9C Unity Player
|   +-- publish // 9C Headless (Standalone)
|   |   +-- Libpalnet.dll
|   |   +-- Grpc.Core.dll
|   |   +-- ...
|   |   +-- NineChronicles.Standalone.Executable(.exe)
```

After, run the following command.

```sh
yarn codegen
yarn dev
```

위 명령은 내부적으로 알아서 _NineChronicles.Headless_ 서버도 함께 실행합니다.

별도로 띄워둔 _NineChronicles.Headless_ 서버에 붙이고 싶을 경우, `NC_RPC_SERVER_HOST`,
`NC_RPC_SERVER_PORT`, `NC_GRAPHQL_SERVER_HOST`, `NC_GRAPHQL_SERVER_PORT`
환경 변수를 활용할 수 있습니다. (넷 중 하나만 설정되어도 커스텀 RPC 서버 모드로 동작합니다.)

```sh
NC_RPC_SERVER_HOST=127.0.0.1 \
NC_RPC_SERVER_PORT=23142 \
NC_GRAPHQL_SERVER_HOST=127.0.0.1 \
NC_GRAPHQL_SERVER_PORT=23061 \
yarn dev
```

## Development

The basic frontend has `webpack-hot-reload`, which automatically reflects code changes.
Developing the renderer process does not require electron relaunch. However, when there's a change in the main process, electron relaunch is required.

### mobx-devtools

mobx-devtools can be used in this project. First, install a standalone mobx-devtools.

```sh
yarn global add mobx-devtools
```

After, run mobx-devtools.

```sh
mobx-devtools
```

Run `yarn server` & `yarn start`. The global state will appear on mobx-devtools.

## Build

```bash
git submodule update --recursive # Download 9C Headless and Unity Player build source

yarn
yarn build  # development build
yarn build-headless  # 9C Headless (Standalone) build (.NET Core SDK required)
yarn bundle-player  # 9C Unity Player download. if you not want to test game, you can skip this step.
APV_SIGN_KEY=... APV_NO=... yarn sign-apv  # APV sign (planet command required)
yarn build-prod  # production build
```

## Packaging

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

For replacing the configuration content of _config.json_ in the already packed _Windows.zip_ or _macOS.tar.gz_, it's convenient to use the _scripts/extract-config.sh_ and _scripts/replace-config.sh_ scripts.

```bash
# extract config.json content from package (supports Windows.zip and macOS.tar.gz)
scripts/extract-config.sh path/Windows.zip > config.json
# replace config.json content in package (supports Windows.zip and macOS.tar.gz)
scripts/replace-config.sh path/Windows.zip < config.json
```

### Packaging with electron-builder

```bash
# Windows (nsis)
# macOS (dmg, zip)
yarn pack-all:electron-builder
```

## Log Path

Logs are saved in the following paths:

```
- on macOS: ~/Library/Logs/{app name}/{process type}.log
- on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs{process type}.log
```

## Code Style Formatting

```bash
npx pretty-quick --staged
```

### Visual Studio Code Extensions

Install the following extensions in the Visual Studio Code extensions page(Windows: <kbd>⇧⌃X</kbd>, macOS: <kbd>⇧⌘X</kbd>):

- [EditorConfig]
- [ESlint]
- [Prettier]

[editorconfig]: https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig
[eslint]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
[prettier]: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
