export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <p className="mb-4 text-center text-3xl font-bold text-blue-700">
          📷 写真台帳
        </p>
        {children}
      </div>
    </div>
  );
}
