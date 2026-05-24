import { Voorspelling, Wedstrijd } from "./types";

export function berekenPunten(
  voorspellingen: Voorspelling[],
  resultaten: Record<string, { thuis: number; uit: number }>,
  joinedAt?: Date,
  allWedstrijden?: Wedstrijd[]
): number {
  let punten = 0;
  for (const vp of voorspellingen) {
    const resultaat = resultaten[vp.wedstrijdId];
    if (!resultaat || vp.thuis === null || vp.uit === null) continue;

    if (joinedAt && allWedstrijden) {
      const wedstrijd = allWedstrijden.find((w) => w.id === vp.wedstrijdId);
      if (wedstrijd) {
        const matchTime = new Date(`${wedstrijd.datum}T${wedstrijd.tijd}`);
        if (matchTime < joinedAt) continue;
      }
    }

    if (vp.thuis === resultaat.thuis && vp.uit === resultaat.uit) {
      punten += 3;
    } else {
      const uitslag = Math.sign(resultaat.thuis - resultaat.uit);
      const vpUitslag = Math.sign((vp.thuis ?? 0) - (vp.uit ?? 0));
      if (uitslag === vpUitslag) punten += 1;
    }
  }
  return punten;
}

export function berekenDeelnemerStats(
  d: { voorspellingen: Voorspelling[]; aangemaaktOp: string },
  resultaten: Record<string, { thuis: number; uit: number }>,
  allWedstrijden: Wedstrijd[]
) {
  const joinedAt = new Date(d.aangemaaktOp);
  const gespeeldeWedstrijden = allWedstrijden.filter((w) => resultaten[w.id]);

  const voorInschrijving = gespeeldeWedstrijden.filter((w) => {
    const matchTime = new Date(`${w.datum}T${w.tijd}`);
    return matchTime < joinedAt;
  });

  const gemist = gespeeldeWedstrijden.filter((w) => {
    if (voorInschrijving.some((v) => v.id === w.id)) return false;
    const vp = d.voorspellingen.find((v) => v.wedstrijdId === w.id);
    return !vp || vp.thuis === null || vp.uit === null;
  });

  const punten = berekenPunten(d.voorspellingen, resultaten, joinedAt, allWedstrijden);
  const ingevuld = d.voorspellingen.filter((v) => v.thuis !== null && v.uit !== null).length;

  return {
    punten,
    ingevuld,
    lateInstapper: voorInschrijving.length > 0,
    aantalVoorInschrijving: voorInschrijving.length,
    aantalGemist: gemist.length,
  };
}
