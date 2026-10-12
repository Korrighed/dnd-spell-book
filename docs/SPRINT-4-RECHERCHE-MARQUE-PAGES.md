# Sprint 4 — Recherche permanente et marque-pages

État au 2026-10-12. Plan d'action, **rien n'est codé**. Branche à créer depuis `dev` une fois `feature/book-page-turn` fusionnée. Décisions ouvertes en fin de document : à trancher avant de coder.

## Objectif

1. Barre de recherche toujours disponible et visible, au-dessus du livre.
2. Répartir les fonctions du panneau replié actuel (`details.other-panels` dans `App.tsx`) dans des vues cohérentes. Chaque vue s'ouvre par un clic sur un marque-page (petit post-it qui dépasse du haut du livre), avec une icône SVG pertinente.

Modèles : `docs/Maquettes/SpellBookV2.png` (desktop), `docs/Maquettes/MobileV2.png` (mobile).

## Périmètre

- Répartition des **fonctions** uniquement. Aucun travail CSS (position, forme, couleur des marque-pages) : il fera l'objet d'une branche dédiée.
- Les marque-pages sont des boutons HTML. Le marque-page 3D dans la scène Three.js (idée V2+ de `SPECS.md`) reste hors périmètre.
- `SpellList`, `SpellDetail`, `BookSpread` et la pagination 3D ne changent pas, sauf branchement.

## Ce que montrent les maquettes

| Élément | Desktop | Mobile | Icône existante |
|---|---|---|---|
| Marque-page 1 | Toque (diplômé), en haut à droite | Idem, en haut | Aucune : `graduation-cap.svg` à ajouter (Lucide) |
| Marque-page 2 | Flèche + « 1 0 » | Idem | `public/icons/arrow-up-1-0.svg` |
| Marque-page 3 | Personnage + rouage | Idem | `public/icons/user-round-cog.svg` |
| Recherche | Champ avec icône loupe-livre, page de droite | Au-dessus du livre, à côté d'un bouton cœur | `public/icons/book-search.svg` |
| Liste personnelle | Bloc « Liste personnel » en haut de la page de droite, icône cœur-livre | Bouton cœur-livre à gauche de la recherche | `public/icons/favourite-book.svg` |

Lecture des icônes : la toque évoque « classe » et « école » (de magie). `arrow-up-1-0` est une icône de tri : elle évoque le niveau. Aucun tri n'existe aujourd'hui.

Écart avec l'objectif 1 : sur la maquette desktop, la recherche est **dans** la page de droite, pas au-dessus du livre. La consigne de ce sprint prime : recherche au-dessus du livre sur les deux formats, comme la maquette mobile.

## Inventaire des fonctions à répartir

Contenu actuel de `details.other-panels` (`App.tsx`) :

| Id | Fonction | Composant / source |
|---|---|---|
| F1 | Recherche par nom (FR/EN) | `SpellSearch` |
| F2 | Filtre niveau de sort | `SpellLevelFilter` |
| F3 | Filtre classe | `SpellClassFilter` |
| F4 | Filtre école de magie | `SpellSchoolFilter` |
| F5 | Masquer les sorts hors profil (case, visible seulement si un profil existe) | JSX inline dans `App.tsx` |
| F6 | Sélection / ajout / suppression / renommage de personnage | `CharacterSelector` |
| F7 | Profils de classe du personnage actif (un formulaire par profil + « ajouter une classe ») | `SpellcasterProfileForm` |
| F8 | Liste du grimoire personnel (ouvrir un sort, retirer) | `PersonalSpellbookPanel` |
| F9 | Messages de chargement et d'erreur (liste classes, liste écoles, sorts d'une classe, sorts d'une école, classes lanceuses de sorts) | JSX inline dans `App.tsx` |

Fonction ajoutée par ce sprint : **F10 — Tri de la liste** (niveau ou alphabétique), voir « Répartition retenue ».

Contrainte technique : `PersonalSpellbookPanel` reçoit aujourd'hui F6 + F7 via la prop `profileForm`. Il faut séparer la liste (F8) du formulaire de profil (F6, F7) pour pouvoir les placer dans des vues différentes.

F1 est traité à part (objectif 1) : il ne va dans aucune vue.

## Propositions de répartition

### Option A — calque de la maquette (3 marque-pages + liste personnelle fixe)

