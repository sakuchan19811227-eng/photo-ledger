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
