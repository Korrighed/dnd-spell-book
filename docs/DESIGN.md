# Charte graphique

## Palette de couleurs

Remplace la palette précédente (trop proche de l'identité visuelle D&D officielle). Source : [docs/Dadnd.jpg](Dadnd.jpg).

| Couleur | Hex | RGB | Rôle suggéré |
|---|---|---|---|
| Space Cadet | `#25344F` | 37, 52, 79 | Fond sombre / header |
| Slate Gray | `#617891` | 97, 120, 145 | Texte secondaire / sorts grisés hors filtre |
| Tan | `#D5B893` | 213, 184, 147 | Fond clair / papier de page |
| Coffee | `#6F4D38` | 111, 77, 56 | Reliure du grimoire / éléments bois-cuir |
| Caput Mortuum | `#632024` | 99, 32, 36 | Accent / action / élément interactif (marque-page, boutons) |

Rôles à confirmer une fois le wireframe posé — notés ici seulement à titre indicatif pour ne pas partir d'une page blanche.

## Typographie

Choix final : deux polices sombres, cohérentes avec un rendu de grimoire, tout en restant lisibles.

| Usage | Police | Format | Licence | Fichiers |
|---|---|---|---|---|
| Titres | [OLDWEST](https://www.fontspace.com/oldwest-font-f167915) | `.otf` | Freeware, libre d'usage personnel et commercial | `src/assets/fonts/Oldwest-4nDgB.otf` |
| Texte courant | [TimeBurner](https://www.fontspace.com/timeburner-font-f15111) | `.ttf` (Regular + Bold) | Freeware, libre d'usage commercial, sans attribution requise | `src/assets/fonts/Timeburner-xJB8.ttf`, `TimeburnerBold-peGR.ttf` |

Fichiers présents dans le repo. Reste à déclarer les `@font-face` dans `src/index.css`.

## Icônes

Librairie unique pour toutes les icônes d'interface : [Lucide](https://lucide.dev/icons/). Choix fait pour garder un style cohérent (traits fins, uniformes) sur tous les boutons/icônes (filtre, langue, ajout au grimoire perso, etc.).

- Package React : `lucide-react` (pas encore installé au 2026-08-28).
- Icônes en SVG, couleur héritée du CSS (`currentColor`) — facile à aligner sur la palette ci-dessus.
- Ne pas mélanger avec d'autres sets d'icônes (Font Awesome, Heroicons, etc.) pour rester cohérent.

## Prompt logo SVG

Prompt pour générateur d'image (à utiliser tel quel, en anglais — meilleure fidélité terminologique) :

```
Minimalist flat vector logo icon.

Subject: an open book seen from the front, pages spread in a shallow V shape.
The book cover and pages are colored Coffee brown (#6F4D38). A single
elongated bookmark is built into the book itself — not a loose paper strip,
but a fixed ribbon/tab that emerges from the spine at the center gutter and
extends upward past the top edge, as if stitched into the binding. The
bookmark is colored Caput Mortuum red (#632024), standing out against the
Coffee brown of the book.
To the right of the book: a d20 (twenty-sided die / icosahedron) colored
Space Cadet blue (#25344F), drawn as a simple geometric outline showing its
triangular facet lines, no numbers on it.

Style: flat, solid color fill (no gradients, no drop shadows, no textures),
no text, no background (transparent), bold clean outlines, symmetrical and
centered composition, legible at small sizes (favicon / app icon scale),
geometric and slightly angular line weight, vector icon aesthetic suitable
for direct SVG export.
```

Points à garder si le prompt est ajusté :

- **"built into the spine / not a loose paper strip"** — évite que le générateur dessine un marque-page en papier séparé.
- **"no numbers on it"** pour le d20 — sinon la plupart des générateurs collent un chiffre dessus.
- **"transparent background" + "no text"** — indispensable pour un usage favicon/logo réutilisable.
- Couleurs fixées : livre en `#6F4D38` (Coffee), marque-page en `#632024` (Caput Mortuum), dé en `#25344F` (Space Cadet).
