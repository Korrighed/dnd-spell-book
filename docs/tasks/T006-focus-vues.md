# T006 — Garder le focus dans les vues ouvertes

Statut : fait
Story : US-05, constat B3 · Exigences : [APP-FLOW.md §5](../APP-FLOW.md#5-clavier-et-accessibilité-du-parcours)
Dépend de : T005
Parallélisable : non
Exécutant : workflow:front

## Objectif

Quand une vue est ouverte, Tab et Maj+Tab bouclent dans la vue sans en sortir, y compris autour d'un groupe de boutons radio. Un clic sur du texte de la vue garde le focus dans la vue, donc Échap la ferme toujours. Le bouton œil et la recherche ne sont plus atteignables derrière une vue ouverte. Les onglets restent cliquables à la souris.

## Fichiers à lire

- `src/components/BookmarkView.tsx` — `onKeyDown`, `titleRef`, `<section>`.
- `src/components/FiltersView.tsx` lignes 71-84 — groupe radio « Trier la liste » (dernier élément de la vue Filtres).
- `src/App.tsx` lignes 219-264 — `.toolbar` (inert pendant l'aide), `.search-bar`.
- `src/App.css` — règle `#grimoire .bookmark-view h2:focus`.

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/components/BookmarkView.tsx` | modifier | boucle de tabulation, section focusable par script |
| `src/App.tsx` | modifier | `.search-bar` inerte quand une vue est ouverte |
| `src/App.css` | modifier | pas d'anneau de focus sur la section |

## Étapes

1. `src/components/BookmarkView.tsx` : au-dessus du composant, ajouter :

```tsx
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Arrets de tabulation de `root`, dans l'ordre du document : elements
 * visibles seulement, et un seul arret par groupe de boutons radio (le
 * bouton coche, ou le premier du groupe si aucun ne l'est), comme le
 * navigateur.
 */
function tabStopsIn(root: HTMLElement): HTMLElement[] {
  const visible = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => element.getClientRects().length > 0,
  )
  return visible.filter((element) => {
    if (!(element instanceof HTMLInputElement) || element.type !== 'radio' || !element.name) {
      return true
    }
    const group = visible.filter(
      (other) =>
        other instanceof HTMLInputElement && other.type === 'radio' && other.name === element.name,
    ) as HTMLInputElement[]
    const checked = group.find((radio) => radio.checked)
    return element === (checked ?? group[0])
  })
}
```

2. Sur la `<section>`, ajouter `tabIndex={-1}`. Raison, en commentaire JSX au-dessus de la section : « tabIndex -1 : un clic sur du texte de la vue y laisse le focus (sinon il part sur body et Echap ne ferme plus rien). Pas dans l'ordre de tabulation. ».

3. Remplacer le gestionnaire `onKeyDown` de la `<section>` par :

```tsx
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation()
          onClose()
          return
        }
        // Tab boucle dans la vue : sans ca, le focus sortait vers le pied de
        // page et la barre d'outils, ou Escape ne fermait plus rien.
        if (event.key !== 'Tab') return
        const stops = tabStopsIn(event.currentTarget)
        if (stops.length === 0) return
        const first = stops[0]
        const last = stops[stops.length - 1]
        const active = document.activeElement
        const atStart =
          active === first || active === titleRef.current || active === event.currentTarget
        if (event.shiftKey && atStart) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        }
      }}
```

4. Mettre à jour le JSDoc de `BookmarkView` : ajouter « Tab et Maj+Tab bouclent dans la vue (non modale au sens ARIA : les onglets restent cliquables a la souris pour passer d'une vue a l'autre). ».

5. `src/App.css` : remplacer le sélecteur `#grimoire .bookmark-view h2:focus` par `#grimoire .bookmark-view h2:focus, #grimoire .bookmark-view:focus` (même déclaration `outline: none`). Compléter son commentaire : « La vue elle-meme (tabIndex -1) non plus. ».

6. `src/App.tsx` : sur `<div className="search-bar">`, ajouter `inert={openView !== null}`. Au-dessus de la ligne `{/* inert pendant l'aide : la vue d'aide couvre aussi la barre. */}`, ajouter `{/* Bouton oeil et recherche inertes pendant toute vue ouverte : ils agiraient sur la liste cachee sous la vue. */}`.

7. Lancer la vérification.

## Critères d'acceptation

- [ ] AC-01 : Vue Filtres ouverte au clavier (tri par défaut « alphabétique »). Ordre des arrêts : croix, trois listes, bouton radio coché. Depuis le radio coché, Tab ramène à la croix. Sur 15 appuis, le focus ne quitte jamais la vue (jamais le lien du pied de page ni la barre d'outils). (Précisé par l'orchestrateur avant vérification.)
- [ ] AC-02 : Même contrôle après avoir coché « Par niveau » : boucle identique.
- [ ] AC-03 : Depuis le titre de la vue (focus à l'ouverture), Maj+Tab : focus sur le bouton radio coché (dernier arrêt).
- [ ] AC-04 : Clic sur le texte d'une légende de la vue, puis Échap : la vue se ferme, focus sur son onglet.
- [ ] AC-05 : Vue Grimoire ouverte : la recherche et le bouton œil ne prennent pas le focus et ne réagissent pas au clic.
- [ ] AC-06 : Vue ouverte, clic sur un autre onglet : la vue change (comportement inchangé).
- [ ] AC-07 : Aide ouverte : même boucle (liens compris), Échap ferme, focus rendu au bouton « ? ».
- [ ] AC-08 : Aucun anneau de focus autour de la feuille de la vue après un clic sur son texte.

## Vérification

```bash
npm run lint
npm run build
```

Vérification navigateur (1440×900) : AC-01 à AC-08 au clavier.

## Hors périmètre

- `aria-modal`, rôle `dialog` : inchangés.
- Navigation par flèches dans le groupe radio (comportement natif, inchangé).
- Focus après choix d'un sort depuis le grimoire en mobile (constat B7, mineur).
- Échap dans les formulaires de la vue Personnage (T009, T010).

## Notes d'exécution

- Commentaire tabIndex -1 : en commentaire `//` au-dessus de `return (` et pas en commentaire JSX, impossible avant le premier element d un return sans fragment.
- `npm run lint` : pass. `npm run build` : pass (avertissement taille de chunk > 500 kB, preexistant, hors perimetre).
- Verification navigateur AC-01 a AC-08 non executee dans cette passe (pas de navigateur disponible). A faire par le verificateur.
- AC-01 : la vue Filtres a 5 arrets (croix, 3 listes, radio coche). 15 Tab depuis le titre = 3 tours complets, focus final sur le radio coche et pas sur la croix. Texte de AC-01 a relire.
