# Design brief — Grimoire de sorts, lot « finitions feature/css »

Statut : brouillon
Sources : [DESIGN.md](DESIGN.md) (charte : palette, polices, icônes Lucide), maquettes `docs/Maquettes/`, revue du 2026-10-15 (constats B1–B7, A1–A6).

Ce document ne recopie pas la charte. Il fixe ce qui manque pour ce lot : vue Personnage, indicateur de page, écarts de contraste et d'icônes. [DESIGN.md](DESIGN.md) reste la source pour la palette et les polices.

## 1. Intention

Un grimoire de papier, sobre, que l'on manipule sans mode d'emploi. Chaque action se comprend par son libellé ou son icône, et l'état courant (personnage actif, page, filtre) se voit sans chercher. Le soin visuel ne doit jamais coûter la lisibilité.

## 2. Références visuelles

| Référence | Ce qu'on en garde |
|---|---|
| Onglets marque-pages actuels (`App.css`, `.bookmark`) | Bouton plein Caput Mortuum, icône Tan : style des actions principales. |
| Feuille de vue actuelle (`.bookmark-view`) | Papier, bordure Coffee 2 px, rayon 8 px, titres OLDWEST Caput Mortuum. |
| Pastilles de filtres courantes (puces) | Sélection du personnage actif en pastilles, au lieu d'une liste déroulante. |

## 3. Fondations

### Couleurs

Palette de la charte inchangée. Ajouts du lot, en variables dans `src/index.css` :

| Token | Valeur | Usage | Contraste vérifié |
|---|---|---|---|
| `--slate-gray-text` | `#576b82` | Texte des sorts hors profil (remplace `--slate-gray` pour le texte seulement) | 4,59:1 sur `--paper` `#f3ead9`, 5,27:1 sur `#fffaf0`, 5,48:1 sur blanc |
| `--caput-mortuum-hover` | `#7a2a2f` | Survol des boutons Caput Mortuum (remplace les 4 valeurs en dur) | Tan dessus : 5,05:1 |
| `--paper-light` | `#fffaf0` | Fond des champs et des cartes dans les vues (remplace les 2 valeurs en dur) | — |
| `--coffee` (existant) | `#6f4d38` | Bordure de tous les champs (`input`, `select`) et des cartes | 6,29:1 sur `--paper`, 7,22:1 sur `#fffaf0` (seuil 3:1) |
| `--paper` (existant) | `#f3ead9` | Lien du pied de page, souligné (remplace Tan) | 6,14:1 sur le bandeau voilé (mesure pixel) |

Décision D-01 (2026-10-15) : texte hors profil en `#576b82`.
Rejeté : garder Slate Gray (3,82:1, échec AA) et passer la mention en Coffee (le grisé perd son rôle de signal).
Raison : la teinte reste celle de la charte, et le contraste passe le seuil AA. À reporter dans [DESIGN.md](DESIGN.md) (ligne Slate Gray).

### Typographie

| Rôle | Police | Taille / graisse | Repli |
|---|---|---|---|
| Titre de vue (`h2`) | OLDWEST | existant | serif |
| Titre de section dans une vue (`h3`) : « Personnages », « Classes » | OLDWEST, Caput Mortuum | existant (`App.css`, h3 des vues) | serif |
| Nom du personnage actif | TimeBurner Bold | 1.2em | sans-serif |
| Champs et boutons des vues | TimeBurner | **16 px minimum** (évite le zoom iOS au focus) | sans-serif |
| Indicateur de page | TimeBurner | même taille que le compteur | sans-serif |

### Espacements, rayons

- Champs et boutons des vues : hauteur 44 px minimum, rayon 6 px (même rayon que les onglets).
- Cartes de classe : padding 12 px, rayon 8 px, `gap` 8 px entre les champs. Plus d'espaces `{' '}` entre éléments.
- Pastilles : hauteur 44 px, rayon 999 px, padding horizontal 16 px.

### Icônes

Lucide uniquement ([DESIGN.md](DESIGN.md)), fichiers SVG dans `public/icons/`, affichés en masque CSS (`currentColor`). Source vérifiée le 2026-10-15 : `lucide-static` 1.57.0 (licence ISC), `https://unpkg.com/lucide-static@1.57.0/icons/<nom>.svg`. Attributs Lucide conservés tels quels (`stroke-width="2"`, `viewBox="0 0 24 24"`), en-tête de licence compris.

