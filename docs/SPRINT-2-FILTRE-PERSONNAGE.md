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
| `src/hooks/usePersonalSpellbook.ts` | Stockage v4 : personnages, profils (identifiés par `id`), sorts sauvegardés, isolation par onglet |
| `src/hooks/useMultiSpellAccess.ts` | Union sur plusieurs blocs (multiclasse), expose aussi `perProfile` (donnée par bloc, un seul fetch partagé) |
| `src/hooks/useMultiKeyedFetch.ts` | Fetch/cache pour une liste de clefs (évite les hooks en boucle) |
| `src/utils/spellAccess.ts` | Règle d'accessibilité (fonction pure) et type `SpellAccessCheck` partagés |
| `src/api/subclasses.ts` | Sous-classes d'une classe et sorts qu'elles accordent |
| `src/data/subclassUnlockLevel.ts` | Niveau de déblocage de la sous-classe, par classe |
| `src/components/SpellcasterProfileForm.tsx` | Un bloc classe/niveau/sous-classe/terrain, autonome |
| `src/components/CharacterSelector.tsx` | Sélection, création, suppression, renommage de personnage |
| `src/components/PersonalSpellbookPanel.tsx` | Liste des sorts sauvegardés du personnage actif |
| `src/App.tsx` | Compose l'ensemble |

## Fait — revue de code et corrections

Revue du diff `dev..feature/spell-detail-layout` par trois angles (architecture, frontend, robustesse) le 2026-09-21. Corrections retenues et appliquées :

- **Boucle d'écriture infinie entre onglets** : chaque onglet réécrivait son propre `activeCharacterId` dans le `localStorage` partagé en réaction à l'écriture de l'autre, ce qui redéclenchait un event `storage` en retour, indéfiniment, dès que deux onglets avaient des personnages actifs différents. Corrigé par un flag (`skipNextPersist`) qui empêche de réécrire le stockage quand la mise à jour vient d'un autre onglet.
- **`crypto.randomUUID()` absent → écran blanc** : sans repli, l'app entière plantait au démarrage hors contexte sécurisé (HTTPS/localhost) ou sur très vieux navigateur. `generateId()` retombe sur un id manuel si `crypto.randomUUID` n'existe pas.
- **Fetch dupliqué entre bloc et vue globale** : `SpellcasterProfileForm` ne fait plus son propre fetch (ancien `useSpellAccess`, supprimé, devenu inutile) ; il reçoit `maxSpellLevel`/`subclassSpellGrants`/`loading`/`error` calculés une seule fois par `useMultiSpellAccess` (champ `perProfile`, un élément par profil).
- **Cascade de fetchs redondants** dans `useMultiKeyedFetch` (résoudre une clef relançait un fetch pour toutes les clefs encore en attente) : corrigé avec un `Set` des clefs en vol.
- **Profils adressés par position (`index`) au lieu d'un id stable** : un event `storage` peut remplacer le tableau `profiles` sous le formulaire, un `onChange` déclenché ensuite écrivait alors sur le mauvais bloc. `SpellcasterProfile` porte maintenant un `id`, `setProfileAt`/`removeProfileAt` sont devenus `setProfileById`/`removeProfileById`.
- **Sous-classe qui disparaît de l'UI sans se désactiver** : si le fetch de la liste des sous-classes échoue ou est encore en cours, le dropdown (et son bouton pour la retirer) restent maintenant visibles tant que le profil a une sous-classe enregistrée, avec un message d'erreur/chargement explicite.
- **Suppression de personnage sans confirmation** : ajout d'une confirmation bloquante (`window.confirm`), seule action de l'app qui en a une — c'est aussi la seule irréversible sur des données entières (sorts + classes), contrairement au retrait d'un sort.
- **Renommage écrit à chaque frappe** : passé en brouillon local, commité seulement au blur/Entrée, avec garde contre un nom vide.
- **Boutons non distinctifs en multiclasse** : chaque bloc est un `<fieldset>` nommé (`<legend>`), les `aria-label` incluent le nom de la classe du bloc.
- **`SPECS.md` périmé** sur l'existence d'une entité personnage et la désactivation des fonctions interactives hors profil : mis à jour pour refléter les décisions réelles.

Décisions différées (rapportées mais non corrigées, avec la raison) :

- **Versionnage du stockage devine la forme des données plutôt que lire `version`** : fonctionne jusqu'à v4 car chaque version a changé le conteneur de tête, mais fragile pour une v5 qui changerait la structure interne d'un personnage. Refonte (`switch` explicite sur `version`) jugée trop risquée à faire vite dans un fichier déjà dense en logique de migration, sans tests. À reprendre si une v5 est nécessaire.
- **`useKeyedFetch`/`useMultiKeyedFetch` ne retentent jamais une clef en échec** : dette déjà connue et acceptée pour `useKeyedFetch` ; confirmée présente aussi dans `useMultiKeyedFetch`. Pas de correction : demande un mécanisme de retry (bouton ou minuterie) hors périmètre de cette revue.
- **`localStorage.clear()` recrée un personnage par défaut qui écrase le clear** : examiné, jugé être le comportement correct pour une app qui doit continuer à fonctionner (pas de meilleure alternative sans un état "app cassée" explicite).
- **Bascule silencieuse dans un autre onglet si le personnage qu'il affiche est supprimé ailleurs** : pas de notification (pas de système de toast dans l'app). Comportement de repli déjà correct (pas de crash, pas de perte de données), juste sans avertissement.

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
