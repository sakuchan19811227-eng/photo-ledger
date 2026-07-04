/**
 * 認証フォームで使い回す小さなUI部品。
 * 現場の高齢の方でも見やすいよう、文字とボタンは大きめにしている。
 */

export function FormCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
        {title}
      </h1>
      {children}
    </div>
  );
}

export function TextField({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-base font-medium text-gray-700">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </label>
  );
}

export function SubmitButton({
  children,
  pending,
}: {
  children: React.ReactNode;
  pending: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-3 text-lg font-bold text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? "処理中..." : children}
    </button>
  );
}

export function FormMessage({ ok, message }: { ok: boolean; message: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={`mb-4 rounded-lg p-3 text-base ${
        ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
      }`}
    >
      {message}
    </p>
  );
}
