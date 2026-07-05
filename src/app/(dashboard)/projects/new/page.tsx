/**
 * 現場の新規登録ページ。
 */
import { createProjectAction } from "../actions";
import { ProjectForm } from "@/components/projects/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">現場の新規登録</h1>
      <ProjectForm action={createProjectAction} submitLabel="登録する" />
    </div>
  );
}
