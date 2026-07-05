"use client";

/**
 * 現場の削除ボタン。押し間違い防止のため確認ダイアログを挟む。
 * （論理削除なので、消してもゴミ箱から復元できる）
 */
import { useTransition } from "react";
import { deleteProjectAction } from "@/app/(dashboard)/projects/actions";

export function DeleteProjectButton({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const yes = window.confirm(
      `「${projectName}」を削除しますか？\n（あとでゴミ箱から戻せます）`
    );
    if (!yes) return;
    startTransition(() => deleteProjectAction(projectId));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "削除中..." : "削除"}
    </button>
  );
}
