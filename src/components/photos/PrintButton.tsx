"use client";

/** ブラウザの印刷ダイアログ（→PDFに保存）を開くボタン */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-blue-600 px-5 py-3 text-lg font-bold text-white hover:bg-blue-700"
    >
      🖨 印刷 / PDFに保存
    </button>
  );
}
