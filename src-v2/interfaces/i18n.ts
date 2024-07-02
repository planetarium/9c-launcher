import { ZXCVBNFeedbackWarning } from "zxcvbn";

export default interface I18n {
  appLocale: AppLocale;
  intro: Intro;
  menu: Menu;
  main: Main;
  login: Login;
  lobby: Lobby;
  preload: Preload;
  errorClearCache: ErrorClearCache;
  errorDiskSpace: ErrorDiskSpace;
  errorDownloadBinaryFailed: ErrorDownloadBinaryFailed;
  errorDownloadSnapshotFailed: ErrorDownloadSnapshotFailed;
  errorDownloadSnapshotMetadataFailed: ErrorDownloadSnapshotMetadataFailed;
  errorNoPermission: ErrorNoPermission;
  errorRelaunch: ErrorRelaunch;
  errorReinstall: ErrorReinstall;
  account: Account;
  createAccount: CreateAccount;
  retypePassword: RetypePassword;
  copyPrivateKey: CopyPrivateKey;
  revokeAccount: RevokeAccount;
  inputPrivateKey: InputPrivateKey;
  registerPrivateKey: RegisterPrivateKey;
  configuration: Configuration;
  preloadProgress: PreloadProgress;
}

export type Locale = RequireLocale | OptionalLocale;

export type OptionalLocale =
  | "pl"
  | "pt"
  | "lt"
  | "nl"
  | "pt-BR"
  | "km"
  | "th"
  | "id"
  | "ja"
  | "es"
  | "zh-Hans";

export type RequireLocale =
  //  | "ko"
  "en";

export type Phrases = LocaleRecord | Description;

type LocaleRecord = Record<RequireLocale, string> &
  Partial<Record<OptionalLocale, string>>;

type Description = Record<RequireLocale, string[]> &
  Partial<Record<OptionalLocale, string[]>>;

export interface AppLocale {
  "인터넷 연결이 끊겼습니다. 인터넷 연결 상태를 확인한 후에 다시 시도해주십시오.": LocaleRecord;
}

export interface Intro {
  "불러오는 중...": LocaleRecord;
}

export interface Menu {
  "Patch Note": LocaleRecord;
  Explorer: LocaleRecord;
  Discord: LocaleRecord;
  Settings: LocaleRecord;
}

export interface Main {
  "나인 크로니클에 오신 걸 환영합니다!": LocaleRecord;
  description: Description;
  "계정 생성하기": LocaleRecord;
  "이미 개인키를 가지고 있습니다": LocaleRecord;
}

export interface Login {
  "캐시 지우기": LocaleRecord;
  ID: LocaleRecord;
  "클립보드에 복사되었습니다!": LocaleRecord;
  비밀번호: LocaleRecord;
  로그인: LocaleRecord;
  "비밀번호 찾기": LocaleRecord;
}

export interface Lobby {
  "확인 중...": LocaleRecord;
  "프리로딩 중...": LocaleRecord;
  "실행 중...": LocaleRecord;
  "게임 시작하기": LocaleRecord;
  활성화: LocaleRecord;
  "초대 코드": LocaleRecord;
}

export interface Preload {
  "다른 사용자에게 데이터를 받는 중입니다. 트레일러와 새로운 콘텐츠를 봅시다!": Description;
  "블록 익스플로러": LocaleRecord;
  "나인 크로니클 플레이어 가이드": LocaleRecord;
}

export interface ErrorDiskSpace {
  "디스크 공간이 충분하지 않습니다": LocaleRecord;
  "필요한 여유 공간:": LocaleRecord;
  "체인 경로:": LocaleRecord;
}

export interface ErrorDownloadBinaryFailed {
  "바이너리 다운로드에 실패했습니다.": LocaleRecord;
  "인터넷 연결 상태를 확인한 후에 다시 시도해주십시오.": LocaleRecord;
  재시작: LocaleRecord;
}

export interface ErrorDownloadSnapshotFailed {
  "스냅샷 다운로드에 실패했습니다.": LocaleRecord;
  "인터넷 연결 상태를 확인한 후에 다시 시도해주십시오.": LocaleRecord;
  재시작: LocaleRecord;
}

export interface ErrorDownloadSnapshotMetadataFailed {
  "스냅샷 메타 데이타 다운로드에 실패했습니다.": LocaleRecord;
  "인터넷 연결 상태를 확인한 후에 다시 시도해주십시오.": LocaleRecord;
  재시작: LocaleRecord;
}

