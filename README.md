# Nine Chronicles Launcher

## 개요

Nine Chronicles를 구동하기 위한 일렉트론 기반의 멀티플랫폼 런처입니다.
기본적인 골격은 다음과 같습니다:

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

## 실행 방법

먼저, 개발에 필요한 의존성부터 모두 설치합니다.

```bash
npm install
```

추가로, 두 개의 별도 바이너리가 필요합니다.

- 9C Headless (Standalone): `npm run build-headless`로 빌드 가능
  (.NET Core SDK 필요)
- 9C Unity Player (_9c.exe_/_9c.app_): `npm run bundle-player`로 다운로드 가능

또는 두 개의 바이너리를 해당 디렉터리와 같게 배치해 주십시오.

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

그 뒤 하기의 명령어를 입력합니다.

```javascript
npm run dev
```

## 개발 방법

기본적으로 프론트엔드는 `webpack-hot-reload` 가 있어, 변경하는 즉시 반영됩니다.
렌더러 프로세스에서 작업할 때는 일렉트론 재시작이 필요가 없으며, 메인 프로세스에 변경점이 생기면 그때 일렉트론 종료 후 재실행 해 주십시오.

### mobx-devtools

mobx-devtools를 사용할 수 있습니다. 먼저, 스탠드얼론 mobx-devtools를 설치해 주십시오

```sh
npm install -g mobx-devtools
```

그 다음, mobx-devtools를 실행해 주십시오

```sh
mobx-devtools
```

이제 `npm run server` 와 `npm run start`를 하시면 mobx-devtools에 전역 상태가 나타나는 것을 볼 수 있습니다.

## 빌드 방법

```bash
npm install
npm run build  # 개발 빌드
npm run build-headless  # 9C Headless (Standalone) 빌드 (.NET Core SDK 필요)
npm run bundle-player  # 9C Unity Player 받기
APV_SIGN_KEY=... APV_NO=... npm run sign-apv  # APV 서명 (planet 명령 필요)
npm run build-prod  # 프로덕션 빌드
```

## 패키징 방법

```bash
# 주어진 비밀키로 새 버전 APV를 생성/서명 후 적용
APV_SIGN_KEY=... npm run pack-all
# 주어진 비밀키로 지정된 버전의 APV를 생성/서명 후 적용
APV_SIGN_KEY=... APV_NO=1234 npm run pack-all
# 주어진 APV를 그대로 적용
APV=... npm run pack-all
# APV 미적용 (가장 마지막에 릴리스된 패키지에 적용된 APV 재사용)
npm run pack-all
```

다음 환경 변수를 요구합니다. `APV`와 `APV_SIGN_KEY` 양 쪽 모두 누락됐을 경우
APV(앱 프로토콜 버전) 서명을 안 합니다.

- `APV`: APV 토큰
  ([`Libplanet.Net.AppProtocolVersion.Token`][appprotocolversion.token]).
  이게 주어지면 아래 세 환경 변수는 무시되고, 이 빌드 및 패키징된 앱은 이 `APV`를
  쓰도록 설정됩니다.
- `APV_SIGN_KEY`: APV 서명에 쓸 비밀키의 16진수 문자열.
  프로덕션 빌드를 위한 서명용 비밀키는 1Password에 있으니 동료에게 문의하세요.
- `APV_NO`: APV 숫자
  ([`Libplanet.Net.AppProtocolVersion.Version`][appprotocolversion.version]).
  생략시 [download.nine-chronicles.com](https://download.nine-chronicles.com/)의
  최신 버전에 1을 더한 값을 자동으로 사용합니다.

[appprotocolversion.token]: https://docs.libplanet.io/master/api/Libplanet.Net.AppProtocolVersion.html#Libplanet_Net_AppProtocolVersion_Token
[appprotocolversion.version]: https://docs.libplanet.io/master/api/Libplanet.Net.AppProtocolVersion.html#Libplanet_Net_AppProtocolVersion_Version

### 패키지에서 config.json 내용만 갈아끼우기

패키징된 _Windows.zip_ 또는 _macOS.tar.gz_ 파일에서 _config.json_ 설정 내용만 갈아끼울 때
_scripts/extract-config.sh_ 및 _scripts/replace-config.sh_ 스크립트를 활용하면 편합니다.

```bash
# 패키지에서 config.json 내용만 추출 (Windows.zip 대신 macOS.tar.gz도 가능)
scripts/extract-config.sh path/Windows.zip > config.json
# 패키지 내 config.json 내용을 교체 (Windows.zip 대신 macOS.tar.gz도 가능)
scripts/replace-config.sh path/Windows.zip < config.json
```

### electron-builder로 패키징하기

```bash
# Windows (nsis)
# macOS (dmg, zip)
npm run pack-all:electron-builder
```

😢현재 macOS에서는 아이콘 크기 문제로 빌드가 되지 않습니다.

> image /Users/moreal/github/planetarium/electron-launcher/app.ico must be at least 512x512

`icon: "app.ico"` 부분을 주석처리 하면 빌드 및 패키징 해볼 수 있습니다.

## 로깅 위치

로그는 다음 위치에 쌓입니다.

```
- on macOS: ~/Library/Logs/{app name}/{process type}.log
- on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs{process type}.log
```

## 코드 스타일 맞추기

```bash
npx pretty-quick --staged
```

### Visual Studio Code 확장

확장 화면(Windows: <kbd>⇧⌃X</kbd>, macOS: <kbd>⇧⌘X</kbd>)에서 다음 확장들을 설치합니다.

- [EditorConfig]
- [ESlint]
- [Prettier]

[editorconfig]: https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig
[eslint]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
[prettier]: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
