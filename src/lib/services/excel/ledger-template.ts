/**
 * 工事写真台帳テンプレートの設定値。
 * レイアウトを変えたいときはこのファイルの数値を調整する。
 * （将来テンプレートを複数持つ場合は、この形のオブジェクトを増やして選択式にする）
 */
export const ledgerTemplate = {
  /** シート名 */
  sheetName: "写真台帳",
  /** 1ページ（A4縦）あたりの写真数 */
  photosPerPage: 3,
  /** 写真1枚分のブロックが占める行数 */
  rowsPerPhoto: 10,
  /** ヘッダー（表題・現場情報）が占める行数 */
  headerRows: 4,
  /** 写真の埋め込みサイズ（ピクセル） */
  photoWidth: 360,
  photoHeight: 270,
  /** 埋め込み前に縮小する画像の最大幅（ファイルサイズ削減） */
  resizeWidth: 800,
  /** JPEG変換品質 */
  jpegQuality: 80,
} as const;
