# Spécifications

## Grimoire et filtrage

Un seul grimoire pour tous les sorts. Pas de sous-grimoire par classe, pas de livre séparé par classe, pas d'entité "personnage". Les pré-filtres (niveau, classe) sont portés directement par le **grimoire personnel**, pas par un objet personnage à part.

### Pré-tri par niveau et classe

- Le grimoire personnel peut porter des pré-filtres : niveau de sort max accessible, classe.
- Sans pré-filtre défini sur le grimoire personnel → tous les sorts restent affichés normalement, aucun grisé.
- Sans grimoire personnel créé → les filtres (recherche, niveau, classe) fonctionnent quand même, mais toujours appliqués sur l'unique grand grimoire — jamais sur un livre séparé.
- Les sorts hors filtre restent **présents et navigables** dans le grimoire — jamais masqués ni retirés de la pagination/recherche. Affichage grisé/désaturé pour signaler l'inaccessibilité, sans bloquer la consultation du contenu.
- Le niveau de sort max accessible se déduit des emplacements de sorts (`spell_slots_level_1` à `_9`, `cantrips_known`) exposés dans `spellcasting` par `GET /api/2014/classes/{class}/levels/{level}` (vérifié sur `wizard`/niveau 3) : le plus haut `spell_slots_level_N` non nul à ce niveau.

### Grimoire personnel

- Bouton "Ajouter au grimoire personnel" sur chaque fiche de sort.
- Stockage local navigateur (JSON simple, `localStorage` ou `IndexedDB`) — structure de données choisie pour faciliter un bundling PWA facile plus tard (service worker, manifest), sans construire la coquille PWA dès maintenant.
- **Sort filtré après coup, jamais supprimé** : si un sort déjà enregistré dans le grimoire personnel sort du pré-filtre (changement de niveau/classe appliqué après l'ajout du sort), il n'est jamais retiré du grimoire. Sa page reste consultable et son contenu lisible, mais avec un aplat grisé et toutes les fonctions interactives de la page désactivées (sélecteur de niveau d'incantation, futur bouton de lancer de dés, etc.).

## Sélection du niveau d'incantation (indicatif)

- Sur la fiche d'un sort disposant d'un champ `higher_level` non vide : sélecteur de niveau d'incantation, borné entre `level` et 9.
- Affiche le texte d'effet correspondant de `higher_level` selon le niveau choisi. Purement indicatif pour l'instant — pas de calcul réel de dés.
- Prépare l'intégration future du lancer de dés (voir ci-dessous). Ne pas afficher ce sélecteur si `higher_level` est vide.

## Lancer de dés (futur, hors scope actuel)

- Réutilisation de l'application dice-roller déjà existante : [Korrighed/dice-roller](https://github.com/Korrighed/dice-roller).
- Sera branché sur la sélection du niveau d'incantation ci-dessus.
- Dernier point de la roadmap (voir Ordre de développement) — pas de travail dessus avant que le reste soit fait.

## Interface

### Panneau de filtres

- Bouton d'activation en haut à droite de la fenêtre (icône filtre), ouvre un panneau regroupant : recherche par nom, filtre niveau, filtre classe, toggle langue.
- Idée V2+ (non planifiée) : remplacer le bouton HTML par un marque-page 3D qui dépasse du livre dans la scène Three.js, cliquable directement dans la scène.

### Langue

- Toggle par page de sort : FR, EN, ou FR+EN simultané.
- Le mode FR+EN nécessite un layout empilé ou côte-à-côte pour chaque champ texte concerné (`name`, `desc`, `higher_level`, etc.).

## Ordre de développement

1. Grimoire brut — tous les sorts affichés, sans filtre.
2. Recherche par nom (FR et EN).
3. Filtre par niveau de sort max.
4. Filtre par classe.
5. Grimoire personnel — bouton d'ajout + stockage local + comportement grisé/non-interactif décrit ci-dessus.
6. *(Dernier, optionnel)* Base de sorts locale avec synchronisation asynchrone contre l'API (cache offline-first).

## Source de données

### Disclaimer

L'[API 5e-bits](https://www.dnd5eapi.co/) ([documentation](https://5e-bits.github.io/docs/)) est un projet **communautaire**, non affilié à Wizards of the Coast. Les données proviennent du SRD (System Reference Document, contenu D&D sous licence ouverte) maintenu par des contributeurs open source, pas d'une source officielle.

Conséquence : certains sorts peuvent être en retard sur les errata officiels ou contenir des approximations de traduction (`fr-FR`). Chaque sort renvoyé par l'API inclut un champ `updated_at` (date de dernière modification de l'entrée côté API) — à afficher sur la fiche de chaque sort dans l'UI comme date de rédaction/mise à jour, pour que l'utilisateur sache à quand remonte la donnée.

### Édition et périmètre

- Édition couverte : **2014** uniquement. `GET /api` redirige vers `/api/2014/` ; `/api/2024/` renvoie 404 (vérifié le 2026-09-04) — pas de support de la révision 2024 des règles sur cette API.
- 319 sorts au total, ce qui correspond au nombre connu de sorts du SRD 2014 — **pas un défaut de l'API**. Le SRD ne contient que le contenu D&D publié sous licence ouverte : les sorts parus uniquement dans des suppléments propriétaires (Xanathar's Guide to Everything, Tasha's Cauldron of Everything, Sword Coast Adventurer's Guide, etc.) sont absents, quelle que soit l'édition visée.

