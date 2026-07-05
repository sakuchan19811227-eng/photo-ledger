/**
 * 工事写真台帳のExcel生成サービス。
 * 入力（現場情報＋写真データ）を受け取り、ExcelJSでワークブックを組み立てる。
 * レイアウトの数値は ledger-template.ts に集約。
 */
import ExcelJS from "exceljs";
import sharp from "sharp";
import { ledgerTemplate as T } from "./ledger-template";

export type LedgerPhoto = {
  /** 画像の中身（ストレージから取得したもの） */
  data: ArrayBuffer;
  fileName: string;
  comment: string | null;
  takenAt: Date | null;
};

export type LedgerInput = {
  projectName: string;
  constructionName: string | null;
  customerName: string | null;
  periodLabel: string;
  photos: LedgerPhoto[];
};

function formatTakenAt(takenAt: Date | null): string {
  if (!takenAt) return "";
  return takenAt.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 画像をExcel埋め込み用のJPEGに変換・縮小する（失敗時は null） */
async function toJpeg(data: ArrayBuffer): Promise<Buffer | null> {
  try {
    return await sharp(Buffer.from(data))
      .rotate() // EXIFの回転情報を反映
      .resize({ width: T.resizeWidth, withoutEnlargement: true })
      .jpeg({ quality: T.jpegQuality })
      .toBuffer();
  } catch {
    return null; // HEIC等、環境によって変換できない形式
  }
}

export async function buildLedgerWorkbook(input: LedgerInput): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(T.sheetName, {
    pageSetup: {
      paperSize: 9, // A4
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 },
    },
  });

  // 列幅（A〜E: 写真エリア / F〜I: 情報エリア）
  sheet.columns = [
    { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
  ];

  // ---- ヘッダー（表題と現場情報） ----
  sheet.mergeCells("A1:I1");
  const title = sheet.getCell("A1");
  title.value = "工　事　写　真　台　帳";
  title.font = { size: 16, bold: true };
  title.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 28;

  sheet.mergeCells("A2:B2");
  sheet.getCell("A2").value = "現場名";
  sheet.mergeCells("C2:I2");
  sheet.getCell("C2").value = input.projectName;

  sheet.mergeCells("A3:B3");
  sheet.getCell("A3").value = "工事名";
  sheet.mergeCells("C3:E3");
  sheet.getCell("C3").value = input.constructionName ?? "";
  sheet.getCell("F3").value = "工期";
  sheet.mergeCells("G3:I3");
  sheet.getCell("G3").value = input.periodLabel;

  sheet.mergeCells("A4:B4");
  sheet.getCell("A4").value = "顧客名";
  sheet.mergeCells("C4:I4");
  sheet.getCell("C4").value = input.customerName ?? "";

  for (let r = 2; r <= T.headerRows; r++) {
    sheet.getRow(r).eachCell({ includeEmpty: false }, (cell) => {
      cell.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle" };
    });
  }

  // ---- 写真ブロック ----
  for (let i = 0; i < input.photos.length; i++) {
    const photo = input.photos[i];
    const blockTop = T.headerRows + 1 + i * T.rowsPerPhoto; // 1-indexed 開始行

    // ページ区切り（photosPerPage 枚ごと）
    if (i > 0 && i % T.photosPerPage === 0) {
      sheet.getRow(blockTop - 1).addPageBreak();
    }

    // 写真エリア（A〜E列を rowsPerPhoto-1 行ぶん確保）
    const jpeg = await toJpeg(photo.data);
    if (jpeg) {
      const imageId = workbook.addImage({ buffer: jpeg as never, extension: "jpeg" });
      sheet.addImage(imageId, {
        tl: { col: 0, row: blockTop - 1 } as never,
        ext: { width: T.photoWidth, height: T.photoHeight },
      });
    } else {
      sheet.getCell(blockTop, 1).value = `（画像を変換できませんでした: ${photo.fileName}）`;
    }

    // 情報エリア（F〜I列）
    const infoCol = 6; // F列
    sheet.getCell(blockTop, infoCol).value = "No.";
    sheet.getCell(blockTop, infoCol + 1).value = i + 1;
    sheet.getCell(blockTop + 1, infoCol).value = "撮影日時";
    sheet.mergeCells(blockTop + 1, infoCol + 1, blockTop + 1, infoCol + 3);
    sheet.getCell(blockTop + 1, infoCol + 1).value = formatTakenAt(photo.takenAt);
    sheet.getCell(blockTop + 2, infoCol).value = "内容";
    sheet.mergeCells(blockTop + 2, infoCol, blockTop + 8, infoCol);
    sheet.mergeCells(blockTop + 2, infoCol + 1, blockTop + 8, infoCol + 3);
    const commentCell = sheet.getCell(blockTop + 2, infoCol + 1);
    commentCell.value = photo.comment ?? "";
    commentCell.alignment = { vertical: "top", wrapText: true };

    // 行の高さ（写真がだいたい収まるように）
    for (let r = blockTop; r < blockTop + T.rowsPerPhoto - 1; r++) {
      sheet.getRow(r).height = 22;
    }
  }

  return workbook;
}
