/**
 * 操作ログ（監査ログ）の記録サービス。
 * どの操作を記録するかの一覧は AUDIT_ACTIONS を参照。
 *
 * 方針: ログ記録の失敗で本来の操作を止めない（try/catchで握りつぶす）。
 */
import { getAuditLogRepository } from "@/lib/repositories";

/** 記録対象の操作一覧（指示書の記録対象に対応） */
export const AUDIT_ACTIONS = {
  login: "ログイン",
  logout: "ログアウト",
  register: "新規登録",
  project_create: "現場の登録",
  project_update: "現場の更新",
  project_delete: "現場の削除",
  project_restore: "現場の復元",
  photo_upload: "写真のアップロード",
  photo_comment_update: "写真コメントの更新",
  photo_delete: "写真の削除",
  photo_restore: "写真の復元",
  export_excel: "Excel出力",
  export_pdf: "PDF出力",
} as const;

export type AuditAction = keyof typeof AUDIT_ACTIONS;

export async function recordAudit(
  userId: string | null,
  action: AuditAction,
  options?: {
    tableName?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await getAuditLogRepository().create({
      userId,
      action,
      tableName: options?.tableName ?? null,
      targetId: options?.targetId ?? null,
      metadata: options?.metadata ?? null,
    });
  } catch (error) {
    // ログ記録の失敗は本処理に影響させない（開発時のみコンソールに出す）
    if (process.env.NODE_ENV !== "production") {
      console.warn("監査ログの記録に失敗:", error);
    }
  }
}
