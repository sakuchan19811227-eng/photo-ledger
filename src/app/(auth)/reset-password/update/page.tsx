"use client";

import { useActionState } from "react";
import { updatePasswordAction, type FormState } from "../../actions";
import {
  FormCard,
  FormMessage,
  SubmitButton,
  TextField,
} from "@/components/ui/FormParts";

const initialState: FormState = { ok: true, message: "" };

export default function UpdatePasswordPage() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialState
  );

  return (
    <FormCard title="新しいパスワードの設定">
      <FormMessage ok={state.ok} message={state.message} />
      <form action={formAction}>
        <TextField
          label="新しいパスワード（6文字以上）"
          name="password"
          type="password"
          autoComplete="new-password"
        />
        <TextField
          label="新しいパスワード（確認のためもう一度）"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
        />
        <SubmitButton pending={pending}>パスワードを変更する</SubmitButton>
      </form>
    </FormCard>
  );
}
