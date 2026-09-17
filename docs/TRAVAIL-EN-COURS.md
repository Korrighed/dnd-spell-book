# Travail en cours — `feature/personal-spellbook`

État au 2026-09-17. Ce document décrit ce qui est fait, ce qui reste, et les pièges rencontrés. À supprimer une fois la branche fusionnée dans `dev`.

## Position des branches

```
49745ba  fix(grimoire): affiche toujours la fiche d'un sort, meme grise ou masque
345b33d  docs(grimoire): consigne le parcours valide et la prochaine etape
423a781  chore(dev): ajoute des cadres de developpement autour des composants
d25cb2d  fix(grimoire): reserve le gris aux sorts hors profil
c9340ef  fix(grimoire): cache la fiche d'un sort masque ouvert depuis la liste
94dce64  feat(grimoire): rend le niveau du profil facultatif et ajoute l'effacement
497ff3d  feat(grimoire): ajoute l'option de masquer les sorts hors profil
5d7e415  fix(grimoire): applique reellement le Slate Gray aux sorts hors profil
fb2e71d  feat(grimoire): grise les sorts hors du profil du lanceur
a952faf  feat(grimoire): ajoute la saisie du profil du lanceur de sorts
cda09b9  feat(grimoire): deduit les sorts accessibles depuis le profil du lanceur
2f20325  feat(grimoire): passe le stockage en v2 avec le profil du lanceur de sorts
e6c43b1  docs(grimoire): note l'etat de la branche et la suite a implementer
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

## Fait — profil du lanceur de sorts (pré-filtres)

Décisions validées le 2026-09-17 :

- L'utilisateur saisit **classe + niveau de personnage**. Le système en déduit les sorts accessibles.
- Les pré-filtres s'appliquent à la **liste complète** et au **grimoire personnel**.
- Un sort hors profil est **grisé**, jamais retiré. Il reste consultable et peut être ajouté au grimoire, où il reste grisé.
- Option « Masquer les sorts hors profil » : liste complète uniquement.
- La fiche d'un sort s'affiche **toujours**, même grisé ou masqué de la liste. Le masquage de la fiche (`c9340ef`) a été retiré après test (`49745ba`).
- Niveau facultatif : sans niveau, tous les sorts de la classe sont accessibles (« Niveau max »). Un × par menu, plus « Effacer ».
- Retirer la classe efface le profil entier. Changer de classe conserve le niveau.
- Texte normal en `--text-h` : le gris est réservé aux sorts hors profil.
- Les filtres de vue (`levelFilter`, `classFilter`) masquent toujours. Ils se cumulent avec le profil.
- Interface minimale : les fonctions d'abord, le style ensuite.

Parcours utilisateur validé le 2026-09-17 (13 étapes).

Outil de dev : `src/dev/DevFrame.tsx` encadre les composants en `npm run dev`, avec leurs hooks et états. Liste des pastilles tenue à la main dans `App.tsx`.

| Fichier | Rôle |
|---|---|
| `src/hooks/usePersonalSpellbook.ts` | Stockage v2 : `spells` + `profile` |
| `src/api/classes.ts` | `fetchClassLevelSpellcasting`, `fetchSpellcastingClassIndices` |
| `src/hooks/useSpellAccess.ts` | `isAccessible(index, level)`, `null` sans profil |
| `src/hooks/useSpellcastingClasses.ts` | Classes portant un bloc `spellcasting` |
| `src/components/SpellcasterProfileForm.tsx` | Saisie du profil, dans le panneau du grimoire |
| `src/components/OutOfProfileLabel.tsx` | Mention textuelle « (hors profil) » |

Format de stockage v2 (lecture tolérante de v0 et v1) :

```json
{ "version": 2, "spells": [], "profile": { "classIndex": "wizard", "characterLevel": 6 } }
```

Règle d'accessibilité :

- le sort figure dans `/classes/{class}/spells` ;
- sort mineur : `cantrips_known > 0` ;
- sinon : niveau ≤ max(plus haut `spell_slots_level_N` non nul, plus haut `mystic_arcanum_level_N` non nul).

L'arcane mystique est dans `class_specific` : sans lui, un occultiste niveau 11 plafonnerait à 5 au lieu de 6.

Validé dans le navigateur : Magicien 6 → max 3, Occultiste 11 → max 6 (50 sorts), 8 classes proposées, grisé, bandeau sur la fiche, masquage, retrait du profil.

## Reste à faire

- **Accès aux sorts hors liste de classe** : reporté à une session ultérieure. Réflexion en cours, voir ci-dessous.
- Style du formulaire de profil et du grisé (charte DESIGN.md).
- Mettre en avant « Masquer les sorts hors profil » : bascule entre navigation libre et sélection rapide.

## Réflexion à reprendre — sorts interclasses

Constat utilisateur : un personnage peut apprendre des sorts d'autres listes de classe. Le filtre actuel (liste de la classe seule) est trop strict pour la table.

Ce que dit l'API (SRD 5.1, vérifié le 2026-09-17) :

- La règle servie est la liste de classe. Texte dans `/classes/{class}` → `spellcasting.info` : *« from the wizard spell list »*.
- Endpoints de règles disponibles : `/rules`, `/rule-sections`, `/features/{index}` (texte Markdown, FR avec `?lang=fr-FR`). Exploitables pour l'affichage, pas pour un calcul automatique.
- Exceptions officielles exposées :
  - sous-classes : champ `spells` avec prérequis de niveau (`life`, `fiend`, `land`, `devotion`) ;
  - Secrets magiques du barde (`magical-secrets-1`) : texte seulement.
- Hors SRD, donc absents : dons (Initié à la magie), autres sous-classes.
- Sorts de soin repérables : champ `heal_at_slot_level`, 10 sorts. Requête GraphQL `POST /graphql/2014` : `aid`, `cure-wounds`, `false-life`, `heal`, `healing-word`, `mass-cure-wounds`, `mass-heal`, `mass-healing-word`, `prayer-of-healing`, `regenerate`. Approximatif : `lesser-restoration` et `revivify` n'y sont pas.

Pistes évoquées :

1. **Ajout manuel** d'un sort hors liste par l'utilisateur : jugé acceptable.
2. **Règles maison** : nécessaires, car un joueur ne sait pas forcément qu'il peut apprendre des sorts d'une autre classe. Exemple cité : « un magicien peut apprendre tous les sorts sauf les sorts de soin ». Aucun endpoint ne fournit ces règles : à coder en local.

Questions ouvertes :

- Format des règles maison : fichier de configuration fixe, réglage dans l'interface, ou les deux.
- Qui les définit : le MJ pour toute la table, ou chaque joueur.
- Affichage d'un sort accessible par règle maison : normal, ou marqué différemment.
- Prise en compte de la sous-classe dans le profil.
- Fonctions interactives de la fiche à désactiver hors profil : aucune pour l'instant. À brancher avec le futur sélecteur de niveau d'incantation.
- Sous-classes lanceuses (Chevalier occulte, Escroc arcanique) : hors périmètre.

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
