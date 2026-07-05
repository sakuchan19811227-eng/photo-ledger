/**
 * 現場詳細ページ。
 * Step4（写真アップロード・写真管理）でここに写真一覧を実装する。
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerAuthService } from "@/lib/auth";
import { getProjectRepository } from "@/lib/repositories";

export default async function ProjectDetailPage({
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

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{project.projectName}</h1>
          {project.constructionName && (
            <p className="text-base text-gray-600">{project.constructionName}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/projects/${project.id}/edit`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-base text-gray-700 hover:bg-gray-50"
          >
            現場情報を編集
          </Link>
          <Link
            href="/projects"
            className="rounded-lg border border-gray-300 px-4 py-2 text-base text-gray-700 hover:bg-gray-50"
          >
            一覧に戻る
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-10 text-center shadow">
        <p className="text-lg text-gray-600">📷 写真管理はここに作ります</p>
        <p className="mt-2 text-base text-gray-500">
          次のステップ（Step4: 写真アップロード）で実装予定です。
        </p>
      </div>
    </div>
  );
}
