/**
 * IUserRepository の Drizzle（PostgreSQL）実装。
 * 一覧・無効化は管理画面（role=admin）からのみ呼ばれる前提。
 * 権限チェックは呼び出し側（Server Action / ページ）が行う約束。
 */
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { AppUser, IUserRepository } from "./types";

export class DrizzleUserRepository implements IUserRepository {
  async findById(id: string): Promise<AppUser | null> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async listAll(): Promise<AppUser[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async setActive(id: string, isActive: boolean): Promise<boolean> {
    const rows = await db
      .update(users)
      .set({ isActive })
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return rows.length > 0;
  }
}
