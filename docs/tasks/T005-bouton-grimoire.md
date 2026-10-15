# T005 — Réparer l'infobulle et le clavier du bouton grimoire

Statut : à faire
Story : constats B1, B2 · Exigences : [DESIGN-BRIEF.md §4](../DESIGN-BRIEF.md#4-composants) (infobulle sous le bouton), §7
Dépend de : T004
Parallélisable : non
Exécutant : workflow:front

## Objectif

L'infobulle de l'appui long s'affiche sous le bouton, entièrement visible. Le clavier (Entrée, Espace) déclenche toujours l'action, même après un appui long relâché hors du bouton.

## Fichiers à lire

- `src/components/SpellbookToggle.tsx` — `suppressClickRef`, `onClick`.
- `src/App.css` — règle `#grimoire .spellbook-tooltip`.
- `src/components/BookSpread.css` ligne 78 — `.book-page { overflow-y: auto }` (cause du rognage vers le haut).

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/components/SpellbookToggle.tsx` | modifier | `onClick` |
| `src/App.css` | modifier | position de l'infobulle |

## Étapes

1. `src/components/SpellbookToggle.tsx` : remplacer le gestionnaire `onClick` par :

```tsx
        onClick={(event) => {
          // detail === 0 : clic synthetique du clavier (Entree / Espace).
          // Le clavier agit toujours : un appui long relache HORS du bouton
          // ne produit pas de click et laissait suppressClickRef a true, ce
          // qui avalait le prochain Entree.
          const fromKeyboard = event.detail === 0
          const suppress = suppressClickRef.current && !fromKeyboard
          suppressClickRef.current = false
          if (suppress) return
          onToggle()
        }}
```

2. Dans le JSDoc du composant, ajouter à la fin : « Clavier : jamais bloque par un appui long precedent (event.detail === 0). ».

3. `src/App.css`, règle `#grimoire .spellbook-tooltip` :
   - remplacer `bottom: calc(100% + 6px);` par `top: calc(100% + 6px);` ;
   - commentaire au-dessus : « Infobulle de l'appui maintenu, SOUS le bouton : au-dessus, elle sortait de la page (.book-page, overflow-y: auto) et etait coupee, le bouton etant sur la premiere ligne de la fiche. ».

4. Lancer la vérification.

## Critères d'acceptation

- [ ] AC-01 : Desktop, fiche ouverte : maintenir le clic 700 ms sur le bouton grimoire. L'infobulle « Ajouter au grimoire personnel » est entièrement visible sous le bouton (capture). Relâcher : l'état du sort ne change pas.
- [ ] AC-02 : Maintenir 700 ms, glisser hors du bouton, relâcher. Puis focus clavier sur le bouton et Entrée : l'état change dès le premier Entrée.
- [ ] AC-03 : Clic court : l'état change (ajout puis retrait).
- [ ] AC-04 : Entrée et Espace au clavier changent l'état à chaque appui.
- [ ] AC-05 : Mobile 390×844 : même contrôle qu'AC-01, infobulle visible et non coupée par le bord droit de l'écran (capture).

## Vérification

```bash
npm run lint
npm run build
```

Vérification navigateur : AC-01 à AC-05 (souris émulée pour l'appui long : `mouse.down`, attente 700 ms, `mouse.up`).

## Hors périmètre

- Icônes (T004, faite).
- Anti-rebond du double clic.
- `title` du bouton.

## Notes d'exécution
