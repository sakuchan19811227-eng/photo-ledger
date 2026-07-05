/**
 * IProjectRepository の Drizzle（PostgreSQL）実装。
 */
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, users } from "@/lib/db/schema";
import type { IProjectRepository, Project, ProjectInput } from "./types";

export class DrizzleProjectRepository implements IProjectRepository {
  async listByUser(userId: string, keyword?: string): Promise<Project[]> {
    const conditions = [eq(projects.userId, userId), eq(projects.isDeleted, false)];

    if (keyword && keyword.trim() !== "") {
      const pattern = `%${keyword.trim()}%`;
      conditions.push(
        or(
          ilike(projects.projectName, pattern),
          ilike(projects.constructionName, pattern),
          ilike(projects.customerName, pattern)
        )!
      );
    }

    return db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(desc(projects.createdAt));
  }

  async listDeletedByUser(userId: string): Promise<Project[]> {
    return db
      .select()
      .from(projects)
      .where(and(eq(projects.userId, userId), eq(projects.isDeleted, true)))
      .orderBy(desc(projects.updatedAt));
  }

  async listAllDeleted(): Promise<Array<Project & { ownerEmail: string | null }>> {
    const rows = await db
      .select({ project: projects, ownerEmail: users.email })
      .from(projects)
      .leftJoin(users, eq(projects.userId, users.id))
      .where(eq(projects.isDeleted, true))
      .orderBy(desc(projects.updatedAt));
    return rows.map((r) => ({ ...r.project, ownerEmail: r.ownerEmail }));
  }

  async findById(id: string, userId: string): Promise<Project | null> {
    const rows = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  }

  async create(userId: string, input: ProjectInput): Promise<Project> {
    const rows = await db
      .insert(projects)
      .values({
        userId,
        projectName: input.projectName,
        constructionName: input.constructionName ?? null,
        customerName: input.customerName ?? null,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        memo: input.memo ?? null,
      })
      .returning();
    return rows[0];
  }

  async update(id: string, userId: string, input: ProjectInput): Promise<Project | null> {
    const rows = await db
      .update(projects)
      .set({
        projectName: input.projectName,
        constructionName: input.constructionName ?? null,
        customerName: input.customerName ?? null,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        memo: input.memo ?? null,
      })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return rows[0] ?? null;
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .update(projects)
      .set({ isDeleted: true })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning({ id: projects.id });
    return rows.length > 0;
  }

  async restore(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .update(projects)
      .set({ isDeleted: false })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning({ id: projects.id });
    return rows.length > 0;
  }
}