| Usage | Icône Lucide | Remplace |
|---|---|---|
| Fermer une vue | `x` | `x.svg` actuel (tracé non Lucide) |
| Bouton œil, sorts hors profil visibles | `eye` | `spellbook-eye.svg` |
| Bouton œil, sorts hors profil masqués | `eye-off` | `spellbook-eye-off.svg` |
| Bouton grimoire de la fiche, ajouter | `book-plus` | `favourite-book.svg` + `plus.svg` |
| Bouton grimoire de la fiche, retirer | `book-minus` | `favourite-book.svg` + `minus.svg` |
| Renommer le personnage | `pencil` | — (nouveau) |
| Supprimer le personnage | `trash-2` | — (nouveau) |
| Nouveau personnage | `plus` | `plus.svg` existant |
| Onglet Grimoire, aide | `book-heart` | `favourite-book.svg` |
| Tournage de page | `circle-arrow-left`, `circle-arrow-right` | fichiers actuels du même nom (tracé non Lucide, couleur `#632024` écrite dans le SVG) |

Décision D-02 (2026-10-15) : remplacer toutes les icônes non Lucide, celles de la branche comme celles déjà présentes sur `dev`.
Rejeté : exception documentée dans la charte, remplacement partiel.
Raison : la charte impose un seul jeu d'icônes.

Conséquence : `PageTurnZone` affiche aujourd'hui son icône en `<img>`, où `currentColor` ne s'applique pas. Il passe au masque CSS comme les autres icônes, en couleur Caput Mortuum. Les fichiers devenus inutiles (`favourite-book.svg`, `spellbook-eye*.svg`, `minus.svg`, `arrow-up-1-0.svg`, `circle-plus.svg`, `square-minus.svg`) sont supprimés.

## 4. Composants

| Composant | États | Notes |
|---|---|---|
| Pastille de personnage | repos : fond `--paper-light`, bordure Coffee, texte noir. Survol : bordure Caput Mortuum. Actif (sélectionné) : fond Caput Mortuum, texte Tan. Focus : contour `--focus`. | `<button aria-pressed>`. Nom tronqué par points de suspension au-delà de 16 caractères visibles (`max-width` + `text-overflow`), nom complet en `title`. |
| Pastille « + » (nouveau personnage) | comme une pastille au repos, icône `plus` | `aria-label` « Nouveau personnage ». Ouvre le formulaire de création en place. |
| Bouton icône (renommer, supprimer) | repos : fond transparent, icône Coffee. Survol : fond `--accent-bg`. Désactivé : opacité 0.5, `cursor: not-allowed`. | 44 × 44 px, `aria-label` + `title`. |
| Bouton principal (Valider, Créer) | repos : fond Caput Mortuum, texte Tan. Survol : `--caput-mortuum-hover`. Désactivé : opacité 0.5. | Même style que les onglets. |
| Bouton secondaire (Annuler, Retirer) | repos : fond transparent, bordure Coffee, texte noir. Survol : bordure Caput Mortuum. | |
| Champ texte, liste déroulante | bordure 1 px Coffee, fond `--paper-light`, 16 px, hauteur 44 px. Focus : contour `--focus`. | Une seule règle partagée pour toutes les vues (fin des doublons `CharacterSelector.css` / `SpellcasterProfileForm.css`). |
| Carte de classe | fond `--paper-light`, bordure 1 px Coffee, rayon 8 px | `<fieldset>`, `<legend>` = nom de la classe. Un seul bouton « Retirer » par carte. |
| Carte « Ajouter une classe » | bordure en pointillés Coffee | Toujours en dernier. Contient seulement la liste « Classe ». |
| Indicateur de page | texte simple, sur la ligne du compteur | `319 / 319 sorts · page 2 / 23`. Voir §5. |
| Infobulle du bouton grimoire (fiche) | apparaît **sous** le bouton | Corrige B1 (infobulle coupée au-dessus). |

### Vue Personnage : maquette

```
PERSONNAGE                                        (x)

PERSONNAGES
( Gandalf ) ( Elminster ) ( + )

Gandalf                              (crayon) (corbeille)

CLASSES
+--------------------------------------------------+
| Magicien                               [Retirer] |
| Classe [Magicien v]  Niveau [5 v]                |
| Sous-classe [Ecole d'evocation v]                |
| Sorts accessibles : jusqu'au niveau 3            |
+--------------------------------------------------+
+ - - - - - - - - - - - - - - - - - - - - - - - - +
| Ajouter une classe (multiclasse)                 |
| Classe [Choisir une classe v]                    |
+ - - - - - - - - - - - - - - - - - - - - - - - - +
```

- Création : la pastille « + » remplace la rangée d'actions par un formulaire `[Nom ____] [Créer] [Annuler]`. Entrée crée, Échap annule sans fermer la vue.
- Renommage : le crayon remplace le nom par `[Nom ____] [Valider] [Annuler]`. Mêmes touches.
- Suppression : la corbeille remplace la rangée d'actions par `Supprimer « Gandalf », ses classes et ses sorts ? [Supprimer] [Annuler]`. Ici, `Supprimer` est un bouton principal (Caput Mortuum). Échap annule sans fermer la vue. Plus de `window.confirm`.
- Noms :
  - 40 caractères maximum (`maxLength`), espaces de début et de fin retirés, nom vide refusé ;
  - nom déjà pris par un **autre** personnage refusé, sans tenir compte des majuscules ni des accents (`normalizeForSearch`, `src/utils/text.ts`). Message sous le champ : « Ce nom est déjà pris. » (`role="alert"`). Les doublons déjà enregistrés ne sont pas modifiés.
