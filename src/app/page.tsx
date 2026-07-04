/**
 * トップページ。ログイン状態に応じて適切なページへ振り分けるだけ。
 */
import { redirect } from "next/navigation";
import { getServerAuthService } from "@/lib/auth";

export default async function Home() {
  const auth = await getServerAuthService();
  const user = await auth.getCurrentUser();
  redirect(user ? "/projects" : "/login");
}
