"use client";

/**
 * 写真アップローダ。
 * - PCではドラッグ＆ドロップ / クリックでファイル選択
 * - スマホではタップでカメラロールから選択（複数枚OK）
 */
import { useCallback, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import {
  uploadPhotosAction,
  type UploadReport,
} from "@/app/(dashboard)/projects/[id]/photo-actions";

export function PhotoUploader({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [report, setReport] = useState<UploadReport | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const formData = new FormData();
      for (const file of acceptedFiles) {
        formData.append("photos", file);
      }
      startTransition(async () => {
        const result = await uploadPhotosAction(projectId, formData);
        setReport(result);
        router.refresh();
      });
    },
    [projectId, router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/heic": [".heic"],
      "image/heif": [".heif"],
    },
    disabled: pending,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-4 border-dashed p-8 text-center transition ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
        } ${pending ? "pointer-events-none opacity-60" : ""}`}
      >
        <input {...getInputProps()} />
        {pending ? (
          <p className="text-lg font-bold text-blue-600">アップロード中...</p>
        ) : isDragActive ? (
          <p className="text-lg font-bold text-blue-600">ここに写真を置いてください</p>
        ) : (
          <>
            <p className="text-4xl">📷</p>
            <p className="mt-2 text-lg font-bold text-gray-700">
              写真をここにドラッグ＆ドロップ
            </p>
            <p className="mt-1 text-base text-gray-500">
              またはタップ／クリックして選択（複数枚OK・1枚20MBまで）
            </p>
          </>
        )}
      </div>

      {report && (
        <div
          className={`mt-4 rounded-lg p-4 text-base ${
            report.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          <p className="font-bold">{report.message}</p>
          {report.results.some((r) => !r.ok) && (
            <ul className="mt-2 list-inside list-disc space-y-1">
              {report.results
                .filter((r) => !r.ok)
                .map((r, i) => (
                  <li key={i}>
                    {r.fileName}: {r.detail}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
