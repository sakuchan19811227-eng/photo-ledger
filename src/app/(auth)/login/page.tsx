"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type FormState } from "../actions";
import {
  FormCard,
  FormMessage,
  SubmitButton,
  TextField,
} from "@/components/ui/FormParts";

const initialState: FormState = { ok: true, message: "" };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <FormCard title="ログイン">
      <FormMessage ok={state.ok} message={state.message} />
      <form action={formAction}>
        <TextField
          label="メールアドレス"
          name="email"
          type="email"
          placeholder="example@example.com"
          autoComplete="email"
        />
        <TextField
          label="パスワード"
          name="password"
          type="password"
          autoComplete="current-password"
        />
        <SubmitButton pending={pending}>ログインする</SubmitButton>
      </form>
      <div className="mt-6 space-y-2 text-center text-base">
        <p>
          はじめての方は{" "}
          <Link href="/register" className="font-bold text-blue-600 underline">
            新規登録
          </Link>
        </p>
        <p>
          <Link href="/reset-password" className="text-gray-500 underline">
            パスワードを忘れた場合
          </Link>
        </p>
      </div>
    </FormCard>
  );
}
