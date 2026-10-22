# Charte graphique

## Palette de couleurs

Remplace la palette précédente (trop proche de l'identité visuelle D&D officielle). Source : [docs/Dadnd.jpg](Dadnd.jpg).

| Couleur | Hex | RGB | Rôle |
|---|---|---|---|
| Space Cadet | `#25344F` | 37, 52, 79 | Fond sombre / header |
| Slate Gray | `#617891` | 97, 120, 145 | Texte secondaire / sorts grisés hors filtre |
| Tan | `#D5B893` | 213, 184, 147 | Fond clair / papier de page |
| Coffee | `#6F4D38` | 111, 77, 56 | Reliure du grimoire / éléments bois-cuir |
| Caput Mortuum | `#632024` | 99, 32, 36 | Accent / action / élément interactif (marque-page, boutons) |

Nuances dérivées, en variables dans `src/index.css`. Contrastes vérifiés au seuil WCAG AA (texte 4,5:1, bordures 3:1) :

| Variable | Hex | Dérivée de | Rôle |
|---|---|---|---|
| `--paper` | `#F3EAD9` | Tan éclairci | Papier des vues |
| `--paper-light` | `#FFFAF0` | Tan très éclairci | Fond des champs et cartes |
| `--ink` | `#2E2019` | Coffee assombri | Texte courant sur la texture |
| `--slate-gray-text` | `#576B82` | Slate Gray assombri | **Texte** hors profil : Slate Gray pur fait 3,82:1 sur `--paper`, sous le seuil AA de 4,5:1 (décision du 2026-10-15). `#576B82` : 4,59:1 sur `--paper` |
| `--caput-mortuum-hover` | `#7A2A2F` | Caput Mortuum éclairci | Survol des boutons pleins : texte Tan à 5,05:1 |

## Typographie

Choix final : deux polices sombres, cohérentes avec un rendu de grimoire, tout en restant lisibles.

| Usage | Police | Format | Licence | Fichiers |
|---|---|---|---|---|
| Titres | [OLDWEST](https://www.fontspace.com/oldwest-font-f167915) | `.otf` | Freeware, libre d'usage personnel et commercial | `src/assets/fonts/Oldwest-4nDgB.otf` |
| Texte courant | [TimeBurner](https://www.fontspace.com/timeburner-font-f15111) | `.ttf` (Regular + Bold) | Freeware, libre d'usage commercial, sans attribution requise | `src/assets/fonts/Timeburner-xJB8.ttf`, `TimeburnerBold-peGR.ttf` |

Fichiers présents dans le repo, `@font-face` déclarés dans `src/index.css`.

## Icônes

Librairie unique pour toutes les icônes d'interface : [Lucide](https://lucide.dev/icons/). Choix fait pour garder un style cohérent (traits fins, uniformes) sur tous les boutons/icônes (filtre, langue, ajout au grimoire perso, etc.).

- Pas de package : fichiers SVG copiés tels quels depuis `lucide-static` 1.57.0 (licence ISC, `https://unpkg.com/lucide-static@1.57.0/icons/<nom>.svg`) dans `public/icons/`, sans retouche.
- Affichage en masque CSS (`mask: var(--icon)`, `background-color: currentColor`) : la couleur vient du CSS, donc de la palette ci-dessus.
- Ne pas mélanger avec d'autres sets d'icônes (Font Awesome, Heroicons, etc.) pour rester cohérent.

## Prompt logo SVG

Logo généré à partir de ce prompt, finalement non utilisé dans l'application. Favicon retenu : icône Lucide `book-heart` (`public/favicon.svg`), cohérente avec l'onglet Grimoire.

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
