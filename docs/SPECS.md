# Spécifications — Source de données

## Disclaimer

L'[API 5e-bits](https://www.dnd5eapi.co/) ([documentation](https://5e-bits.github.io/docs/)) est un projet **communautaire**, non affilié à Wizards of the Coast. Les données proviennent du SRD (System Reference Document, contenu D&D sous licence ouverte) maintenu par des contributeurs open source, pas d'une source officielle.

Conséquence : certains sorts peuvent être en retard sur les errata officiels ou contenir des approximations de traduction (`fr-FR`). Chaque sort renvoyé par l'API inclut un champ `updated_at` (date de dernière modification de l'entrée côté API) — à afficher sur la fiche de chaque sort dans l'UI comme date de rédaction/mise à jour, pour que l'utilisateur sache à quand remonte la donnée.

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
Dernière vérification de ces specs contre l'API : 2026-08-25.