- Section « Classes » : sous le titre, la ligne `Niveau total : 8 / 20`. Si des données anciennes dépassent 20 : `Niveau total : 25 / 20, réduisez un niveau`, en Caput Mortuum. Aucune correction automatique.
- Carte de classe : les boutons `×` à côté des champs et le bouton « Effacer » disparaissent. Pour vider un champ, on choisit l'option vide de sa liste : « Niveau non précisé (tous les sorts) », « Aucune sous-classe », « Non précisé ». L'option « Aucune classe » disparaît des cartes existantes : seul « Retirer » enlève une classe.
- Libellés :
  - « Sorts accessibles : jusqu'au niveau N » ;
  - sans niveau : « Sorts accessibles : tous les niveaux (niveau non précisé) ».
- Tous les libellés français prennent leurs accents.

## 5. Mise en page et responsive

| Point de rupture | Comportement |
|---|---|
| Desktop (> 899 px) | Pastilles sur une ligne, retour à la ligne si besoin. Cartes de classe pleine largeur de la vue. Indicateur de page sur la ligne du compteur. |
| Mobile (≤ 899 px) | Pastilles à la ligne (pas de défilement horizontal de la page). Champs d'une carte empilés, un par ligne. Vues en panneau pleine largeur, sans croix, fermées en glissant vers le bas (détail : [APP-FLOW.md §4](APP-FLOW.md#4-desktop--mobile)). Indicateur sur une ligne dans la colonne de 250 px (à vérifier : 3 chiffres + 2 chiffres). |

Aucune largeur de vue ne doit provoquer de défilement horizontal, quel que soit le nom saisi (corrige B4).

## 6. Mouvement

Aucun ajout. L'indicateur de page disparaît avec le reste de la page pendant le tournage, comme le compteur aujourd'hui.

Décision D-03 (2026-10-15) : indicateur sur la ligne du compteur.
Rejeté : ligne d'état toujours affichée (le texte flotterait au-dessus de la page 3D qui tourne).
Raison : cohérent avec l'illusion du livre. Pour les lecteurs d'écran, une zone `aria-live="polite"` invisible, toujours montée dans `BookSpread` hors de la porte `isTurning`, annonce « Page 2 sur 23 ».

## 7. Accessibilité

- Contraste texte ≥ 4,5:1, bordures de champs et éléments d'interface ≥ 3:1 (voir §3).
- Focus visible sur tout élément interactif (règle existante `--focus`).
- Cibles tactiles ≥ 44 × 44 px dans la vue Personnage. Les autres cibles (onglets, aide, `×` de ligne du grimoire) restent hors lot (constat A5, mineur).
- Vues : le focus ne sort pas de la vue ouverte par Tab, et Échap la ferme où que soit le focus dans la vue (corrige B3). La barre d'outils est inerte pendant qu'une vue est ouverte, sauf les onglets.
- Bouton œil : nom accessible et infobulle concordants. Nom fixe « Masquer les sorts hors profil » + `aria-pressed` (vrai = masquage actif), et `title` identique au nom.
- Bouton grimoire : un appui long relâché hors du bouton ne bloque plus le clavier (corrige B2).

## 8. Décisions du 2026-10-15 (questions résolues)

| ID | Décision | Rejeté | Raison |
|---|---|---|---|
| D-04 (Q-01) | Niveau total plafonné à 20 en multiclasse. Un niveau « non précisé » ne compte pas dans le total. Chaque carte propose les niveaux 1 à (20 − somme des niveaux précisés des autres cartes), plus « Niveau non précisé (tous les sorts) ». | Pas de plafond. Niveau obligatoire en multiclasse. | Règle D&D respectée sans casser l'usage « non précisé = tous les sorts de la classe ». |
| D-05 (Q-02) | Confirmation de suppression intégrée à la vue. | `window.confirm` (non stylable). | Cohérence visuelle, Échap maîtrisé. |
| D-06 (Q-03) | `favourite-book` et `circle-arrow-*` remplacés par Lucide dans ce lot. | Plus tard. | Charte entièrement respectée. |
| D-07 (Q-04) | Titre de la vue Grimoire : « Grimoire de Gandalf » (`Gandalf's spellbook` en anglais). | Aucun affichage. | Le personnage actif devient visible hors de sa vue. |
| D-08 (Q-05) | Nom déjà pris refusé (voir §4). | Doublons autorisés. | Pastilles toujours distinctes. |

## 9. Questions ouvertes

Aucune.
