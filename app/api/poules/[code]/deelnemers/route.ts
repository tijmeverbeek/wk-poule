import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/supabase/server";

export async function POST(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const authUser = await getAuthUser();
  if (!authUser) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { code } = await params;

  const poule = await prisma.poule.findUnique({ where: { code } });
  if (!poule) return NextResponse.json({ error: "Poule niet gevonden" }, { status: 404 });

  const existing = await prisma.deelnemer.findUnique({
    where: { userId_pouleId: { userId: authUser.id, pouleId: poule.id } },
  });

  if (existing) {
    return NextResponse.json({ deelnemerId: existing.id });
  }

  const deelnemer = await prisma.deelnemer.create({
    data: { userId: authUser.id, pouleId: poule.id },
  });

  return NextResponse.json({ deelnemerId: deelnemer.id });
}
