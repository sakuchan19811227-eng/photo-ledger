"use client";

/**
 * 現場詳細ページ内の写真ゴミ箱（折りたたみ式）。
 * 削除した写真の一覧と復元ボタン。
 */
import { useState, useTransition } from "react";
import type { PhotoWithUrl } from "./PhotoGrid";
import { restorePhotoAction } from "@/app/(dashboard)/projects/[id]/photo-actions";

function RestoreButton({ projectId, photoId }: { projectId: string; photoId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await restorePhotoAction(projectId, photoId);
        })
      }
      disabled={pending}
      className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
    >
      {pending ? "復元中..." : "復元する"}
    </button>
  );
}

export function PhotoTrash({
  photos,
  projectId,
}: {
  photos: PhotoWithUrl[];
  projectId: string;
}) {
  const [open, setOpen] = useState(false);

  if (photos.length === 0) return null;

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-base text-gray-500 underline"
      >
        🗑 写真のゴミ箱（{photos.length}枚）{open ? "を閉じる" : "を見る"}
      </button>

      {open && (
        <ul className="mt-3 space-y-2">
          {photos.map((photo) => (
            <li
              key={photo.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 shadow"
            >
              <div className="flex min-w-0 items-center gap-3">
                {photo.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.url}
                    alt={photo.fileName}
                    className="h-14 w-14 rounded-lg object-cover opacity-60"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-gray-100" />
                )}
                <p className="truncate text-base text-gray-600">{photo.fileName}</p>
              </div>
              <RestoreButton projectId={projectId} photoId={photo.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
