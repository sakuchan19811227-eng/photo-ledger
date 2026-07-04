/**
 * 現場一覧ページ。
 * Step3（現場管理）で本実装する。今はログイン成功の確認用プレースホルダ。
 */
export default function ProjectsPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-800">現場一覧</h1>
      <div className="rounded-2xl bg-white p-8 text-center shadow">
        <p className="text-lg text-gray-600">
          🎉 ログインに成功しました！
        </p>
        <p className="mt-2 text-base text-gray-500">
          現場の登録・一覧はこの次のステップ（Step3: 現場管理）で作ります。
        </p>
      </div>
    </div>
  );
}
