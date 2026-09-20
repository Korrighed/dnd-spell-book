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

## Fait — sorts accordés par sous-classe

Implémenté le 2026-09-21, en reponse au point ouvert ci-dessous.

| Fichier | Rôle |
|---|---|
| `src/api/subclasses.ts` | `fetchClassSubclasses`, `fetchSubclassSpells` (grants + prérequis niveau/terrain) |
| `src/data/subclassUnlockLevel.ts` | Niveau de déblocage de la spécialisation, par classe |
| `src/hooks/useClassSubclasses.ts` | Liste des sous-classes d'une classe |
| `src/hooks/useSpellAccess.ts` | Fusionne les sorts de la sous-classe avec ceux de la classe |
| `src/components/SpellcasterProfileForm.tsx` | Dropdown sous-classe (conditionnel au niveau) + dropdown terrain (Druide) |
| `src/hooks/usePersonalSpellbook.ts` | Profil v2 étendu : `subclassIndex`, `subclassFeatureIndex` (lecture tolérante, pas de bump de version) |

Décisions :

- Niveau de déblocage de la sous-classe **vérifié par classe**, pas uniformément 3 : Clerc/Ensorceleur/Occultiste = 1, Druide/Magicien = 2, les 7 autres = 3 (`/classes/{class}/levels/{1,2,3}`).
- Repasser sous le seuil efface `subclassIndex`/`subclassFeatureIndex` (le personnage ne l'a plus). Changer de classe fait de même.
- Sous-choix (terrain du Cercle de la Terre du Druide) : dropdown supplémentaire, non précisé par défaut = **permissif**, même règle que le niveau facultatif (rien n'est écarté tant que non choisi).
- Sort connu uniquement via la sous-classe (absent de la liste de base) : accordé d'office, pas limité par les emplacements de sort de la classe.
- Le SRD n'expose qu'une seule sous-classe par classe (licence) : le dropdown n'a qu'une option utile pour l'instant, mais rien dans le code ne suppose une liste à un seul élément.

Validé dans le navigateur le 2026-09-21 : Occultiste 1 + Fiélon → *Mains brûlantes* accessible (hors liste Occultiste) ; *Cécité/Surdité* hors profil jusqu'au niveau 3 ; Paladin niveau 2→3 fait apparaître/disparaître le dropdown sous-classe avec effacement correct ; Druide + Terre + terrain Littoral/Arctique filtre correctement *Cône de froid*.

## Fait — multiclasse

Implémenté le 2026-09-21. Constat utilisateur : en D&D un personnage peut avoir des niveaux dans plusieurs classes (ex. niveau de personnage 4 = Ensorceleur 3 + Magicien 1). Le profil ne portait qu'une seule classe.

| Fichier | Rôle |
|---|---|
| `src/hooks/usePersonalSpellbook.ts` | `profile` unique → `profiles: SpellcasterProfile[]`. Stockage v3, migration v2 → `[profile]`. `setProfileAt`, `addProfile`, `removeProfileAt` |
| `src/utils/spellAccess.ts` | `isSpellAccessibleForProfile` : regle d'accessibilite extraite en fonction pure, partagee entre un seul bloc et plusieurs |
| `src/hooks/useMultiKeyedFetch.ts` | Variante de `useKeyedFetch` pour une liste de clefs (evite d'appeler un hook dans une boucle de longueur variable) |
| `src/hooks/useMultiSpellAccess.ts` | Union sur tous les blocs, utilisee une fois dans `App.tsx` pour le filtrage et le grise |
| `src/hooks/useSpellAccess.ts` | Inchange dans son usage (un seul bloc) ; `check` appelle desormais la fonction partagee au lieu de repeter la regle |
| `src/components/SpellcasterProfileForm.tsx` | Devient autonome par bloc : charge lui-meme ses sous-classes et son accessibilite (`useClassSubclasses`, `useSpellAccess` en interne). Props reduites a `classes`, `profile`, `onChange` |
| `src/App.tsx` | Affiche un bloc par entree de `profiles`, plus un bloc vide en fin de liste pour ajouter une classe |

Décisions :

- **Un bloc classe/niveau/sous-classe/terrain par classe**, pas de calcul a partir d'un total de niveaux de personnage agrege. Aucun plafond ni validation croisee sur la somme des niveaux : rien n'empeche de mettre 20 dans deux classes a la fois, aucune regle de coherence codee (choix explicite de l'utilisateur).
- **Accessibilite par bloc, sans agregation** : un sort est accessible s'il l'est pour **au moins un** des blocs (union). Un sort reserve au niveau 5 Magicien reste hors profil si le seul bloc Magicien est a 1, meme si un autre bloc a 20 niveaux dans une autre classe. Un niveau dans une classe ne debloque jamais un palier superieur dans une autre classe, ni via un total combine dans la meme classe. Choix explicite qui evite de reproduire la vraie table d'emplacements de sorts multiclasse du PHB (agregation fractionnaire par classe), jugee hors scope ici.
- `onChange(null)` sur un bloc rempli retire ce bloc de la liste (au lieu de vider l'unique profil comme avant). Le bloc vide en fin de liste sert uniquement a en ajouter un nouveau.
- Pas de plafond sur le nombre de classes : l'utilisateur a laisse le choix libre, tout en notant qu'en pratique les joueurs multiclassent rarement au-dela de deux classes (moins rentable).

Validé par `npx tsc --noEmit`, `npm run lint` et `npm run build`. Test manuel en attente (parcours donné en session, pas encore rejoué depuis cette version).

## Réflexion à reprendre — sorts interclasses

Constat utilisateur : un personnage peut apprendre des sorts d'autres listes de classe. Le filtre actuel (liste de la classe seule) est trop strict pour la table.

### Vérifié le 2026-09-21 — le cas multi-classes n'est pas un problème

Hypothèse testée : sur la fiche officielle, un sort listant plusieurs classes entre parenthèses (ex. « Soins, Barde/Clerc/Druide/Paladin/Rôdeur ») doit être accessible à chacune d'elles.

Confirmé par appel direct à l'API :

- `cure-wounds` → `classes: [Bard, Cleric, Druid, Paladin, Ranger]`.
- Il apparaît bien dans `/classes/bard/spells` **et** `/classes/cleric/spells` (vérifié sur les deux).
- `fireball` → `classes: [Sorcerer, Wizard]` seulement ; `hellish-rebuke` → `[Warlock]` seul. Le champ `classes` d'un sort ne s'etend jamais aux sous-classes qui l'accordent hors liste : confirme plus bas avec `burning-hands`, qui reste `[Sorcerer, Wizard]` alors que le Fielon (sous-classe Occultiste) l'accorde des le niveau 1.

`useSpellAccess` interroge déjà `/classes/{class}/spells` pour la classe du profil : un sort listant plusieurs classes apparaît dans la liste de chacune. Un profil Barde voit donc déjà `cure-wounds` comme accessible. **Rien à corriger ici.**

Le vrai point ouvert reste les sorts accordés **par une sous-classe** en plus de la liste de base (ex. `hellish-rebuke` pour un Paladin via son serment) — cf. section sous-classes ci-dessous.

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

## Corrections portées dans SPECS.md

Les deux écarts entre le code (déjà corrigé, sur `dev`) et la section *Localisation française* des SPECS sont reportés dans le document : ratio de jeu `× 0.3` au lieu de `× 0.3048`, et paramètre `?lang=` toujours explicite (pas de repli automatique sur l'anglais).
