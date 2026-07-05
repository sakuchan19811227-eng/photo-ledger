/**
 * 写真のサムネイル一覧（サーバーコンポーネント）。
 * 非公開バケットのため、期限付きURL（1時間）で表示する。
 */
import type { Photo } from "@/lib/repositories";

export type PhotoWithUrl = Photo & { url: string | null };

function formatTakenAt(takenAt: Date | null): string {
  if (!takenAt) return "撮影日時なし";
  return takenAt.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PhotoGrid({ photos }: { photos: PhotoWithUrl[] }) {
  if (photos.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow">
        <p className="text-lg text-gray-600">まだ写真がありません</p>
        <p className="mt-1 text-base text-gray-500">
          上の枠から写真をアップロードしてください
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {photos.map((photo) => (
        <li key={photo.id} className="overflow-hidden rounded-xl bg-white shadow">
          {photo.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.url}
              alt={photo.fileName}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center bg-gray-100 text-gray-400">
              表示できません
            </div>
          )}
          <div className="p-2">
            <p className="truncate text-sm text-gray-700" title={photo.fileName}>
              {photo.fileName}
            </p>
            <p className="text-xs text-gray-500">{formatTakenAt(photo.takenAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
