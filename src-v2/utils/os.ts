const MACOS = "macOS";
const LINUX = "Linux";
const WINDOWS = "Windows";

export const PLATFORM2OS_MAP: { [k in NodeJS.Platform]: string | null } = {
  aix: null,
  android: null,
  darwin: MACOS,
  freebsd: null,
  haiku: null,
  linux: LINUX,
  openbsd: null,
  sunos: null,
  win32: WINDOWS,
  cygwin: WINDOWS,
  netbsd: null,
};
