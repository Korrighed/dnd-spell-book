/** Niveau de deblocage de la sous-classe, par classe (regle du PHB, absente de l'API). */
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
