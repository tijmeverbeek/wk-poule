"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPoule, joinPoule } from "@/lib/api";
import { getSessie, saveSessie } from "@/lib/storage";

export default function JoinPagina() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [poulenaam, setPoulenaam] = useState<string | null>(null);
  const [naam, setNaam] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Al ingelogd in deze poule? Ga direct door.
    const sessie = getSessie();
    if (sessie?.code === code) {
      router.push(`/poule/${code}`);
      return;
    }
    getPoule(code).then((p) => {
      if (!p) { setNotFound(true); return; }
      setPoulenaam(p.naam);
    });
  }, [code, router]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!naam.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await joinPoule(code, naam.trim());
      if (!result) { setError("Poule niet gevonden."); setLoading(false); return; }
      saveSessie({ code, deelnemerId: result.deelnemerId });
      router.push(`/poule/${code}`);
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
      setLoading(false);
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🤔</div>
          <h1 className="text-xl font-bold text-white mb-2">Poule niet gevonden</h1>
          <p className="text-zinc-500 mb-6">Controleer of de link correct is.</p>
          <Link href="/" className="text-green-400 hover:text-green-300 text-sm font-medium">
            ← Naar home
          </Link>
        </div>
      </div>
    );
  }

  if (!poulenaam) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-green-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-white tracking-tight">
            STEELBALLS
          </Link>
          <p className="text-zinc-500 text-sm mt-1">WK Poule 2026</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-7 pt-7 pb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-1">
              Je bent uitgenodigd
            </p>
            <h1 className="text-2xl font-bold text-white">{poulenaam}</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Vul je naam in om mee te doen.
            </p>
          </div>

          <form onSubmit={handleJoin} className="px-7 pb-7 pt-3 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
                Jouw naam
              </label>
              <input
                type="text"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                placeholder="Bijv. Emma"
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
              {loading ? "Deelnemen..." : "Doe mee aan de poule →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
