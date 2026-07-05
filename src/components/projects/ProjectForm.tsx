"use client";

/**
 * 現場の登録・編集で共用するフォーム。
 */
import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/app/(dashboard)/projects/actions";
import { FormMessage, SubmitButton } from "@/components/ui/FormParts";
import type { Project } from "@/lib/repositories";

const initialState: FormState = { ok: true, message: "" };

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-base font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">＊</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </label>
  );
}

export function ProjectForm({
  action,
  submitLabel,
  project,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  project?: Project;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="rounded-2xl bg-white p-6 shadow sm:p-8">
      <FormMessage ok={state.ok} message={state.message} />
      <form action={formAction}>
        <Field
          label="現場名"
          name="projectName"
          required
          defaultValue={project?.projectName}
          placeholder="例: 〇〇市学校改修現場"
        />
        <Field
          label="工事名"
          name="constructionName"
          defaultValue={project?.constructionName}
          placeholder="例: 外壁改修工事"
        />
        <Field
          label="顧客名"
          name="customerName"
          defaultValue={project?.customerName}
          placeholder="例: 〇〇建設株式会社"
        />
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field
            label="工期（開始日)"
            name="startDate"
            type="date"
            defaultValue={project?.startDate}
          />
          <Field
            label="工期（終了日）"
            name="endDate"
            type="date"
            defaultValue={project?.endDate}
          />
        </div>
        <label className="mb-4 block">
          <span className="mb-1 block text-base font-medium text-gray-700">
            備考
          </span>
          <textarea
            name="memo"
            rows={3}
            defaultValue={project?.memo ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
        <div className="flex gap-3">
          <Link
            href="/projects"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-center text-lg text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </Link>
          <div className="flex-1">
            <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
          </div>
        </div>
      </form>
    </div>
  );
}