## API

REST + GraphQL, gratuite, sans authentification ni rate limiting connu.

Endpoint principal utilisé : `GET https://www.dnd5eapi.co/api/2014/spells` (liste) et `GET https://www.dnd5eapi.co/api/2014/spells/{index}` (détail).

Dépôts de référence :

- [5e-bits/5e-srd-api](https://github.com/5e-bits/5e-srd-api) — code source de l'API
- [5e-bits/5e-database](https://github.com/5e-bits/5e-database) — données brutes (JSON) du SRD, à copier en local dans le repo en cas de problème de CORS

## Localisation française

L'[API supporte le multilingue](https://5e-bits.github.io/docs/reference/multilingual) via le paramètre `?lang=fr-FR` (repli sur l'anglais si la traduction n'existe pas pour une ressource) : `GET /api/2014/spells/acid-arrow?lang=fr-FR`.

Vérifié sur `acid-arrow` et `fireball` en `fr-FR` :

- `name`, `desc`, `school`, `classes`, `duration`, `casting_time`, `material` : traduits.
- `range` : déjà converti et formaté en mètres par l'API (ex. `"45 mètres"`) — pas de conversion à faire côté front.
- `area_of_effect.size` : reste une valeur numérique brute en pieds même en `fr-FR` (ex. `20` pour un rayon de 20 pieds) — nécessite une conversion pied→mètre côté front (`× 0.3048`), aussi bien pour l'affichage que pour dimensionner les objets dans la scène Three.js.

## Champs exploités par sort

| Champ | Description |
|---|---|
| `name` | Nom du sort |
| `level` | Niveau (0 = tour de magie à 9) |
| `school` | École de magie (évocation, illusion, ...) |
| `classes` | Classes pouvant lancer le sort |
| `casting_time`, `range`, `duration` | Paramètres d'incantation |
| `components`, `material` | Composants requis (V, S, M) |
| `concentration`, `ritual` | Booléens |
| `desc`, `higher_level` | Description et effet aux niveaux supérieurs |
| `damage`, `dc`, `area_of_effect` | Détails de dégâts / jet de sauvegarde / zone d'effet (selon le sort) |
| `updated_at` | Date de dernière modification de l'entrée côté API — à afficher comme date de rédaction du sort |

---
Dernière vérification de ces specs contre l'API : 2026-09-04.
Dernière mise à jour des décisions produit (grimoire/filtrage/roadmap) : 2026-08-28.
