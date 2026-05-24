import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const API_KEY = process.env.FOOTBALL_API_KEY!;
const WK_ID = 2000;
const SEASON = 2026;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    `https://api.football-data.org/v4/competitions/${WK_ID}/matches?season=${SEASON}&stage=GROUP_STAGE`,
    { headers: { "X-Auth-Token": API_KEY }, next: { revalidate: 0 } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "API fout", status: res.status }, { status: 502 });
  }

  const data = await res.json();
  const matches = data.matches as {
    id: number;
    status: string;
    score: { fullTime: { home: number | null; away: number | null } };
  }[];

  const gespeeld = matches.filter(
    (m) => m.status === "FINISHED" && m.score.fullTime.home !== null
  );

  let bijgewerkt = 0;
  for (const m of gespeeld) {
    await prisma.resultaat.upsert({
      where: { wedstrijdId: String(m.id) },
      update: { thuis: m.score.fullTime.home!, uit: m.score.fullTime.away! },
      create: { wedstrijdId: String(m.id), thuis: m.score.fullTime.home!, uit: m.score.fullTime.away! },
    });
    bijgewerkt++;
  }

  return NextResponse.json({ bijgewerkt, totaalGespeeld: gespeeld.length });
}
