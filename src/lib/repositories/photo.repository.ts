/**
 * IPhotoRepository の Drizzle（PostgreSQL）実装。
 * 権限チェック（その現場が本人のものか）は呼び出し側（Server Action）が
 * project.repository で確認してから呼ぶ約束。
 */
import { and, asc, eq, max } from "drizzle-orm";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import type { IPhotoRepository, Photo, PhotoInput } from "./types";

export class DrizzlePhotoRepository implements IPhotoRepository {
  async listByProject(projectId: string): Promise<Photo[]> {
    return db
      .select()
      .from(photos)
      .where(and(eq(photos.projectId, projectId), eq(photos.isDeleted, false)))
      .orderBy(asc(photos.sortOrder), asc(photos.takenAt));
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
}
