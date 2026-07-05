/**
 * Excel台帳のダウンロードAPI。
 * GET /api/export/excel/{projectId}
 * 本人確認→現場の所有確認→写真をストレージから取得→Excel生成→返却。
 */
import { NextResponse, type NextRequest } from "next/server";
import { getServerAuthService } from "@/lib/auth";
import { getPhotoRepository, getProjectRepository } from "@/lib/repositories";
import { getServerStorage } from "@/lib/storage";
import { buildLedgerWorkbook, type LedgerPhoto } from "@/lib/services/excel/ledger";
import { recordAudit } from "@/lib/services/audit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const auth = await getServerAuthService();
  const user = await auth.getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await getProjectRepository().findById(projectId, user.id);
  if (!project || project.isDeleted) {
    return NextResponse.json({ error: "現場が見つかりません" }, { status: 404 });
  }

  const photos = await getPhotoRepository().listByProject(projectId);
  if (photos.length === 0) {
    return NextResponse.json(
      { error: "写真がありません。先に写真をアップロードしてください" },
      { status: 400 }
    );
  }

  // ストレージから画像の中身を取得
  const storage = await getServerStorage();
  const ledgerPhotos: LedgerPhoto[] = [];
  for (const photo of photos) {
    const data = await storage.download(photo.storagePath);
    if (!data) continue; // 取得できない写真はスキップ
    ledgerPhotos.push({
      data,
      fileName: photo.fileName,
      comment: photo.comment,
      takenAt: photo.takenAt,
    });
  }

  const periodLabel =
    project.startDate || project.endDate
      ? `${project.startDate ?? ""} 〜 ${project.endDate ?? ""}`
      : "";

  const workbook = await buildLedgerWorkbook({
    projectName: project.projectName,
    constructionName: project.constructionName,
    customerName: project.customerName,
    periodLabel,
    photos: ledgerPhotos,
  });

  const buffer = await workbook.xlsx.writeBuffer();

  await recordAudit(user.id, "export_excel", {
    tableName: "projects",
    targetId: projectId,
    metadata: { projectName: project.projectName, photoCount: ledgerPhotos.length },
  });

  const dateLabel = new Date().toISOString().slice(0, 10);
  const fileName = `写真台帳_${project.projectName}_${dateLabel}.xlsx`;

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // 日本語ファイル名はRFC 5987形式で
      "Content-Disposition": `attachment; filename="ledger.xlsx"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  });
}
