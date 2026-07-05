/**
 * IPhotoRepository の Drizzle（PostgreSQL）実装。
 * 全メソッドで projectId を条件に含め、他現場の写真を触れないようにする。
 * （その現場が本人のものかの確認は、呼び出し側の Server Action が行う）
 */
import { and, asc, eq, ilike, inArray, max, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import type { IPhotoRepository, Photo, PhotoInput } from "./types";

export class DrizzlePhotoRepository implements IPhotoRepository {
  async listByProject(projectId: string, keyword?: string): Promise<Photo[]> {
    const conditions = [eq(photos.projectId, projectId), eq(photos.isDeleted, false)];

    if (keyword && keyword.trim() !== "") {
      const pattern = `%${keyword.trim()}%`;
      conditions.push(
        or(ilike(photos.comment, pattern), ilike(photos.fileName, pattern))!
      );
    }

    return db
      .select()
      .from(photos)
      .where(and(...conditions))
      .orderBy(asc(photos.sortOrder), asc(photos.takenAt));
  }

  async listDeletedByProject(projectId: string): Promise<Photo[]> {
    return db
      .select()
      .from(photos)
      .where(and(eq(photos.projectId, projectId), eq(photos.isDeleted, true)))
      .orderBy(asc(photos.sortOrder));
  }

  async create(input: PhotoInput): Promise<Photo> {
    const rows = await db
      .insert(photos)
      .values({
        projectId: input.projectId,
        fileName: input.fileName,
        storagePath: input.storagePath,
        takenAt: input.takenAt ?? null,
        sortOrder: input.sortOrder,
        createdBy: input.createdBy,
      })
      .returning();
    return rows[0];
  }

  async nextSortOrder(projectId: string): Promise<number> {
    const rows = await db
      .select({ maxOrder: max(photos.sortOrder) })
      .from(photos)
      .where(eq(photos.projectId, projectId));
    return (rows[0]?.maxOrder ?? 0) + 1;
  }

  async updateComment(id: string, projectId: string, comment: string): Promise<boolean> {
    const rows = await db
      .update(photos)
      .set({ comment })
      .where(and(eq(photos.id, id), eq(photos.projectId, projectId)))
      .returning({ id: photos.id });
    return rows.length > 0;
  }

  async setSortOrder(id: string, projectId: string, sortOrder: number): Promise<boolean> {
    const rows = await db
      .update(photos)
      .set({ sortOrder })
      .where(and(eq(photos.id, id), eq(photos.projectId, projectId)))
      .returning({ id: photos.id });
    return rows.length > 0;
  }

  async softDeleteMany(ids: string[], projectId: string): Promise<number> {
    if (ids.length === 0) return 0;
    const rows = await db
      .update(photos)
      .set({ isDeleted: true })
      .where(and(inArray(photos.id, ids), eq(photos.projectId, projectId)))
      .returning({ id: photos.id });
    return rows.length;
  }

  async restore(id: string, projectId: string): Promise<boolean> {
    const rows = await db
      .update(photos)
      .set({ isDeleted: false })
      .where(and(eq(photos.id, id), eq(photos.projectId, projectId)))
      .returning({ id: photos.id });
    return rows.length > 0;
  }
}
