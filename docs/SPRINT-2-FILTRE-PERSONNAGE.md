# Sprint 2 — Filtre personnage

État au 2026-09-21. Référence sur la logique du filtre personnage (grimoire, profil de classe, sous-classe, multiclasse, plusieurs personnages). Le sujet est terminé sur cette branche. À supprimer une fois la branche fusionnée dans `dev`.

## Terminé — grimoire personnel et profil du lanceur de sorts

Un grimoire personnel équivaut à un personnage : ses sorts sauvegardés et ses classes lui sont propres.

### Stockage

Clef `localStorage` unique : `dnd-personal-spellbook`, format v4 (lecture tolérante de tous les formats antérieurs, v0 tableau brut jusqu'à v3 profil unique — migrés en un seul personnage nommé « Personnage 1 ») :

```json
{
  "version": 4,
  "activeCharacterId": "…",
  "characters": [
    { "id": "…", "name": "Personnage 1", "spells": [], "profiles": [] }
  ]
}
```

- Le personnage **actif** est isolé par onglet (`sessionStorage`, jamais partagé) : ouvrir deux fenêtres permet de comparer deux personnages différents sans qu'ils se forcent mutuellement.
- Les **données** des personnages restent synchronisées entre onglets (`localStorage` + événement `storage`) : une modification faite dans un onglet se retrouve dans l'autre s'il regarde le même personnage. Limite acceptée : deux onglets qui modifient des personnages différents au même instant restent en dernier-écrit-gagne sur le tableau `characters` entier.
- Toujours au moins un personnage ; suppression du dernier impossible (bouton désactivé côté UI).

### Profil du lanceur de sorts

- Un profil = `{ classIndex, characterLevel, subclassIndex, subclassFeatureIndex }`. Un personnage porte une liste de profils (`profiles: SpellcasterProfile[]`) pour gérer le multiclasse.
- Niveau facultatif : sans niveau précisé, tous les sorts de la classe sont accessibles (« niveau max »).
- Sous-classe : dropdown conditionné au niveau de déblocage, vérifié par classe auprès de l'API (`/classes/{class}/levels/{n}`), pas uniformément niveau 3 :

  | Niveau de déblocage | Classes |
  |---|---|
  | 1 | Clerc, Ensorceleur, Occultiste |
  | 2 | Druide, Magicien |
  | 3 | Barbare, Barde, Guerrier, Moine, Paladin, Rôdeur, Roublard |

- Sorts accordés par une sous-classe (hors liste de base de la classe, ex. Fiélon de l'Occultiste) : accordés d'office, non limités par les emplacements de sort de la classe. Repasser sous le seuil de déblocage retire la sous-classe du profil.
- Cas particulier Druide / Cercle de la Terre : sous-choix de terrain (dropdown supplémentaire), permissif tant que non précisé (aucun sort écarté sans choix explicite).
- Multiclasse : plusieurs blocs classe/niveau/sous-classe/terrain par personnage, sans plafond. Un sort est accessible s'il l'est pour **au moins un** bloc (union) ; les niveaux ne s'additionnent jamais entre classes ni au sein d'une même classe.
- Sort hors profil : grisé, jamais retiré, reste consultable et ajoutable au grimoire. La fiche d'un sort est toujours affichée, même hors profil. Masquage optionnel (« Masquer les sorts hors profil ») limité à la liste complète.
- Multi-classes de base (un sort listant plusieurs classes, ex. Soins) : géré nativement par `/classes/{class}/spells`, aucune règle supplémentaire nécessaire.

### Fichiers clés

| Fichier | Rôle |
|---|---|
| `src/hooks/usePersonalSpellbook.ts` | Stockage v4 : personnages, profils, sorts sauvegardés, isolation par onglet |
| `src/hooks/useSpellAccess.ts` | Accessibilité pour un seul bloc classe/sous-classe |
| `src/hooks/useMultiSpellAccess.ts` | Union sur plusieurs blocs (multiclasse) |
| `src/hooks/useMultiKeyedFetch.ts` | Fetch/cache pour une liste de clefs (évite les hooks en boucle) |
| `src/utils/spellAccess.ts` | Règle d'accessibilité, fonction pure partagée entre les deux hooks ci-dessus |
| `src/api/subclasses.ts` | Sous-classes d'une classe et sorts qu'elles accordent |
| `src/data/subclassUnlockLevel.ts` | Niveau de déblocage de la sous-classe, par classe |
| `src/components/SpellcasterProfileForm.tsx` | Un bloc classe/niveau/sous-classe/terrain, autonome |
| `src/components/CharacterSelector.tsx` | Sélection, création, suppression, renommage de personnage |
| `src/components/PersonalSpellbookPanel.tsx` | Liste des sorts sauvegardés du personnage actif |
| `src/App.tsx` | Compose l'ensemble |

## Clos — sorts interclasses / règles maison

Décision : on suit les règles officielles, pas de solution maison. Les multi-classes de base et les sorts de sous-classe couvrent les cas réels rencontrés ; ajout manuel d'un sort hors liste et règles maison configurables sont abandonnés, hors périmètre définitivement.

## Reste à faire

- Style complet du formulaire de profil et du sélecteur de personnage (charte DESIGN.md) — une base fonctionnelle est posée (bordures, état désactivé visible), pas la charte graphique finale.
- Mettre en avant le bouton « Masquer les sorts hors profil ».
- `useKeyedFetch` ne retente jamais une clef en échec (`src/hooks/useKeyedFetch.ts`) — hors périmètre de ce sprint.
- Type de zone d'effet (`sphere`, `cube`...) et nom du type de dégâts non traduits par l'API en anglais — hors périmètre de ce sprint.
- Un `stash` obsolète traîne dans le dépôt (brouillon de grimoire antérieur, remplacé par `248b6f9`) — à supprimer.

## Corrections déjà portées dans SPECS.md

Ratio de jeu `× 0.3` (pas la conversion réelle `× 0.3048`) et paramètre `?lang=` toujours explicite (pas de repli automatique sur l'anglais) : corrigés dans le code et dans SPECS.md pendant ce sprint.
