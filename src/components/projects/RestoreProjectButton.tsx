"use client";

/**
 * ゴミ箱からの復元ボタン。
 */
import { useTransition } from "react";
import { restoreProjectAction } from "@/app/(dashboard)/projects/actions";

export function RestoreProjectButton({ projectId }: { projectId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => restoreProjectAction(projectId))}
      disabled={pending}
      className="rounded-lg bg-green-600 px-4 py-2 text-base font-bold text-white hover:bg-green-700 disabled:opacity-50"
    >
      {pending ? "復元中..." : "復元する"}
    </button>
  );
}
