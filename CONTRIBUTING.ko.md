# Nine Chronicles 런처 기여자를 위한 안내서


## 요구사항
* Node.js (v16)
* Yarn
* .NET Core SDK (v3.1+)
  * 헤드리스 빌드가 필요하지 않은 경우 생략할 수 있습니다.


## 시작하기

윈도우에서 빌드하고자 할 경우 [Git For Windows에서 심볼릭 링크가 기본적으로는 꺼져 있는 관계로](https://github.com/git-for-windows/git/wiki/Symbolic-Links) `core.symlinks`를 켜 주셔야 합니다. 추가로 윈도우 설정에서 '개발자 모드'를 활성화해야 할 수 도 있습니다.

```sh
git clone -c core.symlinks=true <URL>
```

> GitHub CLI를 선호하시는 경우 이렇게 사용해주세요: `gh repo clone <repository> -- -c core.symlinks=true`


클론한 뒤, 필요한 의존성을 설치하기 위해 다음 명령어를 실행해 주세요.

```sh
git submodule update --recursive # 9C Headless 와 Unity Player 빌드 소스 다운로드하기

yarn
yarn build  # 개발 빌드
yarn build-headless  # 9C Headless (Standalone) 빌드 (.NET Core SDK 필요)
APV_SIGN_KEY=... APV_NO=... yarn sign-apv  # APV 서명 (planet 명령 필요)
yarn build-prod  # 프로덕션 빌드
```

## 실행하기

실행하기 전 런처를 사용하기 위해 최신 버전의 `config.json` 파일이 필요합니다. 없는 경우 이곳에서 다운로드 한 뒤 `build` 폴더 내에 `config.json`이라는 이름으로 저장해주세요: https://release.nine-chronicles.com/9c-launcher-config.json.

그 이후에는 다음 명령어를 통해 런처를 실행하실 수 있습니다.

```sh
yarn dev
```

## 배포를 위한 패키징 준비

대부분의 경우에는 CI 빌드를 통해 배포되기 때문에 본 과정이 필요치 않습니다. 다만 필요한 경우 아래 명령어를 실행하여 배포를 위한 패키징을 준비할 수 있습니다.
패키징을 위해 electron-builder.{network}.yml 파일 중 원하는 채널을 선택해 복사한 후 .{network} 부분을 지워 `electron-builder.yml`이 되도록 수정해주세요.

```sh
yarn run pack
```

s3에 업로드 하기 위해선 인증 과정이 필요합니다. [aws 인증](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/cli-configure-files.html) 과정을 거쳐 먼저 세팅해주세요. 이후 아래 명령을 실행합니다.

```sh
yarn run release
```
