/**
 * IAuditLogRepository の Drizzle（PostgreSQL）実装。
 */
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";
import type { AuditLogInput, AuditLogWithUser, IAuditLogRepository } from "./types";

export class DrizzleAuditLogRepository implements IAuditLogRepository {
  async create(input: AuditLogInput): Promise<void> {
    await db.insert(auditLogs).values({
      userId: input.userId,
      action: input.action,
      tableName: input.tableName ?? null,
      targetId: input.targetId ?? null,
      metadata: input.metadata ?? null,
    });
  }

  async listRecent(limit: number, action?: string): Promise<AuditLogWithUser[]> {
    const query = db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        tableName: auditLogs.tableName,
        targetId: auditLogs.targetId,
        metadata: auditLogs.metadata,
        createdAt: auditLogs.createdAt,
        userEmail: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);

    if (action && action.trim() !== "") {
      return query.where(eq(auditLogs.action, action.trim()));
    }
    return query;
  }
}
