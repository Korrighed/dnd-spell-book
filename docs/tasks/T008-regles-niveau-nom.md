# T008 — Écrire les règles de niveau total et de nom unique

Statut : à faire
Story : US-01, US-03 · Exigences : D-04, D-08 ([DESIGN-BRIEF.md §8](../DESIGN-BRIEF.md#8-décisions-du-2026-10-15-questions-résolues))
Dépend de : T001
Parallélisable : oui (aucun fichier existant modifié)
Exécutant : workflow:back

## Objectif

Deux modules de fonctions pures, sans React, utilisés ensuite par la vue Personnage : le plafond de niveau total en multiclasse, et la validation des noms de personnage.

## Fichiers à lire

- `src/hooks/usePersonalSpellbook.ts` — type `SpellcasterProfile` (exporté), constantes `MIN_CHARACTER_LEVEL`, `MAX_CHARACTER_LEVEL`.
- `src/utils/text.ts` — `normalizeForSearch` (minuscules, sans accents).
- `src/utils/spellSort.ts` — convention d'un module utilitaire du projet (commentaires en français sans accents, exports nommés).

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/utils/characterLevels.ts` | créer | plafond de niveau |
| `src/utils/characterName.ts` | créer | validation de nom |

## Étapes

1. Créer `src/utils/characterLevels.ts` avec exactement ces exports :

```ts
import { MAX_CHARACTER_LEVEL, type SpellcasterProfile } from '../hooks/usePersonalSpellbook'

/** Niveau total maximal d'un personnage, toutes classes confondues (regle D&D). */
export const MAX_TOTAL_CHARACTER_LEVEL = 20

/**
 * Somme des niveaux PRECISES des profils. Un niveau `null` (« non precise »)
 * ne compte pas : il signifie « tous les sorts de la classe », pas un niveau
 * reel (decision D-04, docs/DESIGN-BRIEF.md).
 */
export function totalSpecifiedLevel(profiles: SpellcasterProfile[]): number {
  return profiles.reduce((sum, profile) => sum + (profile.characterLevel ?? 0), 0)
}

/**
 * Plus haut niveau proposable pour le profil `profileId` : le plafond total
 * moins les niveaux precises des AUTRES profils, borne entre 0 et
 * MAX_CHARACTER_LEVEL. `profileId` null : profil pas encore cree (carte
 * « Ajouter une classe »), tous les profils comptent comme « autres ».
 * 0 : seule l'option « non precise » reste possible.
 */
export function maxLevelForProfile(
  profiles: SpellcasterProfile[],
  profileId: string | null,
): number {
  const others = profiles.filter((profile) => profile.id !== profileId)
  const remaining = MAX_TOTAL_CHARACTER_LEVEL - totalSpecifiedLevel(others)
  return Math.max(0, Math.min(MAX_CHARACTER_LEVEL, remaining))
}
```

2. Créer `src/utils/characterName.ts` avec exactement ces exports :

```ts
import { normalizeForSearch } from './text'

/** Longueur maximale d'un nom de personnage (pastilles, liste, confirmation). */
export const MAX_CHARACTER_NAME_LENGTH = 40

/**
 * Nom tel qu'enregistre : caracteres invisibles (espaces de largeur nulle,
 * BOM) retires, puis espaces de debut et de fin. Sinon un nom fait de ces
 * seuls caracteres passerait pour non vide et donnerait une pastille vide.
 */
export function cleanCharacterName(name: string): string {
  return name.replace(/[​-‍﻿]/g, '').trim()
}

/**
 * Vrai si un AUTRE personnage porte deja ce nom, sans tenir compte des
 * majuscules ni des accents (« Elodie » = « élodie »). `exceptId` : le
 * personnage en cours de renommage, qui peut garder son propre nom.
 */
export function isCharacterNameTaken(
  characters: { id: string; name: string }[],
  name: string,
  exceptId: string | null = null,
): boolean {
  const key = normalizeForSearch(cleanCharacterName(name))
  return characters.some(
    (character) =>
      character.id !== exceptId && normalizeForSearch(cleanCharacterName(character.name)) === key,
  )
}
```

3. Ne modifier aucun autre fichier. Les modules ne sont pas encore importés : c'est voulu (T009, T011).

4. Lancer la vérification.

## Critères d'acceptation

- [ ] AC-01 : `npm run lint` et `npm run build` passent (pas d'import inutilisé, types exacts).
- [ ] AC-02 : Par lecture du code : `maxLevelForProfile([{…id:'a', characterLevel:5}, {…id:'b', characterLevel:null}], 'b')` vaut 15 ; avec `'a'` vaut 20 ; avec `null` vaut 15.
- [ ] AC-03 : Par lecture du code : `maxLevelForProfile` de deux profils à 12 et 12, pour l'un d'eux, vaut 8 ; pour `null`, vaut 0 (jamais négatif).
- [ ] AC-04 : Par lecture du code : `isCharacterNameTaken([{id:'1',name:'Élodie'}], ' elodie ')` vaut `true` ; avec `exceptId '1'` vaut `false`.
- [ ] AC-05 : Par lecture du code : `cleanCharacterName('​ ​')` vaut `''`.

## Vérification

```bash
npm run lint
npm run build
```

Vérification navigateur : aucune (modules non branchés).

## Hors périmètre

- Toute modification de `usePersonalSpellbook.ts` (pas de validation dans le hook).
- Ajout d'un framework de test.

## Notes d'exécution
