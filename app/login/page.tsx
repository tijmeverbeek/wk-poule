"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [verzonden, setVerzonden] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const redirect = searchParams.get("redirect") ?? "/";
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setVerzonden(true);
  }

  if (verzonden) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-6">📬</div>
          <h1 className="text-2xl font-bold text-white mb-2">Check je mail!</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            We hebben een link gestuurd naar <span className="text-white font-medium">{email}</span>.
            Klik op de link in de mail om in te loggen.
          </p>
          <p className="text-zinc-600 text-xs mt-4">
            Geen mail ontvangen? Check je spam of probeer opnieuw.
          </p>
          <button
            onClick={() => setVerzonden(false)}
            className="mt-6 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Ander e-mailadres proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">STEELBALLS</h1>
          <p className="text-zinc-500 text-sm mt-1">WK Poule 2026</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-7 pt-7 pb-4">
            <h2 className="text-xl font-bold text-white">Inloggen</h2>
            <p className="text-zinc-400 text-sm mt-1">
              Vul je e-mailadres in. Je ontvangt een link om in te loggen — geen wachtwoord nodig.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="px-7 pb-7 pt-3 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
                E-mailadres
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jij@example.com"
                autoFocus
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? "Versturen..." : "Stuur magic link →"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-700 mt-6">
          Je ontvangt een eenmalige inloglink per mail
        </p>
      </div>
    </div>
  );
}

export default function LoginPagina() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
