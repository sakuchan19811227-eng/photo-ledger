/**
 * DBアクセスの抽象化層（interface）。
 * 画面・サービス層はこの interface だけに依存する。
 * 実装（Drizzle+Postgres）を将来差し替えても、使う側は変更不要。
 *
 * 注意: DB直結のためRLS（DB側の行防御）は効かない。
 * そのため全メソッドで userId を受け取り、必ず本人のデータに絞り込む。
 */

/** 現場（工事案件） */
export type Project = {
  id: string;
  userId: string;
  projectName: string;
  constructionName: string | null;
  customerName: string | null;
  startDate: string | null; // "YYYY-MM-DD"
  endDate: string | null;
  memo: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** 現場の登録・更新に使う入力 */
export type ProjectInput = {
  projectName: string;
  constructionName?: string | null;
  customerName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  memo?: string | null;
};

/** 写真 */
export type Photo = {
  id: string;
  projectId: string;
  fileName: string;
  storagePath: string;
  comment: string | null;
  takenAt: Date | null;
  sortOrder: number;
  createdBy: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** 写真の登録に使う入力 */
export type PhotoInput = {
  projectId: string;
  fileName: string;
  storagePath: string;
  takenAt?: Date | null;
  sortOrder: number;
  createdBy: string;
};

export interface IPhotoRepository {
  /** 現場の写真一覧（削除済みを除く、並び順→撮影日時順）。keyword はコメント/ファイル名の部分一致 */
  listByProject(projectId: string, keyword?: string): Promise<Photo[]>;
  /** 現場のゴミ箱（削除済み写真の一覧） */
  listDeletedByProject(projectId: string): Promise<Photo[]>;
  /** 登録 */
  create(input: PhotoInput): Promise<Photo>;
  /** 現場内の次の並び順番号を得る */
  nextSortOrder(projectId: string): Promise<number>;
  /** コメントの保存（対象現場の写真のみ） */
  updateComment(id: string, projectId: string, comment: string): Promise<boolean>;
  /** 並び順の変更 */
  setSortOrder(id: string, projectId: string, sortOrder: number): Promise<boolean>;
  /** 論理削除（複数まとめて） */
  softDeleteMany(ids: string[], projectId: string): Promise<number>;
  /** ゴミ箱から復元 */
  restore(id: string, projectId: string): Promise<boolean>;
}

export interface IProjectRepository {
  /** 自分の現場一覧（削除済みを除く）。keyword があれば現場名/工事名/顧客名で部分一致検索 */
  listByUser(userId: string, keyword?: string): Promise<Project[]>;
  /** 自分のゴミ箱（削除済み一覧） */
  listDeletedByUser(userId: string): Promise<Project[]>;
  /** 1件取得（本人のもの以外は null） */
  findById(id: string, userId: string): Promise<Project | null>;
  /** 登録 */
  create(userId: string, input: ProjectInput): Promise<Project>;
  /** 更新（本人のもののみ） */
  update(id: string, userId: string, input: ProjectInput): Promise<Project | null>;
  /** 論理削除（ゴミ箱へ） */
  softDelete(id: string, userId: string): Promise<boolean>;
  /** ゴミ箱から復元 */
  restore(id: string, userId: string): Promise<boolean>;
}
