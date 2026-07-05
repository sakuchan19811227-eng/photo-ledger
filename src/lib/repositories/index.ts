/**
 * リポジトリの入口。使う側はこの関数だけ呼べばよい。
 * （どの実装を使うかはここで一元管理。将来の移行時の切替点）
 */
import { DrizzleProjectRepository } from "./project.repository";
import { DrizzlePhotoRepository } from "./photo.repository";
import { DrizzleUserRepository } from "./user.repository";
import { DrizzleAuditLogRepository } from "./audit-log.repository";
import type {
  IAuditLogRepository,
  IPhotoRepository,
  IProjectRepository,
  IUserRepository,
} from "./types";

export type {
  AppUser,
  AuditLog,
  AuditLogInput,
  AuditLogWithUser,
  IAuditLogRepository,
  IPhotoRepository,
  IProjectRepository,
  IUserRepository,
  Photo,
  PhotoInput,
  Project,
  ProjectInput,
} from "./types";

let projectRepository: IProjectRepository | undefined;
let photoRepository: IPhotoRepository | undefined;
let userRepository: IUserRepository | undefined;
let auditLogRepository: IAuditLogRepository | undefined;

export function getProjectRepository(): IProjectRepository {
  projectRepository ??= new DrizzleProjectRepository();
  return projectRepository;
}

export function getPhotoRepository(): IPhotoRepository {
  photoRepository ??= new DrizzlePhotoRepository();
  return photoRepository;
}

export function getUserRepository(): IUserRepository {
  userRepository ??= new DrizzleUserRepository();
  return userRepository;
}

export function getAuditLogRepository(): IAuditLogRepository {
  auditLogRepository ??= new DrizzleAuditLogRepository();
  return auditLogRepository;
}
