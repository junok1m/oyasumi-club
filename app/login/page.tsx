"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LineLoginButton from "@/components/LineLoginButton";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/profile";
  }
  return next;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      router.push(next);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[#fff4f8] px-5 py-10 text-[#4f3a4f]">
      <section className="mx-auto max-w-md">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-pink-400">
            🌙 おやすみクラブ
          </Link>

          <h1 className="mt-10 text-3xl font-bold tracking-[-0.04em]">
            ログイン
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#9b7892]">
            LINEアカウント、またはメールアドレスでログインできます。
          </p>
        </div>

        <div className="mt-8">
          <LineLoginButton />
        </div>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-pink-100" />
          <span className="text-xs font-bold text-[#b28aa8]">または</span>
          <div className="h-px flex-1 bg-pink-100" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-pink-100 bg-white/80 p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-xs font-bold text-[#9b7892]">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm outline-none focus:border-pink-300"
              required
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-xs font-bold text-[#9b7892]">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm outline-none focus:border-pink-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-[#4f3a4f] py-4 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? "ログイン中..." : "メールでログイン"}
          </button>

          <p className="mt-5 text-center text-sm text-[#9b7892]">
            アカウントをお持ちでない方は{" "}
            <Link href="/signup" className="font-bold text-pink-500 underline">
              新規登録
            </Link>
          </p>
        </form>

        <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white/80 p-6 text-sm leading-7 text-[#6f596b] shadow-sm">
          <p className="text-xs font-bold text-pink-400">PRIVACY</p>

          <h2 className="mt-2 text-xl font-bold text-[#4f3a4f]">
            LINEログインで取得する情報について
          </h2>

          <p className="mt-4">
            LINEログインでは、アカウント作成・本人確認・重要なお知らせの送信のために、
            LINEアカウントのメールアドレスを取得する場合があります。
          </p>

          <p className="mt-3">
            取得したメールアドレスは、おやすみクラブのログイン・アカウント管理以外の目的では使用しません。
          </p>

          <p className="mt-3">
            お客様の個人情報は、プライバシーポリシーに基づき適切に管理します。
          </p>

          <Link
            href="/privacy"
            className="mt-4 inline-block font-bold text-pink-500 underline"
          >
            プライバシーポリシーを見る
          </Link>
        </section>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-[#fff4f8]" />}>
      <LoginForm />
    </Suspense>
  );
}