| Marque-page | Icône | Fonctions |
|---|---|---|
| Classe et école | `graduation-cap.svg` (à ajouter) | F3, F4, + messages F9 associés |
| Niveau | `arrow-up-1-0.svg` | F2 |
| Personnage | `user-round-cog.svg` | F6, F7, F5, + message F9 « classes lanceuses » |
| *(hors marque-page)* | `favourite-book.svg` | F8 : bloc fixe en haut de la page de droite (desktop), bouton cœur à côté de la recherche (mobile) |

### Option B — regroupement par intention (3 marque-pages)

| Marque-page | Icône | Fonctions |
|---|---|---|
| Filtres | `funnel.svg` | F2, F3, F4, F5, + messages F9 associés |
| Personnage | `user-round-cog.svg` | F6, F7, + message F9 « classes lanceuses » |
| Grimoire personnel | `favourite-book.svg` | F8 |

### Option C — tout en marque-pages (4 marque-pages)

| Marque-page | Icône | Fonctions |
|---|---|---|
| Classe et école | `graduation-cap.svg` (à ajouter) | F3, F4 |
| Niveau | `arrow-up-1-0.svg` | F2, F5 |
| Personnage | `user-round-cog.svg` | F6, F7 |
| Grimoire personnel | `favourite-book.svg` | F8 |

### Comparatif

