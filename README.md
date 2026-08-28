# DnD Spell Book — Grimoire interactif 3D

Grimoire de sorts Donjons & Dragons (5e) exploré en 3D. Le projet répond à la consigne [Exploration interactive 3D de données](docs/CONSIGNE.md) : une application front-end qui combine React, Three.js et une API publique pour permettre de filtrer, zoomer, survoler et cliquer sur des données.

## Concept

Un grand grimoire 3D que l'on feuillette : chaque page présente un sort. Un seul grimoire — pas de livre séparé par classe, la classe n'est qu'un filtre parmi d'autres.

- Navigation : on tourne les pages pour parcourir les sorts.
- Filtres, dans l'ordre de développement (détail dans [docs/SPECS.md](docs/SPECS.md)) : recherche par nom → niveau de sort → classe.
- Grimoire personnel : on sauvegarde ses sorts choisis dans un livre à soi, stocké localement dans le navigateur.
- Contenu affichable en français, en anglais, ou les deux à la fois.

## Stack

- **React** + TypeScript + Vite
- **Three.js** pour la scène 3D interactive
- **[D&D 5e API](https://www.dnd5eapi.co/)** comme source de données — détails et disclaimer dans [docs/SPECS.md](docs/SPECS.md)

## Développement

```bash
npm install
npm run dev
```

## Documents du projet

- [Consigne du projet](docs/CONSIGNE.md)
- [Spécifications — grimoire, filtrage, source de données](docs/SPECS.md)
- [Charte graphique — palette, typographie, logo](docs/DESIGN.md)
