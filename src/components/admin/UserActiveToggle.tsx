"use client";

/**
 * ユーザーの有効/無効 切替ボタン（管理画面用）。
 */
import { useState, useTransition } from "react";
import { setUserActiveAction } from "@/app/(dashboard)/admin/actions";

export function UserActiveToggle({
  userId,
  userEmail,
  isActive,
  isSelf,
}: {
  userId: string;
  userEmail: string;
  isActive: boolean;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  if (isSelf) {
    return <span className="text-sm text-gray-400">（自分）</span>;
  }

  function handleClick() {
    const verb = isActive ? "無効化" : "有効化";
    const yes = window.confirm(`${userEmail} を${verb}しますか？`);
    if (!yes) return;
    startTransition(async () => {
      const result = await setUserActiveAction(userId, !isActive);
      if (!result.ok) {
        setMessage(result.message);
        setTimeout(() => setMessage(""), 3000);
      }
    });
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={`rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50 ${
          isActive
            ? "border-red-200 text-red-600 hover:bg-red-50"
            : "border-green-300 bg-green-600 font-bold text-white hover:bg-green-700"
        }`}
      >
        {pending ? "処理中..." : isActive ? "無効化" : "有効化"}
      </button>
      {message && <span className="text-xs text-red-600">{message}</span>}
    </span>
  );
}
