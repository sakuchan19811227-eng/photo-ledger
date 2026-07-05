"use client";

/**
 * 写真の管理グリッド。
 * サムネイル一覧に加えて、写真ごとのコメント入力・並び替え（↑↓）・
 * チェックボックスでの一括選択→一括削除（ゴミ箱へ）ができる。
 */
import { useState, useTransition } from "react";
import type { Photo } from "@/lib/repositories";
import {
  bulkDeletePhotosAction,
  movePhotoAction,
  updatePhotoCommentAction,
} from "@/app/(dashboard)/projects/[id]/photo-actions";

export type PhotoWithUrl = Photo & { url: string | null };

function formatTakenAt(takenAt: Date | null): string {
  if (!takenAt) return "撮影日時なし";
  return new Date(takenAt).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 写真1枚ぶんのカード */
function PhotoCard({
  photo,
  projectId,
  selected,
  onToggleSelect,
  isFirst,
  isLast,
}: {
  photo: PhotoWithUrl;
  projectId: string;
  selected: boolean;
  onToggleSelect: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [comment, setComment] = useState(photo.comment ?? "");
  const [savedMessage, setSavedMessage] = useState("");
  const [saving, startSaving] = useTransition();
  const [moving, startMoving] = useTransition();

  const isDirty = comment !== (photo.comment ?? "");

  function handleSave() {
    startSaving(async () => {
      const result = await updatePhotoCommentAction(projectId, photo.id, comment);
      setSavedMessage(result.ok ? "✓ 保存しました" : result.message);
      setTimeout(() => setSavedMessage(""), 3000);
    });
  }

  function handleMove(direction: "up" | "down") {
    startMoving(async () => {
      await movePhotoAction(projectId, photo.id, direction);
    });
  }

  return (
    <li
      className={`overflow-hidden rounded-xl bg-white shadow ${
        selected ? "ring-4 ring-blue-400" : ""
      }`}
    >
      <div className="relative">
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
        {/* 選択チェックボックス（大きめ・左上） */}
        <label className="absolute left-2 top-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white/90 shadow">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="h-5 w-5 accent-blue-600"
            aria-label={`${photo.fileName} を選択`}
          />
        </label>
        {/* 並び替えボタン（右上） */}
        <div className="absolute right-2 top-2 flex gap-1">
          <button
            type="button"
            onClick={() => handleMove("up")}
            disabled={moving || isFirst}
            title="1つ前へ"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-lg shadow hover:bg-white disabled:opacity-40"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => handleMove("down")}
            disabled={moving || isLast}
            title="1つ後へ"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-lg shadow hover:bg-white disabled:opacity-40"
          >
            ↓
          </button>
        </div>
      </div>

      <div className="space-y-2 p-3">
        <div>
          <p className="truncate text-sm text-gray-700" title={photo.fileName}>
            {photo.fileName}
          </p>
          <p className="text-xs text-gray-500">{formatTakenAt(photo.takenAt)}</p>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="コメント（例: 基礎配筋施工状況）"
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-700">{savedMessage}</span>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-40"
          >
            {saving ? "保存中..." : "コメント保存"}
          </button>
        </div>
      </div>
    </li>
  );
}

export function PhotoGrid({
  photos,
  projectId,
}: {
  photos: PhotoWithUrl[];
  projectId: string;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, startDeleting] = useTransition();
  const [message, setMessage] = useState("");

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(photos.map((p) => p.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function handleBulkDelete() {
    const count = selectedIds.size;
    if (count === 0) return;
    const yes = window.confirm(
      `選択した${count}枚をゴミ箱に移動しますか？\n（あとで戻せます）`
    );
    if (!yes) return;
    startDeleting(async () => {
      const result = await bulkDeletePhotosAction(projectId, [...selectedIds]);
      setMessage(result.message);
      clearSelection();
      setTimeout(() => setMessage(""), 3000);
    });
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow">
        <p className="text-lg text-gray-600">写真がありません</p>
        <p className="mt-1 text-base text-gray-500">
          上の枠から写真をアップロードしてください
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 一括操作ツールバー */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={selectAll}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          すべて選択
        </button>
        <button
          type="button"
          onClick={clearSelection}
          disabled={selectedIds.size === 0}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          選択解除
        </button>
        <button
          type="button"
          onClick={handleBulkDelete}
          disabled={deleting || selectedIds.size === 0}
          className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-40"
        >
          {deleting
            ? "削除中..."
            : `選択した${selectedIds.size}枚をゴミ箱へ`}
        </button>
        {message && <span className="text-sm text-green-700">{message}</span>}
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {photos.map((photo, i) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            projectId={projectId}
            selected={selectedIds.has(photo.id)}
            onToggleSelect={() => toggleSelect(photo.id)}
            isFirst={i === 0}
            isLast={i === photos.length - 1}
          />
        ))}
      </ul>
    </div>
  );
}
