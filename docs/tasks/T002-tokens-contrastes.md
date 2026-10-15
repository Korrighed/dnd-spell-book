# T002 — Ajouter les tokens de couleur et corriger les contrastes

Statut : à faire
Story : constats A1, A3 · Exigences : D-01 ([DESIGN-BRIEF.md §3](../DESIGN-BRIEF.md#couleurs))
Dépend de : T001
Parallélisable : non
Exécutant : workflow:front

## Objectif

Les nuances dérivées de la palette sont des variables CSS, sans valeur hexadécimale répétée. Le texte des sorts hors profil et le lien du pied de page passent le contraste AA (4,5:1).

## Fichiers à lire

- `src/index.css` — bloc `:root` (palette, lignes 29-72) et règle `.out-of-profile` (lignes 176-183).
- `src/App.css` — règles citées ci-dessous.
- `docs/DESIGN-BRIEF.md` §3 « Couleurs » — valeurs et usages.

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/index.css` | modifier | 3 variables ajoutées, couleur du texte hors profil |
| `src/App.css` | modifier | valeurs en dur remplacées par les variables, couleur du lien de pied de page |

## Étapes

1. Dans `src/index.css`, dans `:root`, juste après la ligne `--paper: #f3ead9;`, ajouter :

```css
  /* Nuances derivees (docs/DESIGN.md, docs/DESIGN-BRIEF.md) :
     --slate-gray-text : Slate Gray assombri pour le TEXTE hors profil
     (4.59:1 sur --paper ; Slate Gray pur : 3.82:1, sous le seuil AA).
     --caput-mortuum-hover : survol des boutons Caput Mortuum pleins.
     --paper-light : fond des champs et des cartes dans les vues. */
  --slate-gray-text: #576b82;
  --caput-mortuum-hover: #7a2a2f;
  --paper-light: #fffaf0;
```

2. Dans `src/index.css`, règle `.spell-list li.out-of-profile, … .spell-detail.out-of-profile h2` : remplacer `color: var(--slate-gray);` par `color: var(--slate-gray-text);`. Mettre à jour le commentaire au-dessus : « Sorts hors du profil du lanceur : Slate Gray assombri (--slate-gray-text, contraste AA). Les enfants heritent. » (garder la 2e ligne du commentaire sur les sélecteurs préfixés).

3. Dans `src/App.css`, remplacer chaque `#7a2a2f` par `var(--caput-mortuum-hover)`. Il y en a 4 : règles `#grimoire .bookmark:hover`, `#grimoire .bookmark[aria-expanded='true']`, `#grimoire .spellbook-toggle:hover`, `#grimoire .bookmark-view-close:hover`.

4. Dans `src/App.css`, remplacer chaque `#fffaf0` par `var(--paper-light)`. Il y en a 2 : `#grimoire .profile-toggle:hover` et la variable `--bg` de `#grimoire .bookmark-view`.

5. Dans `src/App.css`, règle `.site-footer a` : remplacer `color: var(--tan);` par :

```css
  /* --paper et non Tan : Tan sur le bandeau voile ne fait que ~3.9:1
     (mesure sur la texture), --paper ~6.1:1. Souligne : c'est un lien. */
  color: var(--paper);
  text-decoration: underline;
```

6. Lancer la vérification.

## Critères d'acceptation

- [ ] AC-01 : `grep -n "#7a2a2f\|#fffaf0" src/App.css` ne renvoie rien. `grep -c "#7a2a2f\|#fffaf0" src/index.css` renvoie 2 (les déclarations).
- [ ] AC-02 : Étant donné un personnage avec la classe Magicien niveau 1, quand on regarde un sort de niveau 9 dans la liste, alors sa couleur calculée est `rgb(87, 107, 130)`.
- [ ] AC-03 : Le lien « dnd5eapi.co » du pied de page a pour couleur calculée `rgb(243, 234, 217)` et est souligné. (Le contraste sur la texture a été mesuré en revue, ~6,1:1 ; seule la couleur est contrôlée ici.)
- [ ] AC-04 : Survol d'un onglet marque-page : fond `rgb(122, 42, 47)`, comme avant.

## Vérification

```bash
npm run lint
npm run build
```

Vérification navigateur (1440×900) : AC-02, AC-03, AC-04 via les styles calculés. Créer le profil via l'onglet Personnage (classe Magicien, niveau 1).

## Hors périmètre

- `--text-h`, `--border`, `--accent-bg` et autres variables : inchangés.
- `rgba(...)` en dur (ombres, voiles) : inchangés.
- `#000` en dur : inchangé.
- Les vues et formulaires (T003).

## Notes d'exécution
