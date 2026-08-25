# DnD Spell Book — Grimoire interactif 3D

Grimoire de sorts Donjons & Dragons (5e) exploré en 3D. Le projet répond à la consigne [Exploration interactive 3D de données](docs/CONSIGNE.md) : une application front-end qui combine React, Three.js et une API publique pour permettre de filtrer, zoomer, survoler et cliquer sur des données.

## Concept

Un grand grimoire 3D que l'on feuillette : chaque page présente un sort. Depuis ce grimoire principal, on peut aussi récupérer des grimoires plus petits, propres à chaque classe.

- Navigation : on tourne les pages pour parcourir les sorts.
- V1 : recherche/filtre par nom.
- Ensuite : filtres par classe, niveau, école de magie.
- Contenu des sorts affiché en français.

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
- [Spécifications — source de données](docs/SPECS.md)
