"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "verifying" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
    setStep("code");
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setStatus("verifying");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">
            AIレシート家計簿
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            レシートを撮るだけで自動記録
          </p>
        </div>

        <Card>
          {step === "code" ? (
            <form
              onSubmit={handleVerifyCode}
              className="flex flex-col gap-4"
            >
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  確認コードを入力してください
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {email} 宛に6桁のコードを送信しました。
                  メールに記載のコードを入力してください。
                </p>
              </div>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                label="確認コード"
                placeholder="123456"
                maxLength={6}
                required
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/[^0-9]/g, ""))
                }
                error={status === "error" ? errorMessage : undefined}
              />
              <Button type="submit" disabled={status === "verifying"}>
                {status === "verifying" ? "確認中..." : "ログイン"}
              </Button>
              <button
                type="button"
                className="text-xs text-gray-500 underline"
                onClick={() => {
                  setStep("email");
                  setStatus("idle");
                  setCode("");
                  setErrorMessage("");
                }}
              >
                メールアドレスを入力し直す
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              <Input
                id="email"
                type="email"
                label="メールアドレス"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={status === "error" ? errorMessage : undefined}
              />
              <Button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "送信中..." : "確認コードを送信"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
