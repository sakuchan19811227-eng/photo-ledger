import { redirect } from "next/navigation";

/** /admin はユーザー管理タブへ転送 */
export default function AdminIndexPage() {
  redirect("/admin/users");
}
