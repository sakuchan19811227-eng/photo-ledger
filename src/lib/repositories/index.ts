/**
 * リポジトリの入口。使う側はこの関数だけ呼べばよい。
 * （どの実装を使うかはここで一元管理。将来の移行時の切替点）
 */
import { DrizzleProjectRepository } from "./project.repository";
import type { IProjectRepository } from "./types";

export type { IProjectRepository, Project, ProjectInput } from "./types";

let projectRepository: IProjectRepository | undefined;

export function getProjectRepository(): IProjectRepository {
  projectRepository ??= new DrizzleProjectRepository();
  return projectRepository;
}
