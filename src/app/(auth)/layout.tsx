import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center">
          <p className="text-3xl font-bold text-blue-700">📷 写真台帳</p>
          <p className="mt-1 mb-4 text-sm text-gray-500">
            写真から工事写真台帳（Excel・PDF）をかんたん作成
          </p>
        </Link>
        {children}
        <p className="mt-4 text-center text-sm">
          <Link href="/" className="text-gray-400 underline">
            アプリの紹介を見る
          </Link>
        </p>
      </div>
    </div>
  );
}
