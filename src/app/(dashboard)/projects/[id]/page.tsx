/**
 * 現場詳細ページ = 写真管理の中心。
 * 写真のアップロード（D&D）とサムネイル一覧を表示する。
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerAuthService } from "@/lib/auth";
import { getPhotoRepository, getProjectRepository } from "@/lib/repositories";
import { getServerStorage } from "@/lib/storage";
import { PhotoUploader } from "@/components/photos/PhotoUploader";
import { PhotoGrid, type PhotoWithUrl } from "@/components/photos/PhotoGrid";

/** サムネイル表示用URLの有効期限（秒） */
const SIGNED_URL_TTL = 60 * 60;

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

  const photos = await getPhotoRepository().listByProject(project.id);
  const storage = await getServerStorage();
  const photosWithUrl: PhotoWithUrl[] = await Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      url: await storage.getSignedUrl(photo.storagePath, SIGNED_URL_TTL),
    }))
  );

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

      <div className="mb-6">
        <PhotoUploader projectId={project.id} />
      </div>

      <h2 className="mb-3 text-xl font-bold text-gray-800">
        写真（{photos.length}枚）
      </h2>
      <PhotoGrid photos={photosWithUrl} />
    </div>
  );
}
