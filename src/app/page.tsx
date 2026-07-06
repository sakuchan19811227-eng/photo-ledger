/**
 * トップページ（ランディング）。
 * 未ログイン: アプリの紹介＋ログイン/新規登録への入口を表示。
 * ログイン済み: 現場一覧へ転送。
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthService } from "@/lib/auth";

const FEATURES = [
  {
    icon: "📤",
    title: "写真をまとめてアップロード",
    text: "スマホやPCからドラッグ＆ドロップで複数枚を一括登録。撮影日時は写真から自動で読み取ります。",
  },
  {
    icon: "✏️",
    title: "コメントを付けて整理",
    text: "写真ごとに工事内容のコメントを入力。並び替えや検索、現場ごとの管理もかんたんです。",
  },
  {
    icon: "📊",
    title: "台帳をボタン1つで出力",
    text: "工事写真台帳の形式（A4・1ページ3枚）で、Excelも提出用PDFもワンクリックで作成できます。",
  },
];

const STEPS = [
  { num: "1", label: "現場を登録する" },
  { num: "2", label: "写真をアップロードしてコメントを入力" },
  { num: "3", label: "Excel / PDFの台帳を出力して提出" },
];

export default async function Home() {
  const auth = await getServerAuthService();
  const user = await auth.getCurrentUser();
  if (user) {
    redirect("/projects");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヒーロー */}
      <section className="bg-white px-4 pb-14 pt-16 text-center shadow-sm">
        <p className="text-5xl">📷</p>
        <h1 className="mt-3 text-3xl font-bold text-blue-700 sm:text-4xl">
          写真台帳
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-700">
          建設現場の写真から、<strong>工事写真台帳（Excel・PDF）</strong>を
          かんたんに作成できるアプリです。
        </p>
        <p className="mx-auto mt-2 max-w-xl text-base text-gray-500">
          Excelに1枚ずつ写真を貼り付ける作業は、もう必要ありません。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-bold text-white hover:bg-blue-700"
          >
            無料ではじめる
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-lg text-gray-700 hover:bg-gray-50"
          >
            ログイン
          </Link>
        </div>
      </section>

      {/* できること */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          このアプリでできること
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl bg-white p-6 shadow">
              <p className="text-3xl">{f.icon}</p>
              <h3 className="mt-2 text-lg font-bold text-gray-800">{f.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-gray-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 使い方3ステップ */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          使い方は3ステップ
        </h2>
        <ol className="space-y-3">
          {STEPS.map((s) => (
            <li
              key={s.num}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                {s.num}
              </span>
              <span className="text-lg text-gray-700">{s.label}</span>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center">
          <Link
            href="/register"
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-bold text-white hover:bg-blue-700"
          >
            無料ではじめる
          </Link>
        </p>
      </section>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
        📷 写真台帳 — 建設業向け写真台帳管理アプリ
      </footer>
    </div>
  );
}
