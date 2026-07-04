"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetRequestAction, type FormState } from "../actions";
import {
  FormCard,
  FormMessage,
  SubmitButton,
  TextField,
} from "@/components/ui/FormParts";

const initialState: FormState = { ok: true, message: "" };

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(
    resetRequestAction,
    initialState
  );

  return (
    <FormCard title="パスワード再設定">
      <p className="mb-4 text-base text-gray-600">
        登録したメールアドレスを入力してください。再設定用のリンクをお送りします。
      </p>
      <FormMessage ok={state.ok} message={state.message} />
      <form action={formAction}>
        <TextField
          label="メールアドレス"
          name="email"
          type="email"
          placeholder="example@example.com"
          autoComplete="email"
        />
        <SubmitButton pending={pending}>再設定メールを送る</SubmitButton>
      </form>
      <p className="mt-6 text-center text-base">
        <Link href="/login" className="text-gray-500 underline">
          ログインに戻る
        </Link>
      </p>
    </FormCard>
  );
}
