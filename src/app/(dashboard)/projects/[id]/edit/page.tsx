/**
 * 現場の編集ページ。
 */
import { notFound, redirect } from "next/navigation";
import { getServerAuthService } from "@/lib/auth";
import { getProjectRepository } from "@/lib/repositories";
import { updateProjectAction } from "../../actions";
import { ProjectForm } from "@/components/projects/ProjectForm";

export default async function EditProjectPage({
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

  const action = updateProjectAction.bind(null, project.id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">現場の編集</h1>
      <ProjectForm action={action} submitLabel="保存する" project={project} />
    </div>
  );
}
