"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type FormState } from "../actions";
import {
  FormCard,
  FormMessage,
  SubmitButton,
  TextField,
} from "@/components/ui/FormParts";

const initialState: FormState = { ok: true, message: "" };

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState
  );

  return (
    <FormCard title="新規登録">
      <FormMessage ok={state.ok} message={state.message} />
      <form action={formAction}>
        <TextField
          label="お名前"
          name="name"
          placeholder="山田 太郎"
          autoComplete="name"
        />
        <TextField
          label="メールアドレス"
          name="email"
          type="email"
          placeholder="example@example.com"
          autoComplete="email"
        />
        <TextField
          label="パスワード（6文字以上）"
          name="password"
          type="password"
          autoComplete="new-password"
        />
        <TextField
          label="パスワード（確認のためもう一度）"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
        />
        <SubmitButton pending={pending}>登録する</SubmitButton>
      </form>
      <p className="mt-6 text-center text-base">
        すでに登録済みの方は{" "}
        <Link href="/login" className="font-bold text-blue-600 underline">
          ログイン
        </Link>
      </p>
    </FormCard>
  );
}
