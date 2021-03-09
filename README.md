# Nine Chronicles Launcher


### 주의
* Nodejs v14.16.0 (node-sass 때문)
* Module not found (spawn-sync, utf-8-validate, bufferutil)의 경고를 뜨고 싶지 않으면 `npm i spawn-sync utf-8-validate bufferutil`, [해당 이슈](https://github.com/planetarium/9c-launcher/issues/565)
* 만약 갑자기 프로그램이 꺼진다면 백그라운드 프로세소에서 `Nine Chronicles`를 강제 종료하고 다시 하면 된다

## Overview

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
npm install
```

In addition, there are two binaries required:

- 9C Headless (Standalone): can be built with `npm run build-headless`
  (.NET Core SDK required)
- 9C Unity Player (_9c.exe_/_9c.app_): can be downloaded with `npm run bundle-player`
  - `npm run bundle-player` downloads the CI-built binary from the NineChronicles repository based on the `NineChronicles` git submodule commit hash.
  - Download may fail if the CI-build hasn't been completed. In this case, you can directly build to `dist` as the output directory with Unity Editor.

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

```javascript
npm run dev
```

## Development

The basic frontend has `webpack-hot-reload`, which automatically reflects code changes.
Developing the renderer process does not require electron relaunch. However, when there's a change in the main process, electron relaunch is required.

### mobx-devtools

mobx-devtools can be used in this project. First, install a standalone mobx-devtools.

```sh
npm install -g mobx-devtools
```

After, run mobx-devtools.

```sh
mobx-devtools
```

Run `npm run server` & `npm run start`. The global state will appear on mobx-devtools.

## Build

```bash
npm install
npm run build  # development build
npm run build-headless  # 9C Headless (Standalone) build (.NET Core SDK required)
npm run bundle-player  # 9C Unity Player download
APV_SIGN_KEY=... APV_NO=... npm run sign-apv  # APV sign (planet command required)
npm run build-prod  # production build
```

## Packaging

```bash
# generate/sign a new APV with the given private key and pack
APV_SIGN_KEY=... npm run pack-all
# generate/sign a specific APV with the given private key and pack
APV_SIGN_KEY=... APV_NO=1234 npm run pack-all
# pack with the given APV
APV=... npm run pack-all
# pack without APV (for reusing the APV of the latest release)
npm run pack-all
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
npm run pack-all:electron-builder
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
