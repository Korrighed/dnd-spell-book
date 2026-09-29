# Sprint 3 — Rendu 3D responsive (mobile)

État au 2026-09-29. Plan de suivi pour rendre le livre 3D utilisable en mobile, sur la branche `3d-integration`. Rien n'est codé à cette date. À supprimer une fois la branche fusionnée dans `dev`.

## Point de départ

Ce qui existe déjà sur la branche (commits `b47374a` à `6ecd5d2`) :

- `BookCanvas` : canvas react-three-fiber, modèle `spellbook_lowpoly_v2.glb`, cadrage automatique par `Bounds` (drei). Réglages Leva en dev (rotation, marge de cadrage, étirement `scaleX`/`scaleY` du rendu).
- `BookSpread` : canvas en fond, deux pages HTML en superposition. Fiche de sort à gauche (`SpellDetailPanel.css`), recherche/filtres/liste à droite (`SpellListPanel.css`).
- Desktop (`min-width: 900px`) : les deux pages en `position: absolute`, 47 % de large chacune, plafonnées à 710px.
- Mobile (`max-width: 899px`) : embryon non satisfaisant. Les pages HTML défilent en scroll-snap horizontal, mais le canvas cadre toujours le livre entier. Les pages glissent indépendamment d'un livre minuscule.

## Concept validé

« Triche » par changement de point de vue : même modèle, même scène, aucun second modèle, aucun réagencement du livre pour le mobile.

- En mobile, une seule moitié du livre occupe le viewport à la fois.
- La page de droite (liste) est affichée par défaut.
- Un bord de l'autre page reste visible (« peek », environ 10 à 15 % de l'écran) pour inciter au swipe.
- Swipe horizontal : passage d'une moitié à l'autre par un glissement animé **lent**, pour que l'utilisateur perçoive le livre comme un tout.
- Le contenu HTML suit la moitié visible : fiche avec la page gauche, liste avec la page droite.
- Bascule automatique vers la fiche : **uniquement à la première sélection d'un sort de la session**. Les sélections suivantes ne basculent plus. « Session » = durée de vie de la page : un rechargement réarme la bascule. Donc état en mémoire React (`useRef`/`useState`), **pas** `sessionStorage` (qui survit au rechargement).
- Différé : surbrillance visuelle de la moitié vers laquelle on peut se déplacer. À voir après une première version fonctionnelle.

## Périmètre

Cette branche place uniquement les deux composants centraux, `SpellList` et `SpellDetail`, sur le livre, plus l'animation de glissement en finition.

Hors périmètre : le panneau filtres/grimoire personnel reste où il est (au-dessus du livre), sans modification. Il aura sa propre branche et son propre style.

## Approche retenue — option C : bande DOM + `transform`

Comparatif fait le 2026-09-29 :

| Option | Principe | Verdict |
|---|---|---|
| A. Caméra 3D mobile | Le swipe anime la caméra dans la scène, le HTML est recalé à la main | Écartée : le plus de réglages canvas, conflit avec `Bounds`, synchro 3D/HTML manuelle |
| B. Scroll-snap natif | Bande large scrollée horizontalement | Écartée : vitesse du snap imposée par le navigateur, trop rapide, non réglable |
| C. Bande + `transform` | Bande large déplacée par `translateX` avec `transition` CSS, geste détecté par un petit hook | **Retenue** |

Principe de l'option C :

