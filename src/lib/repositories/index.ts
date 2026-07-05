/**
 * リポジトリの入口。使う側はこの関数だけ呼べばよい。
 * （どの実装を使うかはここで一元管理。将来の移行時の切替点）
 */
import { DrizzleProjectRepository } from "./project.repository";
import { DrizzlePhotoRepository } from "./photo.repository";
import type { IPhotoRepository, IProjectRepository } from "./types";

export type {
  IPhotoRepository,
  IProjectRepository,
  Photo,
  PhotoInput,
  Project,
  ProjectInput,
} from "./types";

let projectRepository: IProjectRepository | undefined;
let photoRepository: IPhotoRepository | undefined;

export function getProjectRepository(): IProjectRepository {
  projectRepository ??= new DrizzleProjectRepository();
  return projectRepository;
}

export function getPhotoRepository(): IPhotoRepository {
  photoRepository ??= new DrizzlePhotoRepository();
  return photoRepository;
}
