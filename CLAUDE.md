# Instructions projet — dnd-spell-book

Ces instructions surchargent le CLAUDE.md global pour ce projet.

## Git

Projet solo. Pas de git flow.

- Deux branches : `main` (stable/déployable) et `dev` (travail courant).
- Pas de `feature/*`, pas de `hotfix/*`.
- Commits directs sur `dev`, merge `dev` → `main` quand une version est stable.
- Jamais de `Co-Authored-By` dans les messages de commit.
- Format de message de commit obligatoire :

```
type(scope): phrase résumé.
- ajout 1
- ajout 2
```

Exemple :

```
feat(scene): ajout de la navigation clavier dans la galerie 3D.
- ajout des contrôles WASD sur la caméra Three.js
- ajout du hover sur les objets cliquables
```
