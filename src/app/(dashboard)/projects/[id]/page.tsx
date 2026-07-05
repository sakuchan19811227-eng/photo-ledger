/**
 * 現場詳細ページ = 写真管理の中心。
 * 写真のアップロード（D&D）、検索、コメント入力、並び替え、
 * 一括選択削除、ゴミ箱からの復元ができる。
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerAuthService } from "@/lib/auth";
import { getPhotoRepository, getProjectRepository, type Photo } from "@/lib/repositories";
import { getServerStorage, type IStorage } from "@/lib/storage";
import { PhotoUploader } from "@/components/photos/PhotoUploader";
import { PhotoGrid, type PhotoWithUrl } from "@/components/photos/PhotoGrid";
import { PhotoTrash } from "@/components/photos/PhotoTrash";

/** サムネイル表示用URLの有効期限（秒） */
const SIGNED_URL_TTL = 60 * 60;

async function withUrls(storage: IStorage, photos: Photo[]): Promise<PhotoWithUrl[]> {
  return Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      url: await storage.getSignedUrl(photo.storagePath, SIGNED_URL_TTL),
    }))
  );
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pq?: string }>;
}) {
  const auth = await getServerAuthService();
  const user = await auth.getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const project = await getProjectRepository().findById(id, user.id);
  if (!project || project.isDeleted) notFound();

  const { pq } = await searchParams;
  const keyword = pq?.trim() ?? "";

  const photoRepo = getPhotoRepository();
  const storage = await getServerStorage();
  const [photos, deletedPhotos] = await Promise.all([
    photoRepo.listByProject(project.id, keyword),
    photoRepo.listDeletedByProject(project.id),
  ]);
  const [photosWithUrl, deletedWithUrl] = await Promise.all([
    withUrls(storage, photos),
    withUrls(storage, deletedPhotos),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{project.projectName}</h1>
          {project.constructionName && (
            <p className="text-base text-gray-600">{project.constructionName}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/export/excel/${project.id}`}
            className="rounded-lg bg-green-600 px-4 py-2 text-base font-bold text-white hover:bg-green-700"
          >
            📊 Excel出力
          </a>
          <Link
            href={`/projects/${project.id}/print`}
            className="rounded-lg bg-red-500 px-4 py-2 text-base font-bold text-white hover:bg-red-600"
          >
            📄 PDF出力
          </Link>
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

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800">
          写真（{photos.length}枚{keyword ? ` / 「${keyword}」で絞り込み中` : ""}）
        </h2>
        {/* 写真の検索（コメント・ファイル名） */}
        <form method="GET" className="flex gap-2">
          <input
            type="search"
            name="pq"
            defaultValue={keyword}
            placeholder="コメント・ファイル名で検索"
            className="rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="submit"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-base text-gray-700 hover:bg-gray-50"
          >
            検索
          </button>
        </form>
      </div>

      <PhotoGrid photos={photosWithUrl} projectId={project.id} />
      <PhotoTrash photos={deletedWithUrl} projectId={project.id} />
    </div>
  );
}
