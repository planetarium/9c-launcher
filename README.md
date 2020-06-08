# Launcher-v2
## 개요
Launcher-v2 는 일렉트론 기반의 멀티플랫폼 런처입니다. 기본적인 골격은 다음과 같습니다.:

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

## 실행방법
```js
npm run server //렌더러 빌드 후 webpack-hot-reload 실행
npm run start //메인 프로세스 빌드 후 electron 실행
```

## 빌드 방법
```js
npm run build //개발 빌드
npm run build-prod //프로덕션 빌드
```

## 패키징 방법
```js
npm run pack
```