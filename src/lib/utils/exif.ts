/**
 * 写真のEXIF（撮影情報）から撮影日時を読み取る。
 * 読み取れない場合は null（スクリーンショット等はEXIFを持たない）。
 */
import exifr from "exifr";

export async function extractTakenAt(data: ArrayBuffer): Promise<Date | null> {
  try {
    const exif = await exifr.parse(data, { pick: ["DateTimeOriginal", "CreateDate"] });
    const value: unknown = exif?.DateTimeOriginal ?? exif?.CreateDate;
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}