- En mobile, `.book-spread` devient une « fenêtre » (`overflow: hidden`) de la largeur de l'écran.
- À l'intérieur, une bande plus large que l'écran (ordre de grandeur 180vw, à régler) contient **le canvas et les deux pages**, comme en desktop.
- Le canvas n'est pas modifié : il cadre toujours le livre entier, simplement dans une boîte plus large. Le livre ne bouge jamais dans sa scène : c'est la fenêtre qui glisse dessus.
- La mise en page desktop des pages (positions en %) est réutilisée dans la bande. Canvas et HTML bougent ensemble, donc restent alignés par construction.
- Deux positions de bande : `right` (défaut) et `left`. Chaque position laisse dépasser le bord de l'autre page (peek).
- Animation : `transition: transform <durée> <easing>` en CSS, durée lente (point de départ 700ms, à ajuster à l'œil).

## Étapes

- [ ] 1. **État de la page visible** : `mobilePage: 'left' | 'right'` (défaut `'right'`), porté par `BookSpread` ou remonté dans `App` (nécessaire pour la bascule à la première sélection).
- [ ] 2. **Détection mobile** : garder le seuil existant `899px`. Côté CSS : `@media`. Côté JS, si besoin : `matchMedia('(max-width: 899px)')`.
- [ ] 3. **Structure DOM** : envelopper canvas + pages dans une bande (`.book-spread-strip`). Desktop : la bande est neutre (100 %, pas de transform). Mobile : bande large + `translateX` selon `mobilePage`.
- [ ] 4. **Supprimer l'embryon scroll-snap** mobile de `BookSpread.css` (remplacé par la bande).
- [ ] 5. **Positions des pages en mobile** : réactiver le positionnement `absolute` des deux pages dans la bande. Revoir les plafonds `max-height` (647px/656px) et les `top` en px, pensés pour un écran desktop.
- [ ] 6. **Réglage du peek** : calculer les deux valeurs de `translateX` pour que la page active remplisse l'écran et que l'autre dépasse d'environ 10-15 %. Idéalement pilotées par variables CSS (`--mobile-strip-width`, `--mobile-peek`) pour régler sans toucher au JS.
- [ ] 7. **Hook de swipe** (`useHorizontalSwipe` ou équivalent) : pointer events, seuil de distance horizontale, ignore les gestes majoritairement verticaux (le scroll vertical de la liste/fiche doit rester libre). Swipe vers la gauche → page droite, vers la droite → page gauche.
- [ ] 8. **Animation** : `transition` CSS sur `transform`, durée lente. Respecter `prefers-reduced-motion` (transition courte ou nulle).
- [ ] 9. **Bascule à la première sélection** : dans `App`, au premier `setSelectedIndex` non nul de la session, passer `mobilePage` à `'left'`. Flag en mémoire, jamais persisté.
- [ ] 10. **Interaction sur le peek** : un tap sur la portion visible de l'autre page bascule aussi vers elle (évite qu'un tap tombe sur un élément à moitié visible).
- [ ] 11. **Page hors écran inerte** : attribut `inert` sur la page non visible en mobile. Les lecteurs d'écran (VoiceOver, TalkBack) ne la lisent plus et le focus ne peut plus l'atteindre. Pas de boutons ni de clavier : inutiles en mobile, et le tap sur le peek (étape 10) sert déjà d'alternative au swipe.
- [ ] 12. **Vérification** : test réel sur mobile (ou émulation DevTools), portrait. Vérifier le swipe, le peek, la bascule unique, le scroll vertical dans les pages, le desktop inchangé.
- [ ] 13. **Revue de code** puis corrections, comme au sprint 2.
- [ ] 14. **Performance (en tout dernier, seulement si ralentissements constatés)** : le canvas rend plus de pixels que l'écran (bande large). Piste : plafonner le `dpr` du `Canvas` en mobile.

## Points ouverts

- Largeur exacte de la bande et valeur du peek : à régler visuellement (étape 6).
- Durée et courbe de l'animation : 700ms `ease-in-out` en point de départ.
- Paysage mobile : hors périmètre de la première version, sauf avis contraire.
- Surbrillance de la direction possible : différée (voir Concept validé).
- Étirement Leva `scaleX: 1.25` : s'applique aussi en mobile. Vérifier qu'il reste cohérent avec la bande.

## Fichiers clés

| Fichier | Rôle attendu |
|---|---|
| `src/components/BookSpread.tsx` | Bande, état de page visible, branchement du swipe |
| `src/components/BookSpread.css` | Fenêtre, bande, `translateX`, transition, suppression du scroll-snap |
| `src/components/SpellDetailPanel.css` | Position de la fiche en mobile |
| `src/components/SpellListPanel.css` | Position de la liste en mobile |
| `src/components/BookCanvas.tsx` | Normalement inchangé. Éventuel plafond `dpr` (étape 14) |
| `src/hooks/useHorizontalSwipe.ts` | Nouveau : détection du swipe horizontal |
| `src/App.tsx` | Bascule vers la fiche à la première sélection de la session |
