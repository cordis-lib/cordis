import {
  GuildResolvable,
  Guild,
  InviteResolvable,
  Invite,
  RoleResolvable,
  Role,
  UserResolvable,
  User,
  ColorResolvable,
  BufferResolvable,
  FileResolvable
} from '../Types';
import { CordisCoreError, CordisCoreRangeError, CordisCoreTypeError } from '../util/Error';
import { FactoryMeta } from '../FunctionManager';
import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Readable } from 'stream';

const resolveColor = (color: ColorResolvable) => {
  if (Array.isArray(color)) {
    if (color.length !== 3) throw new CordisCoreRangeError('badRgbArrayLength', color.length);
    color = (color[0] << 16) + (color[1] << 8) + color[2];
  } else if (typeof color == 'string') {
    color = parseInt(color.replace('#', ''), 16);
  }

  if (color < 0 || color > 0xffffff) throw new CordisCoreRangeError('badColorRange');
  else if (color && isNaN(color)) throw new CordisCoreTypeError('badColorType');

  return color;
};

const resolveImage = async (image: FileResolvable, { functions: { retrieveFunction } }: FactoryMeta) => {
  if (typeof image === 'string' && image.startsWith('data:')) return image;
  return retrieveFunction('resolveBase64')(await retrieveFunction('resolveFileAsBuffer')(image));
};

const resolveBase64 = (data: BufferResolvable) => {
  if (Buffer.isBuffer(data)) return `data:image/jpg;base64,${data.toString('base64')}`;
  return data;
};

const resolveFile = async (file: FileResolvable) => {
  if (Buffer.isBuffer(file) || file instanceof Readable) return file;
  if (typeof file === 'string' && /^https?:\/\//.test(file)) return fetch(file).then(data => data.body);
  const location = path.resolve(file);

  const stats = await fs.stat(location);
  if (!stats.isFile()) throw new CordisCoreError('fileNotFound', location);
  return fs.readFile(location);
};

const resolveFileAsBuffer = async (file: FileResolvable, { functions: { retrieveFunction } }: FactoryMeta) => {
  const res = await retrieveFunction('resolveFile')(file);
  if (Buffer.isBuffer(res)) return res;

  const data = [];
  for await (const chunk of res) data.push(chunk);
  return Buffer.concat(data);
};

const resolveGuild = (guild: GuildResolvable, { functions: { retrieveFunction } }: FactoryMeta): Guild | null => {
  if (retrieveFunction('isGuild')(guild)) return guild;
  if (retrieveFunction('isAPIGuild')(guild)) return retrieveFunction('sanitizeGuild')(guild);
  return null;
};

const resolveGuildId = (guild: GuildResolvable, { functions: { retrieveFunction } }: FactoryMeta): string | null =>
  retrieveFunction('resolveGuild')(guild)?.id ?? null;

const resolveInvite = (invite: InviteResolvable, { functions: { retrieveFunction } }: FactoryMeta): Invite | null => {
  if (retrieveFunction('isInvite')(invite)) return invite;
  if (retrieveFunction('isAPIInvite')(invite)) return retrieveFunction('sanitizeInvite')(invite);
  return null;
};

const resolveInviteCode = (invite: InviteResolvable | string, { functions: { retrieveFunction } }: FactoryMeta): string | null => {
  if (typeof invite === 'string') return invite.replace(/(https\:\/\/)?(discord)?(\.gg)?\/?/g, '');
  return retrieveFunction('resolveInvite')(invite)?.code ?? null;
};

const resolveRole = (role: RoleResolvable, { functions: { retrieveFunction } }: FactoryMeta): Role | null => {
  if (retrieveFunction('isRole')(role)) return role;
  if (retrieveFunction('isAPIRole')(role)) return retrieveFunction('sanitizeRole')(role);
  return null;
};

const resolveRoleId = (role: RoleResolvable, { functions: { retrieveFunction } }: FactoryMeta): string | null =>
  retrieveFunction('resolveRole')(role)?.id ?? null;

/**
 * Attempts to resolve a cordis user from the given value
 */
const resolveUser = (user: UserResolvable, { functions: { retrieveFunction } }: FactoryMeta): User | null => {
  if (retrieveFunction('isUser')(user)) return user;
  if (retrieveFunction('isAPIUser')(user)) return retrieveFunction('sanitizeUser')(user);
  return null;
};

/**
 * Attempts to resolve a user id from the given value
 */
const resolveUserId = (user: UserResolvable, { functions: { retrieveFunction } }: FactoryMeta): string | null =>
  retrieveFunction('resolveUser')(user)?.id ?? null;

export {
  resolveColor,
  resolveImage,
  resolveBase64,
  resolveFile,
  resolveFileAsBuffer,

  resolveGuild,
  resolveGuildId,

  resolveInvite,
  resolveInviteCode,

  resolveRole,
  resolveRoleId,

  resolveUser,
  resolveUserId
};
