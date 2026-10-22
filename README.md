# DnD Spell Book — Grimoire interactif 3D

Grimoire des sorts de Donjons & Dragons (5e édition, SRD 2014) présenté comme un livre 3D que l'on feuillette. Le projet répond à la consigne [Exploration interactive 3D de données](docs/CONSIGNE.md) : une application front-end qui combine React, Three.js et une API publique pour filtrer, survoler et cliquer sur des données.

- Code : [github.com/Korrighed/dnd-spell-book](https://github.com/Korrighed/dnd-spell-book)

## Fonctionnalités

- Livre 3D (Three.js) avec animation de tournage de page. Page gauche : fiche du sort. Page droite : liste paginée des 319 sorts.
- Recherche par nom en français ou en anglais, tolérante aux accents et aux pluriels.
- Filtres par niveau, classe et école de magie. Tri alphabétique ou par niveau.
- Fiche de sort en français ou en anglais. Portée et zone d'effet dans les deux unités (mètres et pieds).
- Personnages : plusieurs personnages, chacun avec ses classes (multiclasse, sous-classes, niveau total ≤ 20). Les sorts hors de portée du personnage sont grisés ou masqués.
- Grimoire personnel par personnage, enregistré dans le navigateur.
- Interface en français ou en anglais selon la langue du navigateur.
- Responsive : livre entier sur ordinateur, une page à la fois sur téléphone (glisser pour changer de page).

## Stack

| Rôle | Outil |
|---|---|
| Interface | React 19, TypeScript, Vite |
| 3D | Three.js via `@react-three/fiber` et `@react-three/drei` |
| Données | [API D&D 5e](https://www.dnd5eapi.co/) (communautaire, SRD 5.1) |
| Hébergement | Netlify (`netlify.toml`) |

Pas de backend. Les personnages et le grimoire restent dans le `localStorage` du navigateur.

## Lancer le projet

Node 22.

```bash
npm install
npm run dev       # serveur de développement
npm run lint      # ESLint
npm run build     # vérification TypeScript + build de production dans dist/
npm run preview   # sert le build de production en local
```

## Structure

```
src/
  api/          appels à l'API D&D 5e (une fonction par ressource)
  hooks/        chargement, cache et état (personnages, accès aux sorts, swipe…)
  components/   livre 3D, fiche, liste, vues (filtres, personnage, grimoire, aide)
  utils/        règles pures (recherche, tri, langue, niveaux, mise à l'échelle)
  data/         données fixes (niveau de déblocage des sous-classes)
public/
  assets/       modèle 3D du livre (.glb), textures
  icons/        icônes Lucide (SVG)
docs/           consigne, spécifications, charte, parcours, préparation, maquettes
```

## Documents du projet

| Document | Contenu |
|---|---|
| [CONSIGNE.md](docs/CONSIGNE.md) | Sujet et livrables attendus |
| [PREPARATION.md](docs/PREPARATION.md) | Schéma d'intégration des données, stockage local, planning réalisé |
| [SPECS.md](docs/SPECS.md) | Règles du grimoire et du filtrage, source de données, localisation |
| [APP-FLOW.md](docs/APP-FLOW.md) | Arborescence des écrans et parcours utilisateur |
| [DESIGN.md](docs/DESIGN.md) | Charte graphique : palette, typographie, icônes |
| [Maquettes](docs/Maquettes/) | Maquettes desktop et mobile (V1 et V2) |

## Crédits

- Données : [dnd5eapi.co](https://www.dnd5eapi.co/), projet communautaire non affilié à Wizards of the Coast. Contient des éléments du System Reference Document 5.1 de Wizards of the Coast LLC, sous licence [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode).
- Polices : [OLDWEST](https://www.fontspace.com/oldwest-font-f167915) et [TimeBurner](https://www.fontspace.com/timeburner-font-f15111), freeware (détail : [src/assets/fonts/README.md](src/assets/fonts/README.md)).
- Icônes : [Lucide](https://lucide.dev/), licence ISC.
