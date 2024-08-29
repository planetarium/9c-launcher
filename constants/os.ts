import { join } from 'path';
import type { Dir} from 'fs';
import {promises} from 'fs';
import { app } from 'electron';
import { CONFIG_FILENAME, network } from './network';
import { getDefaultWeb3KeyStorePath } from '@planetarium/account-web3-secret-storage';

/**
 * @description for cross platforms, like default paths (game binary, keystore)
 */

export const DEFAULT_PLAYER_INSTALL_PATH = join(
  app.getPath('userData'),
  `player/${network}`,
);

export const CONFIG_FILE_PATH = join(
  app.getPath('userData'),
  CONFIG_FILENAME,
);

const MACOS = 'macOS';
const LINUX = 'Linux';
const WINDOWS = 'Windows';

export const MAC_GAME_PATH = join(
  DEFAULT_PLAYER_INSTALL_PATH,
  'NineChronicles.app/Contents/MacOS/NineChronicles',
);
export const WIN_GAME_PATH = join(
  DEFAULT_PLAYER_INSTALL_PATH,
  'NineChronicles.exe',
);
export const LINUX_GAME_PATH = join(
  DEFAULT_PLAYER_INSTALL_PATH,
  'NineChronicles',
);

export const EXECUTE_PATH: {
  [k in NodeJS.Platform]: string | null;
} = {
  aix: null,
  android: null,
  darwin: MAC_GAME_PATH,
  freebsd: null,
  haiku: null,
  linux: LINUX_GAME_PATH,
  openbsd: null,
  sunos: null,
  win32: WIN_GAME_PATH,
  cygwin: WIN_GAME_PATH,
  netbsd: null,
};

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

export async function getKeyStorePath(): Promise<string> {
  const keyStorePath = getDefaultWeb3KeyStorePath();

  if (process.platform === 'darwin') {
    // TODO : Extract this to a separate function or remove since we didn't used legacy path for a long time
    // macOS: Migrate the keystore from the legacy path to the new path.
    //   legacy path: $HOME/Library/Application Support/planetarium/keystore
    //   new path:    $XDG_DATA_HOME/planetarium/keystore
    const legacyPath = join(
      app.getPath('appData'),
      'planetarium',
      'keystore',
    );

    // If the legacy keystore directory exists but is already migrated,
    // just use the new keystore directory:
    try {
      await promises.stat(join(legacyPath, '__MIGRATED__'));
      return keyStorePath;
    } catch (e) {
      if (typeof e !== 'object' || e.code !== 'ENOENT') throw e;
    }

    let dir: Dir;
    try {
      dir = await promises.opendir(legacyPath);
    } catch (e) {
      if (typeof e === 'object' && e.code === 'ENOENT') {
        return keyStorePath;
      }

      throw e;
    }

    const pattern =
      /^(?:UTC--([0-9]{4}-[0-9]{2}-[0-9]{2})T([0-9]{2}-[0-9]{2}-[0-9]{2})Z--)?([0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12})(?:.json)?$/i;
    for await (const dirEntry of dir) {
      if (!dirEntry.isFile()) continue;
      const match = pattern.exec(dirEntry.name);
      if (match === null) continue;
      await promises.copyFile(
        join(legacyPath, dirEntry.name),
        join(keyStorePath, dirEntry.name),
      );
    }

    // Mark the keystore as migrated:
    await promises.writeFile(
      join(legacyPath, '__MIGRATED__'),
      `All key files in this directory are migrated to the new path.
This file is used to prevent the keystore from being migrated again.
See also: ${keyStorePath}
Migrated at: ${new Date().toISOString()}\n`,
    );
  }

  return keyStorePath;
}
