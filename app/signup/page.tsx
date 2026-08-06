"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
          data: {
            role,
          },
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Signup successful. Check your email.");
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="w-[80%] mx-auto px-6 py-8">
      <h1 className="mb-8 text-2xl font-semibold">Sign up</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b py-2 outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b py-2 outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border-b py-2 outline-none"
          >
            <option value="client">Client</option>
            <option value="girl">Girl</option>
            <option value="shop">Shop</option>
          </select>
        </div>

        <p className="text-xs text-gray-500">
          Once you choose your role, you can’t change it later.
        </p>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="text-sm underline">
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </div>
      </form>
    </main>
  );
}