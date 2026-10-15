# T004 — Passer toutes les icônes à Lucide

Statut : fait
Story : constat M4 (front), A4 · Exigences : D-02, D-06 ([DESIGN-BRIEF.md §3 Icônes](../DESIGN-BRIEF.md#icônes))
Dépend de : T003
Parallélisable : non
Exécutant : workflow:front

## Objectif

Toutes les icônes affichées viennent de `lucide-static` 1.57.0, copiées sans retouche. Le bouton grimoire de la fiche affiche une seule icône (`book-plus` / `book-minus`). Les flèches de tournage passent en masque CSS, couleur Caput Mortuum. Le bouton œil a un nom accessible et une infobulle identiques.

## Fichiers à lire

- `src/App.tsx` lignes 227-261 — bouton œil (`profile-toggle`).
- `src/components/SpellbookToggle.tsx` — deux `span` d'icône (`iconStyle`).
- `src/components/Bookmarks.tsx` — table `BOOKMARKS`.
- `src/components/HelpView.tsx` lignes 40-95 — `MaskIcon` du guide.
- `src/components/PageTurnZone.tsx`, `src/components/PageTurnZone.css` — `<img>` actuel.
- `src/App.css` lignes 243-339 — `.profile-toggle*`, `.spellbook-toggle*`.

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `public/icons/x.svg`, `plus.svg`, `circle-arrow-left.svg`, `circle-arrow-right.svg` | remplacer | version Lucide 1.57.0 |
| `public/icons/eye.svg`, `eye-off.svg`, `book-plus.svg`, `book-minus.svg`, `book-heart.svg`, `pencil.svg`, `trash-2.svg` | créer | version Lucide 1.57.0 |
| `public/icons/favourite-book.svg`, `spellbook-eye.svg`, `spellbook-eye-off.svg`, `minus.svg`, `arrow-up-1-0.svg`, `circle-plus.svg`, `square-minus.svg` | supprimer | plus utilisées |
| `src/App.tsx` | modifier | fichiers d'icône et libellés du bouton œil |
| `src/App.css` | modifier | règles de l'icône du bouton grimoire |
| `src/components/SpellbookToggle.tsx` | modifier | une seule icône |
| `src/components/Bookmarks.tsx` | modifier | icône de l'onglet Grimoire |
| `src/components/HelpView.tsx` | modifier | icônes du guide |
| `src/components/PageTurnZone.tsx`, `.css` | modifier | masque CSS, libellés traduits |

## Étapes

1. Télécharger les 11 fichiers, depuis la racine du projet :

```bash
for n in x plus circle-arrow-left circle-arrow-right eye eye-off book-plus book-minus book-heart pencil trash-2; do curl -sfL -o public/icons/$n.svg https://unpkg.com/lucide-static@1.57.0/icons/$n.svg || echo "ECHEC $n"; done
```

   Chaque fichier doit commencer par `<!-- @license lucide-static v1.57.0 - ISC -->`. En cas d'`ECHEC`, s'arrêter et renvoyer `escalation_needed`.

2. Supprimer : `public/icons/favourite-book.svg`, `spellbook-eye.svg`, `spellbook-eye-off.svg`, `minus.svg`, `arrow-up-1-0.svg`, `circle-plus.svg`, `square-minus.svg`.

3. `src/App.tsx`, bouton `profile-toggle` :
   - remplacer `'spellbook-eye-off.svg' : 'spellbook-eye.svg'` par `'eye-off.svg' : 'eye.svg'` (masquage actif → `eye-off`) ;
   - remplacer l'attribut `title={hideOutOfProfile ? … : …}` par `title={t('Masquer les sorts hors profil', 'Hide out-of-profile spells')}` (identique à `aria-label`) ;
   - remplacer **tout le bloc de commentaire** `{/* Acces rapide : … masquage actif. */}` situé juste au-dessus de `{profiles.length > 0 && (` (4 lignes, App.tsx:229-232) par :

```tsx
            {/* Acces rapide : se bascule souvent pendant une recherche, donc
                hors des vues. Icone oeil (Lucide) : oeil ouvert = sorts hors
                profil visibles (grises), oeil barre = masques. Nom et
                infobulle fixes, l'etat passe par aria-pressed. */}
```

4. `src/components/SpellbookToggle.tsx` :
   - remplacer les deux `span` d'icône par un seul : `<span className="spellbook-toggle-icon" aria-hidden="true" style={iconStyle(inSpellbook ? 'book-minus.svg' : 'book-plus.svg')} />` ;
   - dans le commentaire JSDoc du composant, remplacer « icone grimoire + « + » ou « - » » par « icone Lucide book-plus / book-minus ».

5. `src/App.css` :
   - remplacer le sélecteur `#grimoire .spellbook-toggle-icon, #grimoire .spellbook-toggle-sign` par `#grimoire .spellbook-toggle-icon` seul ;
   - supprimer la règle `#grimoire .spellbook-toggle-sign { … }` ;
   - dans `#grimoire .spellbook-toggle-icon`, passer `width` et `height` à `22px` ;
   - remplacer **tout le bloc de commentaire** qui commence par `/* Bouton grimoire personnel (SpellbookToggle)` (3 lignes, au-dessus de `#grimoire .spellbook-toggle-wrap`) par :

```css
/* Bouton grimoire personnel (SpellbookToggle) : icone Lucide book-plus /
   book-minus, sur la meme ligne que le toggle FR / EN. Plein (Caput
   Mortuum) pour ajouter, en contour quand le sort est deja dans le grimoire. */
```

   - remplacer **tout le bloc de commentaire** qui commence par `/* Bouton « sorts hors profil »` (3 lignes, au-dessus de `#grimoire .profile-toggle {`) par :

```css
/* Bouton « sorts hors profil » : rond papier comme la recherche, icone
   Lucide eye / eye-off. Actif (masquage) : Caput Mortuum, comme un onglet
   ouvert. */
```

   - remplacer le titre de section `/* ===== Barre d'outils : case « hors profil », recherche, marque-pages =====` par `/* ===== Barre d'outils : bouton « hors profil », recherche, marque-pages =====` (le reste du bloc inchangé).

6. `src/components/Bookmarks.tsx` : `icon: 'favourite-book.svg'` → `icon: 'book-heart.svg'`. Supprimer la ligne de commentaire « Aucun style ici : position, forme et couleur viendront dans la branche CSS. » (périmée).

7. `src/components/HelpView.tsx`, liste du guide :
   - `<MaskIcon file="spellbook-eye.svg" />` → `<MaskIcon file="eye.svg" />` ;
   - `<MaskIcon file="spellbook-eye-off.svg" />` → `<MaskIcon file="eye-off.svg" />` ;
   - `<MaskIcon file="favourite-book.svg" />` → `<MaskIcon file="book-heart.svg" />` ;
   - `<MaskIcon file="plus.svg" />` → `<MaskIcon file="book-plus.svg" />` ;
   - `<MaskIcon file="minus.svg" />` → `<MaskIcon file="book-minus.svg" />` ;
   - texte de cet élément : FR « Sur une fiche, ce bouton ajoute le sort au grimoire ou l’en retire. Maintenez-le appuyé pour afficher son libellé. », EN « On a spell sheet, this button adds the spell to the spellbook or removes it. Press and hold it to show its label. ».

8. `src/components/PageTurnZone.tsx` :
   - ajouter `import type { CSSProperties } from 'react'` et `import { t } from '../utils/browserLanguage'` ;
   - libellé : `direction === 'next' ? t('Page suivante', 'Next page') : t('Page précédente', 'Previous page')` ;
   - remplacer `<img … />` par :

```tsx
      <span
        className="page-turn-zone-icon"
        aria-hidden="true"
        style={{ '--icon': `url(${import.meta.env.BASE_URL}icons/${icon})` } as CSSProperties}
      />
```

   - JSDoc : « Icone SVG (public/icons/circle-arrow-*.svg) » → « Icone Lucide circle-arrow-* en masque CSS (couleur : PageTurnZone.css) ».

9. `src/components/PageTurnZone.css` :
   - dans `.page-turn-zone`, ajouter `color: var(--caput-mortuum);` ;
   - remplacer la règle `.page-turn-zone img { … }` par :

```css
.page-turn-zone-icon {
  display: block;
  width: 100%;
  height: 100%;
  background-color: currentColor;
  mask: var(--icon) center / contain no-repeat;
}
```

10. Vérifier qu'aucune référence aux fichiers supprimés ne reste : `grep -rn "favourite-book\|spellbook-eye\|minus.svg\|arrow-up-1-0\|circle-plus\|square-minus" src` doit seulement trouver `book-minus.svg`.

11. Lancer la vérification.

## Critères d'acceptation

- [ ] AC-01 : Les 11 fichiers de l'étape 1 commencent par `<!-- @license lucide-static v1.57.0 - ISC -->`. Les 7 fichiers de l'étape 2 n'existent plus.
- [ ] AC-02 : L'étape 10 ne trouve que des références à `book-minus.svg`.
- [ ] AC-03 : Fiche d'un sort hors grimoire : bouton plein Caput Mortuum avec l'icône `book-plus` Tan. Clic : l'icône devient `book-minus` en contour Caput Mortuum.
- [ ] AC-04 : Bouton œil (après création d'une classe) : `eye` au repos, `eye-off` une fois enfoncé. `aria-label` et `title` valent tous deux « Masquer les sorts hors profil » dans les deux états.
- [ ] AC-05 : Flèches de tournage visibles en Caput Mortuum, nom accessible « Page suivante » / « Page précédente ».
- [ ] AC-06 : Onglet Grimoire : icône `book-heart`. Aide : les icônes du guide s'affichent (aucune case vide).
- [ ] AC-07 : Croix des vues : `public/icons/x.svg` est le fichier Lucide (contrôle par AC-01) et s'affiche (pas de case vide).

## Vérification

```bash
npm run lint
npm run build
```

Vérification navigateur (1440×900 puis 390×844) : AC-03 à AC-07, captures de la fiche, de la barre d'outils, de l'aide et des flèches.

## Hors périmètre

- Comportement du bouton grimoire (appui long, infobulle) : T005.
- `funnel.svg`, `user-round-cog.svg`, `book-search.svg`, `circle-help.svg` : déjà Lucide, ne pas toucher.
- Factoriser les `span --icon` en `MaskIcon` : hors lot.
- Toute modification des fichiers SVG téléchargés.

## Notes d'exécution

- Étapes 1 à 11 exécutées. Téléchargement d'abord dans le scratchpad (11 fichiers, en-tête `lucide-static v1.57.0` vérifié), copie dans `public/icons/` ensuite : aucun écrasement partiel si le réseau échoue.
- `npm run lint` : pass. `npm run build` : pass. Avertissement de taille de chunk (> 500 kB) : non introduit par ce lot, aucun import de bibliothèque ajouté.
- Étape 10 : seule référence restante dans `src/` : `book-minus.svg` (AC-02 OK). Hors `src/`, références aux anciens noms dans `docs/DESIGN-BRIEF.md`, `docs/SPRINT-4-*.md` : non modifiées (docs hors périmètre).
- Vérification navigateur (AC-03 à AC-07, 1440×900 et 390×844, captures) : NON exécutée, aucun outil navigateur côté agent. À faire par le verifier.
- Reste à nettoyer (hors étapes) : `gap: 2px` dans `#grimoire .spellbook-toggle` (App.css) n'a plus d'effet, un seul enfant.
