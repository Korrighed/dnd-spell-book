# T014 — Remplacer le favicon par le livre avec un cœur

Statut : à faire
Story : hors plan (demande directe) · Exigences : DESIGN.md (palette, icônes Lucide)
Dépend de : aucune
Parallélisable : oui (aucun fichier commun avec T013)
Exécutant : workflow:front

<!-- Ce fichier est le contrat du codeur désigné (Haiku 5.5). Tout doit être explicite : aucun choix de conception ne doit lui rester. -->

## Objectif

L'onglet du navigateur affiche l'icône Lucide `book-heart` en Caput Mortuum sur une pastille papier, à la place du logo Vite violet.

## Fichiers à lire

- `public/icons/book-heart.svg` — tracés Lucide à reprendre à l'identique (deux `<path>`).
- `public/favicon.svg` — fichier à remplacer (logo Vite actuel).
- `index.html` — la balise `<link rel="icon">` pointe déjà sur `/favicon.svg`.

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `public/favicon.svg` | modifier (réécrire entièrement) | Nouveau contenu SVG décrit ci-dessous |

Aucun autre fichier. Ne pas toucher `index.html`, `src/App.tsx`, `src/components/SpellbookView.tsx`, `docs/IMPLEMENTATION-PLAN.md`, `docs/tasks/T013-titre-grimoire.md` : ils contiennent un travail en cours d'une autre tâche.

## Étapes

1. Remplacer tout le contenu de `public/favicon.svg` par exactement ceci :

```svg
<!-- Icône : lucide-static v1.57.0 book-heart (ISC), sur pastille papier -->
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
  <rect x="0" y="0" width="24" height="24" rx="5" fill="#f3ead9" />
  <g transform="translate(2.4 2.4) scale(0.8)" fill="none" stroke="#632024" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
    <path d="M8.62 9.8A2.25 2.25 0 1 1 12 6.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z" />
  </g>
</svg>
```

2. Vérifier que les deux attributs `d` sont identiques caractère pour caractère à ceux de `public/icons/book-heart.svg`.
3. Lancer la vérification.

## Critères d'acceptation

- [ ] AC-01 : `public/favicon.svg` ne contient plus aucune trace du logo Vite (`#863bff` absent).
- [ ] AC-02 : `public/favicon.svg` contient les deux tracés de `book-heart` identiques à `public/icons/book-heart.svg`, avec `stroke="#632024"` et un fond `#f3ead9`.
- [ ] AC-03 : `git diff --stat` ne montre, pour cette tâche, que `public/favicon.svg` (les 4 fichiers de T013 déjà modifiés avant ne comptent pas).
- [ ] AC-04 : `npm run build` réussit et `dist/favicon.svg` contient le nouveau SVG.

## Vérification

```bash
npm run lint
npm run build
```

Vérification navigateur : aucune (pas d'impact sur l'interface ; le contrôle visuel de l'onglet sera fait dans la passe navigateur de fin de lot).

## Hors périmètre

- Ajouter un favicon PNG, `apple-touch-icon` ou un manifest.
- Changer le `<title>` ou `lang` de `index.html`.
- Supprimer `public/icons.svg` ou `public/logo.png`.
- Committer.

## Notes d'exécution
