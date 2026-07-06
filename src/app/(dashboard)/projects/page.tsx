/**
 * 現場一覧ページ。検索（?q=キーワード）と新規登録・編集・削除への入口。
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthService } from "@/lib/auth";
import { getProjectRepository, type Project } from "@/lib/repositories";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";

function formatPeriod(project: Project): string {
  const start = project.startDate ?? "";
  const end = project.endDate ?? "";
  if (!start && !end) return "-";
  return `${start || "未定"} 〜 ${end || "未定"}`;
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const auth = await getServerAuthService();
  const user = await auth.getCurrentUser();
  if (!user) redirect("/login");

  const { q } = await searchParams;
  const keyword = q?.trim() ?? "";
  const projects = await getProjectRepository().listByUser(user.id, keyword);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">現場一覧</h1>
        <Link
          href="/projects/new"
          className="rounded-lg bg-blue-600 px-5 py-3 text-lg font-bold text-white hover:bg-blue-700"
        >
          ＋ 現場を登録
        </Link>
      </div>

      {/* 検索 */}
      <form method="GET" className="mb-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={keyword}
          placeholder="現場名・工事名・顧客名で検索"
          className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-base text-gray-700 hover:bg-gray-50"
        >
          検索
        </button>
      </form>

      {projects.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow">
          <p className="text-lg text-gray-600">
            {keyword
              ? `「${keyword}」に一致する現場はありません`
              : "ようこそ！ここから写真台帳づくりが始まります"}
          </p>
          {!keyword && (
            <div className="mx-auto mt-4 max-w-md text-left">
              <ol className="space-y-2 text-base text-gray-600">
                <li className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">1</span>
                  右上の「＋ 現場を登録」で現場を作る
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">2</span>
                  現場を開いて写真をアップロード＆コメント入力
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">3</span>
                  「Excel出力」「PDF出力」ボタンで台帳が完成
                </li>
              </ol>
            </div>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl bg-white p-5 shadow transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/projects/${p.id}`}
                    className="text-xl font-bold text-blue-700 hover:underline"
                  >
                    {p.projectName}
                  </Link>
                  <div className="mt-1 space-y-0.5 text-base text-gray-600">
                    {p.constructionName && <p>工事名: {p.constructionName}</p>}
                    {p.customerName && <p>顧客名: {p.customerName}</p>}
                    <p>工期: {formatPeriod(p)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/projects/${p.id}/edit`}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    編集
                  </Link>
                  <DeleteProjectButton projectId={p.id} projectName={p.projectName} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-right">
        <Link href="/trash" className="text-sm text-gray-500 underline">
          🗑 ゴミ箱を見る
        </Link>
      </p>
    </div>
  );
}
