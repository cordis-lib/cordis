import { join } from 'path';
import { readdirSync, statSync, promises } from 'fs';
const { readdir, stat } = promises;

export enum ReaddirRecursiveMode {
  all,
  files,
  dirs
}

/**
 * Recursively reads out an entire directory
 * @param directory The target directory
 * @param mode What type of results you expect from the function
 */
export const readdirRecursive = async (directory: string, mode = ReaddirRecursiveMode.files) => {
  const result: string[] = [];

  await (async function read(dir) {
    const files = await readdir(dir);

    for (const file of files) {
      const filepath = join(dir, file);

      const isDir = (await stat(filepath)).isDirectory();

      switch (mode) {
        case ReaddirRecursiveMode.files: {
          if (!isDir) result.push(file);
          break;
        }
        case ReaddirRecursiveMode.all: {
          result.push(filepath);
          break;
        }
        case ReaddirRecursiveMode.dirs: {
          if (isDir) result.push(file);
          break;
        }
      }

      if (isDir) await read(file);
    }
  })(directory);

  return result;
};

/**
 * readdirRecursive but sync
 * ! Please avoid using this if possible; unless it's a meaningless situation like app startup where you don't care
 * ! This is slower & blocking, please avoid it.
 * @param directory The target directory
 * @param mode What type of results you expect from the function
 */
export const readdirRecursiveSync = (directory: string, mode = ReaddirRecursiveMode.files) => {
  const result: string[] = [];

  (function read(dir) {
    const files = readdirSync(dir);

    for (const file of files) {
      const filepath = join(dir, file);

      const isDir = statSync(filepath).isDirectory();

      switch (mode) {
        case ReaddirRecursiveMode.files: {
          if (!isDir) result.push(file);
          break;
        }
        case ReaddirRecursiveMode.all: {
          result.push(filepath);
          break;
        }
        case ReaddirRecursiveMode.dirs: {
          if (isDir) result.push(file);
          break;
        }
      }

      if (isDir) read(file);
    }
  })(directory);

  return result;
};
