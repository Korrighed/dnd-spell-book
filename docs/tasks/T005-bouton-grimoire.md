# T005 — Réparer l'infobulle et le clavier du bouton grimoire

Statut : fait
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

- Étapes 1 à 3 appliquées (`SpellbookToggle.tsx` : `onClick` + JSDoc ; `App.css` : `top` au lieu de `bottom`, commentaire).
- `npm run lint` : pass. `npm run build` : pass. Avertissement « chunk > 500 kB » pré-existant, aucun import ajouté.
- AC-01 à AC-05 : non vérifiés dans le navigateur (vérification réservée au verifier).
- Point à surveiller en AC-05 (390×844) : `left: 0` inchangé. L'infobulle est ancrée au bord gauche du bouton, `white-space: nowrap`. Si elle dépasse le bord droit, le correctif est horizontal et hors des étapes de cette tâche.
- Retour 1 appliqué (`App.css`, `#grimoire .spellbook-tooltip` : `left: 50%` + `translate: -50% 0`, `width: max-content`, `max-width: 200px`, `white-space: normal`, `text-align: center`). `npm run lint` : pass. `npm run build` : pass, avertissement chunk pré-existant. AC-05 et AC-06 non vérifiés dans le navigateur.

## Retour de vérification

Retour 1 (2026-10-15). AC-01 à AC-04 validés en navigateur. **AC-05 en échec** : à 390×844, le bouton est à x 181-221, l'infobulle (`left: 0`, `white-space: nowrap`, ~174 px) va jusqu'à x 351-355, alors que la page `.book-page` (overflow auto) s'arrête à x 316. Elle est coupée de 35 à 38 px et ajoute une barre de défilement horizontale à la page.

Correction à appliquer, dans `src/App.css`, règle `#grimoire .spellbook-tooltip` seulement :

1. Remplacer `left: 0;` par :

```css
  /* Centree sous le bouton : ancree a gauche, elle debordait de la page
     a droite en mobile (bouton au milieu d'une page de 250px). */
  left: 50%;
  translate: -50% 0;
```

2. Remplacer `white-space: nowrap;` par :

```css
  /* Retour a la ligne au-dela de 200px (libelle anglais plus long). */
  width: max-content;
  max-width: 200px;
  white-space: normal;
  text-align: center;
```

3. Ne rien changer d'autre (position verticale `top: calc(100% + 6px)` conservée).

Critère ajouté :

- [ ] AC-06 : À 390×844, pour « Ajouter… » et « Retirer… » : les bords gauche et droit de l'infobulle sont dans ceux de `.spell-detail-panel`, et `scrollWidth === clientWidth` sur ce panneau pendant l'affichage. À 1440×900, AC-01 toujours vrai.
