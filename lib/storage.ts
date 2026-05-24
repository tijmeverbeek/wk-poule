import { Voorspelling } from "./types";

// Exacte score: 3 punten, juiste uitslag (W/G/V): 1 punt
export function berekenPunten(
  voorspellingen: Voorspelling[],
  resultaten: Record<string, { thuis: number; uit: number }>
): number {
  let punten = 0;
  for (const vp of voorspellingen) {
    const resultaat = resultaten[vp.wedstrijdId];
    if (!resultaat || vp.thuis === null || vp.uit === null) continue;
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
