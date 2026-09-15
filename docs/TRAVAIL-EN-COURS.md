# Travail en cours — `feature/personal-spellbook`

État au 2026-09-15. Ce document décrit ce qui est fait, ce qui reste, et les pièges rencontrés. À supprimer une fois la branche fusionnée dans `dev`.

## Position des branches

```
973cac6  feat(grimoire): synchronise le grimoire entre les onglets ouverts
248b6f9  feat(grimoire): ajoute le grimoire personnel et son stockage local
b0d47b4  Merge branch 'bugfix/force-api-language' into dev      ← dev
```

La branche est rebasée sur `dev`, aucun commit de retard. `npm run build` et `npm run lint` passent.

## Fait — étape 5 des SPECS, partiellement

Correspond au point 5 de l'[ordre de développement](SPECS.md#ordre-de-développement) : *bouton d'ajout + stockage local*.

| Fichier | Rôle |
|---|---|
| `src/hooks/usePersonalSpellbook.ts` | État du grimoire, persistance, synchro entre onglets |
| `src/components/PersonalSpellbookPanel.tsx` | Liste des sorts sauvegardés, ouverture et retrait |
| `src/components/PersonalSpellbookPanel.css` | Styles du panneau |
| `src/components/SpellDetail.tsx` | Bouton « Ajouter / Retirer du grimoire personnel » |
| `src/App.tsx` | Porte l'état et le transmet à la fiche et au panneau |

### Format de stockage

Clef `localStorage` : `dnd-personal-spellbook`.

```json
{ "version": 1, "spells": [ { "index": "fireball", "addedAt": "2026-09-15T10:00:00.000Z" } ] }
```

L'enveloppe versionnée prépare les migrations futures, conformément à l'intention PWA des SPECS. La lecture tolère l'ancien format (tableau brut sans enveloppe) et filtre les entrées invalides.

### Synchro entre onglets

Le hook écoute l'événement `storage`. Motif : l'écriture porte sur le **tableau entier**, donc sans synchro un onglet périmé écrase silencieusement les ajouts d'un autre.

```
Onglet A charge [Boule de feu]
Onglet B ajoute Éclair        → stockage = [Boule de feu, Éclair]
Onglet A périmé ajoute Soin   → stockage = [Boule de feu, Soin]   ← Éclair perdu
```

Validé manuellement sur ce scénario. Limite acceptée : deux écritures simultanées à la milliseconde près restent en dernier-écrit-gagne, `localStorage` n'ayant pas de transaction.

## À faire ensuite — les pré-filtres du grimoire personnel

C'est la suite immédiate. Décrite dans [SPECS.md](SPECS.md), sections *Pré-tri par niveau et classe* et *Grimoire personnel*.

Le grimoire personnel doit porter ses propres pré-filtres : **niveau de sort max accessible** et **classe**. Attention, ce ne sont **pas** les filtres de vue déjà présents dans `App.tsx` (`levelFilter`, `classFilter`) — les SPECS séparent explicitement les deux. Ces derniers filtrent l'affichage du grand grimoire ; les pré-filtres, eux, appartiennent au grimoire personnel.

Ce qui reste à construire :

1. **Stocker les pré-filtres** dans l'enveloppe `localStorage`, à côté de `spells`. Prévoir la migration depuis `version: 1`.
2. **Déduire le niveau max accessible** depuis `GET /api/2014/classes/{class}/levels/{level}` : le plus haut `spell_slots_level_N` non nul du bloc `spellcasting`. Vérifié sur `wizard`/niveau 3 lors de la rédaction des SPECS.
3. **Affichage grisé** des sorts hors pré-filtre. Règle impérative : un sort déjà enregistré **n'est jamais retiré** du grimoire quand il sort du pré-filtre. Sa fiche reste consultable et lisible, avec un aplat grisé et toutes les fonctions interactives désactivées.
4. **Sans pré-filtre défini** → aucun grisé, tout s'affiche normalement.

La couleur Slate Gray `#617891` est déjà réservée à cet usage dans la [charte](DESIGN.md#palette-de-couleurs) : *« sorts grisés hors filtre »*.

## Points ouverts, hors périmètre de cette branche

- **`useKeyedFetch` ne retente jamais une clef en échec** (`src/hooks/useKeyedFetch.ts`). Une erreur reste affichée jusqu'au rechargement complet de la page, y compris après une simple coupure réseau. A masqué un diagnostic pendant le développement : les corrections livrées restaient invisibles dans l'onglet ouvert.
- **Le type de zone d'effet n'est pas traduit** par l'API — `sphere`, `cube`, `cone`, `line`, `cylinder` sortent en anglais dans les deux langues. Une table de correspondance locale de cinq entrées suffirait.
- **Le nom du type de dégâts n'existe qu'en français** dans l'API. En mode anglais on affiche l'index technique capitalisé (`fire` → `Fire`). L'alternative serait un appel à `/damage-types/{index}`.
- **Un `stash` obsolète traîne** dans le dépôt : un brouillon du grimoire antérieur à cette branche, entièrement remplacé par `248b6f9`. À supprimer.

## Deux corrections à porter dans SPECS.md

Mesurées contre l'API pendant cette branche, elles contredisent la section *Localisation française* des SPECS :

| SPECS actuelles | Constat |
|---|---|
| conversion pied→mètre `× 0.3048` | L'API applique le **ratio de jeu** `× 0.3` (1 case = 5 ft = 1,50 m). Vérifié : `30→9`, `60→18`, `120→36`. Avec `0.3048` on affiche `6,1 m` là où la description française du même sort dit `6 mètres` |
| « repli sur l'anglais si la traduction n'existe pas » | Sans paramètre `lang`, l'API répond selon l'en-tête `Accept-Language` du navigateur. Depuis un navigateur français, l'endpoint nu renvoie donc du **français**. La langue doit toujours être explicite, `?lang=en` compris |

Ces deux points sont déjà corrigés dans le code, sur `dev`. Seule la documentation reste à mettre à jour.