export interface ErrorNoPermission {
  "권한이 없습니다.": LocaleRecord;
  "아래 경로에 애플리케이션이 접근할 수 없습니다:": LocaleRecord;
  "체인 경로를 아래의 단계를 따라 바꿔주세요.": LocaleRecord;
  "오른쪽의 버튼을 클릭하여 설정 페이지를 여세요.": LocaleRecord;
  '"경로 선택하기" 버튼을 클릭해서 체인이 저장되는 경로를 바꿔주세요.': LocaleRecord;
}

export interface ErrorClearCache {
  "실행 도중 오류가 발생했습니다.": LocaleRecord;
  "아래 버튼을 눌러 캐시를 지워주세요. 론처가 자동으로 재시작됩니다.": LocaleRecord;
  ClearCache: LocaleRecord;
}

export interface ErrorRelaunch {
  "무언가 잘못 되었습니다.": LocaleRecord;
  "아래 절차를 따라 해주세요.": LocaleRecord;
  steps: Description;
  Relaunch: LocaleRecord;
}

export interface ErrorReinstall {
  "클리어 캐시 버튼을 눌러 주십시오.": LocaleRecord;
  "혹시 이 페이지를 클리어 캐시 후에 여전히 보셨다면, 아래 링크로 앱을 재설치 하거나 디스코드에서 지원 요청해주시길 바랍니다.": LocaleRecord;
  "Install Link": LocaleRecord;
  "캐시 클리어 & 재시작": LocaleRecord;
}

export interface Account {
  "키 생성하기": LocaleRecord;
  "키 지우기": LocaleRecord;
  "키 초기화하기": LocaleRecord;
  "홈으로 돌아가기": LocaleRecord;
}

export interface CreateAccount {
  "계정 생성을 마치기 위해 비밀번호를 설정해주세요.": Description;
}

export interface RetypePassword extends ZXCVBNFeedbackWarningLocale {
  비밀번호: LocaleRecord;
  "비밀번호 (확인)": LocaleRecord;
  "초대 코드": LocaleRecord;
  확인: LocaleRecord;
}

type ZXCVBNFeedbackWarningLocale = Record<
  Exclude<ZXCVBNFeedbackWarning, "">,
  LocaleRecord
>;

export interface CopyPrivateKey {
  title: Description;
  description: Description;
  warning: Description;
  개인키: LocaleRecord;
  복사하기: LocaleRecord;
  확인: LocaleRecord;
}

export interface RevokeAccount {
  뒤로: LocaleRecord;
  "계정 지우기": LocaleRecord;
  description: Description;
  "키 지우기": LocaleRecord;
}

export interface InputPrivateKey {
  뒤로: LocaleRecord;
  "비밀번호를 재설정하기 위해 개인키를 입력해주세요.": LocaleRecord;
  개인키: LocaleRecord;
  Enter: LocaleRecord;
  "개인키를 잊으셨나요?": LocaleRecord;
}

export interface RegisterPrivateKey {
  "비밀번호를 재설정해주세요.": LocaleRecord;
}

export interface Configuration {
  설정: LocaleRecord;
  저장: LocaleRecord;
  "체인이 저장되는 경로": LocaleRecord;
  "경로 선택": LocaleRecord;
  "체인 폴더의 이름": LocaleRecord;
  "언어 선택": LocaleRecord;
  "저장 후 론처가 재시작 됩니다.": LocaleRecord;
  "정보 수집": LocaleRecord;
  "행동 분석": LocaleRecord;
  "오류 보고": LocaleRecord;
  "두 데이터는 게임 개발에 도움이 됩니다.": LocaleRecord;
  "키 저장 경로": LocaleRecord;
  "경로 열기": LocaleRecord;
  "캐시 비우기": LocaleRecord;
  비우기: LocaleRecord;
}

export interface PreloadProgress {
  "Preload Completed.": LocaleRecord;
  "No Peers Were Given.": LocaleRecord;
  "Validating Snapshot": LocaleRecord;
  "Downloading Snapshot": LocaleRecord;
  "Downloading State Snapshot": LocaleRecord;
  "Extracting Snapshot": LocaleRecord;
  "Starting Headless": LocaleRecord;
  "Verifying Block Headers": LocaleRecord;
  "Downloading Block Hashes": LocaleRecord;
  "Downloading Blocks": LocaleRecord;
  "Downloading States": LocaleRecord;
  "Executing Actions": LocaleRecord;
  "Initializing background process..": LocaleRecord;
}
