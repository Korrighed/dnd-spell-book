/**
 * Niveau de personnage auquel la sous-classe (specialisation) se debloque,
 * par classe. Regle fixe du PHB, aucun endpoint de l'API ne l'expose
 * directement. Verifie le 2026-09-21 via `/classes/{class}/levels/{1,2,3}` :
 * le niveau varie selon la classe, ce n'est pas uniformement 3.
 */
export const SUBCLASS_UNLOCK_LEVEL: Record<string, number> = {
  cleric: 1,
  sorcerer: 1,
  warlock: 1,
  druid: 2,
  wizard: 2,
  barbarian: 3,
  bard: 3,
  fighter: 3,
  monk: 3,
  paladin: 3,
  ranger: 3,
  rogue: 3,
}

/** 3 par defaut si une classe future n'est pas dans la table. */
export function getSubclassUnlockLevel(classIndex: string): number {
  return SUBCLASS_UNLOCK_LEVEL[classIndex] ?? 3
}