| Option | Pour | Contre |
|---|---|---|
| A | Fidèle aux deux maquettes, icônes cohérentes avec le dessin. F8 toujours sous les yeux, sans clic. | La vue « Niveau » ne contient qu'une liste déroulante : vue maigre. Sur desktop, le bloc F8 prend de la hauteur sur la liste de sorts, donc moins de sorts par page. |
| B | Tous les filtres de recherche au même endroit, une seule vue pour combiner niveau + classe + école. Vues équilibrées. | S'écarte de la maquette (icônes toque et `↑1 0` inutilisées). La vue « Filtres » est la plus chargée. |
| C | La liste de sorts garde toute la hauteur de la page. Granularité fine. | 4 marque-pages serrés en mobile (la maquette mobile n'en montre que 3). F8 demande un clic de plus. F5 dans « Niveau » est moins logique que dans « Personnage ». |

**Recommandation : option A.** Elle suit les maquettes, qui servent de modèle. La faiblesse de la vue « Niveau » est acceptable : l'icône de tri prépare un futur tri de la liste, qui y trouvera sa place. F5 va dans « Personnage », car il n'a de sens qu'avec un profil.

## Répartition retenue (2026-10-12)

Décision de l'utilisateur, variante de l'option B : « masquer hors profil » sort des vues et devient un accès rapide sous la recherche.

| Emplacement | Icône | Fonctions |
|---|---|---|
| Barre de recherche, au-dessus du livre, toujours visible | `book-search.svg` | F1 |
| Juste sous la recherche, toujours visible (si un profil existe) | aucune : la case à cocher suffit | F5 : masquer les sorts hors profil |
| Marque-page « Filtres » | `funnel.svg` | F2, F3, F4, + messages F9 associés |
| Marque-page « Tri » | `arrow-up-1-0.svg` | F10 (tri, nouveau) |
| Marque-page « Personnage » | `user-round-cog.svg` | F6, F7, + message F9 « classes lanceuses » |
| Marque-page « Grimoire » | `favourite-book.svg` | F8 |

Raison de F5 sous la recherche : c'est un réglage qu'on bascule souvent pendant une recherche. Il doit être accessible sans ouvrir de vue.

**Mêmes boutons sur tous les formats** : les 4 marque-pages sont identiques en desktop et en mobile. Le bouton cœur à côté de la recherche, sur la maquette mobile, n'est pas repris.

**F10 — Tri (nouvelle fonction, vue dédiée)** :

- Un seul type de tri actif à la fois : soit par niveau, soit par ordre alphabétique.
- Tri par défaut au chargement : **alphabétique**.
- Aujourd'hui la liste n'a aucun tri dans le code et suit l'ordre renvoyé par l'API.
- Un tri ne retire aucun sort, contrairement au filtre niveau (F2).
- Le tri alphabétique porte sur le **nom affiché**, qui dépend de la langue du navigateur : `nameFr` si le navigateur est en français, `name` (anglais) sinon. La détection existe déjà (`detectBrowserLanguage`, `src/utils/browserLanguage.ts`), et `SpellList` l'utilise déjà pour afficher un seul nom.
- Changer de tri remet la liste en page 1. C'est automatique : l'ordre des index change, et le mécanisme `filteredKey` de `App.tsx` réagit à ce changement.

**Langue d'affichage** : la liste du grimoire personnel (`PersonalSpellbookPanel`) affiche aujourd'hui les deux noms (FR et EN) côte à côte. Elle doit suivre la même règle que `SpellList` : un seul nom, selon la langue du navigateur.

## Plan d'action

1. Créer la branche depuis `dev`, après fusion de `feature/book-page-turn`.
2. **Recherche permanente** : sortir `SpellSearch` de `details.other-panels` et le rendre au-dessus de `BookSpread`, sur les deux formats. Aucune logique ne change (`search` reste dans `App`).
3. **Accès rapide F5** : déplacer la case « masquer hors profil » juste sous la recherche. La condition reste la même : visible seulement si `profiles.length > 0`.
4. **Séparer F8 de F6/F7** : retirer la prop `profileForm` de `PersonalSpellbookPanel`, qui ne garde que la liste. Le formulaire de profil devient un bloc indépendant.
5. **Composant `Bookmarks`** : rangée de 4 boutons marque-page. Chaque bouton contient une `<img>` SVG, un `aria-label`, et `aria-expanded` / `aria-controls` vers sa vue.
6. **État de vue ouverte** dans `App` : `openView: 'filters' | 'sort' | 'character' | 'spellbook' | null`. Une seule vue ouverte à la fois. La vue s'affiche **par-dessus le livre** : c'est une nouvelle vue, pas un remplacement de page. Le livre et la recherche restent en dessous, inchangés.
   Fermeture, trois moyens : bouton « Fermer » dans la vue, touche `Escape`, clic sur le marque-page actif. À la fermeture, le focus revient au marque-page qui a ouvert la vue.
7. **Composants de vue** (sans style) : `FiltersView` (F2, F3, F4), `SortView` (F10), `CharacterView` (F6, F7), `SpellbookView` (F8). Déplacer le JSX depuis `App.tsx`, avec les `DevFrame` existants.
8. **Tri F10** :
   - état `sortMode: 'alpha' | 'level'` dans `App`, initialisé à `'alpha'` ;
   - appliqué après le filtrage (`filteredSpells`), sur une copie du tableau ;
   - choix du tri dans `SortView` ;
   - tri alphabétique sur le nom affiché (`nameFr` ou `name` selon `detectBrowserLanguage`), avec `localeCompare` dans la même langue pour gérer les accents ;
   - tri par niveau : à niveau égal, ordre alphabétique sur le nom affiché, pour un ordre stable et prévisible ;
   - sortir la langue détectée de `SpellList` (constante de module aujourd'hui) vers un point partagé, pour que le tri et l'affichage utilisent la même valeur.
9. **Grimoire en une langue** : `PersonalSpellbookPanel` affiche un seul nom selon la langue du navigateur, comme `SpellList`.
10. **Messages F9** : chaque message suit sa fonction (chargement des sorts d'une classe ou d'une école dans `FiltersView`, erreur « classes lanceuses » dans `CharacterView`).
11. Supprimer `details.other-panels`.
12. Mettre à jour `SPECS.md` (section « Panneau de filtres ») et ce document.
13. Vérifier : `tsc`, `eslint`, test manuel desktop + mobile (ouverture/fermeture des 4 vues, filtres combinés, tri alphabétique par défaut puis par niveau, ordre alphabétique en navigateur FR et EN, retour à la page 1 au changement de filtre ou de tri, F5 avec et sans profil, sélection de personnage, ouverture d'un sort depuis le grimoire).

## Décisions ouvertes

1. ~~Option de répartition~~ : tranchée, voir « Répartition retenue ».
2. ~~Icône du marque-page « Filtres »~~ : `funnel.svg`.
3. ~~Où s'affiche une vue ouverte~~ : par-dessus le livre, refermable (voir étape 6).
4. ~~Bouton cœur de la maquette mobile~~ : non repris, mêmes boutons sur tous les formats.
5. ~~Tri~~ : vue dédiée (marque-page `arrow-up-1-0.svg`), alphabétique par défaut, sur le nom affiché selon la langue du navigateur.
6. **Nom de branche** : reporté, planification d'abord.
   Note : le `CLAUDE.md` du projet interdit les branches `feature/*`, mais les dernières branches les utilisent. Proposition : `feature/search-bookmarks`, ou travail direct sur `dev` si la règle s'applique.
