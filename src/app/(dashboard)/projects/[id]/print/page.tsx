/**
 * 提出用PDFのための印刷ビュー。
 * ブラウザの印刷機能（Ctrl+P / 共有→プリント）で「PDFに保存」すると
 * そのまま提出用PDFになる。A4縦・1ページ3枚のレイアウト。
 * ※サーバーでPDFを生成しない方式のため、無料ホスティングでも確実に動く。
 */
import { notFound, redirect } from "next/navigation";
import { getServerAuthService } from "@/lib/auth";
import { getPhotoRepository, getProjectRepository } from "@/lib/repositories";
import { getServerStorage } from "@/lib/storage";
import { PrintButton } from "@/components/photos/PrintButton";
import { ledgerTemplate as T } from "@/lib/services/excel/ledger-template";

const SIGNED_URL_TTL = 60 * 60;

function formatTakenAt(takenAt: Date | null): string {
  if (!takenAt) return "";
  return new Date(takenAt).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PrintLedgerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getServerAuthService();
  const user = await auth.getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const project = await getProjectRepository().findById(id, user.id);
  if (!project || project.isDeleted) notFound();

  const photos = await getPhotoRepository().listByProject(project.id);
  const storage = await getServerStorage();
  const photosWithUrl = await Promise.all(
    photos.map(async (p) => ({
      ...p,
      url: await storage.getSignedUrl(p.storagePath, SIGNED_URL_TTL),
    }))
  );

  const periodLabel =
    project.startDate || project.endDate
      ? `${project.startDate ?? ""} 〜 ${project.endDate ?? ""}`
      : "";

  // 1ページぶんずつに分割
  const pages: (typeof photosWithUrl)[] = [];
  for (let i = 0; i < photosWithUrl.length; i += T.photosPerPage) {
    pages.push(photosWithUrl.slice(i, i + T.photosPerPage));
  }

  return (
    <div className="mx-auto max-w-3xl bg-white text-black">
      {/* 操作バー（印刷時は消える） */}
      <div className="mb-4 flex items-center justify-between rounded-xl bg-blue-50 p-4 print:hidden">
        <p className="text-base text-gray-700">
          「印刷 / PDFに保存」を押し、送信先で「PDFに保存」を選ぶと提出用PDFになります
        </p>
        <PrintButton />
      </div>

      {pages.length === 0 && (
        <p className="p-10 text-center text-gray-500 print:hidden">
          写真がありません。先にアップロードしてください。
        </p>
      )}

      {pages.map((pagePhotos, pageIndex) => (
        <section
          key={pageIndex}
          className="mb-8 border border-gray-300 p-6 print:mb-0 print:break-after-page print:border-0"
        >
          {/* ページヘッダー */}
          <h1 className="mb-3 text-center text-xl font-bold tracking-widest">
            工　事　写　真　台　帳
          </h1>
          <table className="mb-4 w-full border-collapse text-sm">
            <tbody>
              <tr>
                <th className="w-24 border border-gray-400 bg-gray-50 p-1.5">現場名</th>
                <td className="border border-gray-400 p-1.5" colSpan={3}>
                  {project.projectName}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-400 bg-gray-50 p-1.5">工事名</th>
                <td className="border border-gray-400 p-1.5">
                  {project.constructionName ?? ""}
                </td>
                <th className="w-16 border border-gray-400 bg-gray-50 p-1.5">工期</th>
                <td className="border border-gray-400 p-1.5">{periodLabel}</td>
              </tr>
            </tbody>
          </table>

          {/* 写真ブロック */}
          <div className="space-y-4">
            {pagePhotos.map((photo, i) => (
              <div key={photo.id} className="flex gap-3">
                <div className="w-1/2 shrink-0">
                  {photo.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.url}
                      alt={photo.fileName}
                      className="aspect-[4/3] w-full border border-gray-400 object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] w-full items-center justify-center border border-gray-400 bg-gray-100 text-sm text-gray-500">
                      画像なし
                    </div>
                  )}
                </div>
                <table className="w-full border-collapse self-start text-sm">
                  <tbody>
                    <tr>
                      <th className="w-20 border border-gray-400 bg-gray-50 p-1.5">No.</th>
                      <td className="border border-gray-400 p-1.5">
                        {pageIndex * T.photosPerPage + i + 1}
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-gray-400 bg-gray-50 p-1.5">撮影日時</th>
                      <td className="border border-gray-400 p-1.5">
                        {formatTakenAt(photo.takenAt)}
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-gray-400 bg-gray-50 p-1.5 align-top">内容</th>
                      <td className="h-24 border border-gray-400 p-1.5 align-top">
                        {photo.comment ?? ""}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
