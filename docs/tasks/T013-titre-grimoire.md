# T013 — Nommer le personnage dans le titre du grimoire

Statut : à faire
Story : US-01 · Exigences : D-07 ([DESIGN-BRIEF.md §8](../DESIGN-BRIEF.md#8-décisions-du-2026-10-15-questions-résolues))
Dépend de : T012
Parallélisable : non
Exécutant : workflow:front

## Objectif

La vue Grimoire s'intitule « Grimoire de Gandalf (3) », ou « Grimoire d'Elminster (3) » devant une voyelle. En anglais : « Gandalf's spellbook (3) ».

## Fichiers à lire

- `src/components/SpellbookView.tsx` — titre actuel.
- `src/App.tsx` — `characters`, `activeCharacterId` (issus de `usePersonalSpellbook`), rendu de `<SpellbookView>`.

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/components/SpellbookView.tsx` | modifier | prop `characterName`, titre |
| `src/App.tsx` | modifier | passe le nom du personnage actif |

## Étapes

1. `src/components/SpellbookView.tsx` :
   - ajouter la prop `characterName: string` (doc : « Nom du personnage actif, affiche dans le titre. ») ;
   - au-dessus du composant, ajouter :

```tsx
/** « de Gandalf », « d'Elminster » : elision devant une voyelle ou un h. */
function frenchOf(name: string): string {
  return /^[aeiouyhàâäéèêëîïôöùûüœæ]/i.test(name) ? `d’${name}` : `de ${name}`
}
```

   - remplacer le `title` par : `` `${t(`Grimoire ${frenchOf(characterName)}`, `${characterName}'s spellbook`)} (${spells.length})` `` ;
   - JSDoc du composant : « Liste du grimoire du personnage actif. Titre : nom du personnage et compteur (D-07). ».

2. `src/App.tsx` :
   - avant le `return`, ajouter : `const activeCharacterName = characters.find((character) => character.id === activeCharacterId)?.name ?? ''` ;
   - sur `<SpellbookView …>`, ajouter `characterName={activeCharacterName}`.

3. Lancer la vérification.

## Critères d'acceptation

- [ ] AC-01 : Personnage « Gandalf » avec 2 sorts : titre « GRIMOIRE DE GANDALF (2) ».
- [ ] AC-02 : Personnage « Elminster » : « GRIMOIRE D’ELMINSTER (0) ».
- [ ] AC-03 : Changer de personnage dans la vue Personnage, rouvrir le Grimoire : le titre suit.
- [ ] AC-04 : Renommer le personnage : le titre suit.

## Vérification

```bash
npm run lint
npm run build
```

Vérification navigateur : AC-01 à AC-04 à 1440×900.

## Hors périmètre

- Contenu de la vue Grimoire, `PersonalSpellbookPanel`.
- Afficher le nom ailleurs (onglet, barre d'outils).

## Notes d'exécution

- Étapes 1 et 2 appliquées (`SpellbookView.tsx`, `App.tsx`). Aucun autre fichier touché.
- `npm run lint` : pass.
- `npm run build` : pass (exit 0). Avertissement « chunk > 500 kB » pré-existant (bundle three.js), non lié à cette tâche.
- AC-01 à AC-04 (navigateur, 1440×900) : non vérifiés par l'exécutant, à faire par le vérificateur.
- Point de vigilance : `?? ''` dans `App.tsx` n'est pas atteignable en usage normal (`usePersonalSpellbook` garantit un `activeCharacterId` valide). Si atteint, le titre serait « Grimoire de  (N) ».
- `frenchOf` élide devant tout `h` : pas de distinction h muet / h aspiré. Conforme à l'étape 1, limite connue.
- Hors périmètre laissé tel quel : libellé « Grimoire personnel » dans `src/components/Bookmarks.tsx` (barre d'outils).
