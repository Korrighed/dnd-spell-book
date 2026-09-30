# Sprint 3 — Rendu 3D responsive (mobile)

État au 2026-09-30. Plan de suivi pour rendre le livre 3D utilisable en mobile, sur la branche `3d-integration`. Mécanique mobile codée et vérifiée (Playwright), réglages visuels desktop et mobile faits à l'œil par l'utilisateur (étapes 5-6). Reste la vérification finale et la revue de code (étapes 12-13). À supprimer une fois la branche fusionnée dans `dev`.

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

- [x] 1. **État de la page visible** : `mobilePage: 'left' | 'right'` (défaut `'right'`), porté par `BookSpread` ou remonté dans `App` (nécessaire pour la bascule à la première sélection).
- [x] 2. **Détection mobile** : garder le seuil existant `899px`. Côté CSS : `@media`. Côté JS, si besoin : `matchMedia('(max-width: 899px)')`.
- [x] 3. **Structure DOM** : envelopper canvas + pages dans une bande (`.book-spread-strip`). Desktop : la bande est neutre (100 %, pas de transform). Mobile : bande large + `translateX` selon `mobilePage`.
- [x] 4. **Supprimer l'embryon scroll-snap** mobile de `BookSpread.css` (remplacé par la bande).
- [x] 5. **Positions des pages en mobile** : réglées à l'œil par l'utilisateur, directement dans `src/components/BookSpread.mobile.css` (extrait de `BookSpread.css`, voir étape 16). Toutes les valeurs sont en `vh` (voir étape 15) : `--book-frame-top`, `--book-frame-height`, `--spell-detail-*`, `--spell-list-*` (top, height/width, max-height). Le cadrage du livre 3D en mobile est géré séparément via les contrôles Leva `Livre (mobile)` (voir étape 17), plus besoin d'étirement CSS bricolé.
- [x] 6. **Réglage du peek** : `--mobile-peek: 10` et `--mobile-slide-duration: 700ms`, dans `BookSpread.mobile.css`. Largeur de bande dérivée (200 - 2 × peek). Valeurs conservées telles quelles, jugées satisfaisantes.
- [x] 7. **Hook de swipe** (`useHorizontalSwipe` ou équivalent) : pointer events, seuil de distance horizontale, ignore les gestes majoritairement verticaux (le scroll vertical de la liste/fiche doit rester libre). Swipe vers la gauche → page droite, vers la droite → page gauche.
- [x] 8. **Animation** : `transition` CSS sur `transform`, durée lente. Respecter `prefers-reduced-motion` (transition courte ou nulle).
- [x] 9. **Bascule à la première sélection** : dans `App`, au premier `setSelectedIndex` non nul de la session, passer `mobilePage` à `'left'`. Flag en mémoire, jamais persisté.
- [x] 10. **Interaction sur le peek** : un tap sur la portion visible de l'autre page bascule aussi vers elle (évite qu'un tap tombe sur un élément à moitié visible).
- [x] 11. **Page hors écran inerte** : attribut `inert` sur la page non visible en mobile. Les lecteurs d'écran (VoiceOver, TalkBack) ne la lisent plus et le focus ne peut plus l'atteindre. Pas de boutons ni de clavier : inutiles en mobile, et le tap sur le peek (étape 10) sert déjà d'alternative au swipe.
- [x] 11b. **Liste réduite en mobile** : seulement niveau et nom (`SpellList.mobile.css`, `@media (max-width: 899px)`). Toute la zone `.extra` (dégâts, JS, portée, forme) masquée — la portée aussi, retirée après coup pour gagner de la place. Le reste (dégâts/JS/portée/forme) reste dans la fiche.
- [x] 11c. **Pagination réduite en mobile** : `SPELLS_PER_PAGE_MOBILE` dans `App.tsx` (8 au départ, ajusté à 15 par l'utilisateur ensuite), contre `SPELLS_PER_PAGE_DESKTOP` (15 au départ, ramené à 12). Dérivé de `useMediaQuery(MOBILE_QUERY)`. Page courante clampée si elle devient hors bornes au resize (changement de gabarit d'écran).
- [ ] 12. **Vérification** : test réel sur mobile (ou émulation DevTools), portrait. Vérifier le swipe, le peek, la bascule unique, le scroll vertical dans les pages, le desktop inchangé.
- [ ] 13. **Revue de code** puis corrections, comme au sprint 2.
- [ ] 14. **Performance (en tout dernier, seulement si ralentissements constatés)** : le canvas rend plus de pixels que l'écran (bande large). Piste : plafonner le `dpr` du `Canvas` en mobile.
- [x] 15. **Desktop non responsive à la taille physique de l'écran** : constaté le 2026-09-30, écran 21" à 100 % correct, sur écran 15" au même zoom navigateur (100 %) le rendu était trop grand — il fallait dézoomer à 90 % pour retrouver un résultat correct. Cause : offsets/plafonds fixes en `px` (`--book-frame-top`, `--spell-detail/-list-top`, `max-width`/`max-height` des deux pages) à côté de `--book-frame-height` en `vh` — sous mise à l'échelle OS/DPI différente, le `vh` suit mais le `px` reste fixe, ce qui désynchronise la composition. Corrigé : tout passé en `vh` (`px` → `vh`, essai intermédiaire en `vmin` abandonné — `vmin` casse le mobile portrait, où `vmin` = largeur au lieu de hauteur, écrasant le livre). Plein écran (F11) volontairement mis hors périmètre : c'est un changement de viewport comme un autre, aucune unité ne peut à la fois s'adapter au viewport et rester invariante quand il change — cf. Points ouverts.
- [x] 16. **Séparation des fichiers CSS mobile/desktop** : `BookSpread.css`/`SpellList.css` ne contiennent plus que les règles desktop. Les blocs `@media (max-width: 899px)` sont extraits dans `BookSpread.mobile.css` et `SpellList.mobile.css` (nouveaux fichiers, importés en plus des fichiers desktop dans `BookSpread.tsx`/`SpellList.tsx`). But : éviter de confondre les deux pendant la relecture, les valeurs mobiles étant retouchées fréquemment à l'œil.
- [x] 17. **Réglages Leva du canvas 3D séparés desktop/mobile** : `BookCanvas.tsx` expose deux jeux de contrôles indépendants — `Livre (desktop)` / `Livre (desktop) - étirement du rendu` et `Livre (mobile)` / `Livre (mobile) - étirement du rendu` (rotation `x/y/z`, `margin`, `scaleX`/`scaleY`). Sélection via `useMediaQuery(MOBILE_QUERY)`. Un seul jeu de réglages ne convenait jamais aux deux formats (le cadre change radicalement de forme entre bande mobile et pleine largeur desktop) — constat : livre écrasé en haut en mobile avec l'ancien réglage partagé. Toujours le même modèle/scène/canvas, seuls les nombres diffèrent. Remplace l'ancien hack `--mobile-book-scale-y` (multiplicateur CSS du `scaleY` desktop), supprimé.

## Points ouverts

- Paysage mobile : hors périmètre de la première version, sauf avis contraire.
- Surbrillance de la direction possible : différée (voir Concept validé).
- Plein écran (F11) : mis hors périmètre volontairement (voir étape 15). Techniquement, aucune unité ne peut à la fois s'adapter au viewport (corrige le bug 21"/15") et rester invariante quand le viewport change (ce que fait le plein écran, en agrandissant surtout la hauteur). Piste si besoin un jour : `clamp(min, valeur-fluide, max)` pour plafonner en `px` au-delà d'un certain viewport, sans perdre l'adaptation en-dessous.
- Performance (étape 14) : pas de ralentissement constaté à ce stade, pas encore traité.

## Notes de reprise (2026-09-30)

- **Où régler** : `BookSpread.mobile.css` pour le cadre/les pages en mobile (bloc unique sur `.book-spread`), `BookSpread.css`/`SpellDetailPanel.css`/`SpellListPanel.css` pour le desktop. Inspecteur : sélectionner `.book-spread`, `.spell-detail-panel` ou `.spell-list-panel`, panneau Styles. Le bouton « Afficher les cadres dev » montre les contours des pages (mobile et desktop).
- **Unités** : tout en `vh`, jamais `px` ni `vmin` (voir étapes 15 et 17 pour le pourquoi). Un `vh` correspond à 1 % de la hauteur de la fenêtre — `window.innerHeight` en console pour convertir en px pendant un réglage.
- **Cadrage du livre 3D** : deux jeux de contrôles Leva indépendants, `Livre (desktop)` et `Livre (mobile)` (rotation, marge, étirement). Le panneau Leva affiche les deux en permanence en dev ; seul le jeu actif (selon la largeur d'écran) a un effet visuel.
- **Largeur utile en mobile** : la fenêtre du livre est limitée par `#root` (95vw) et le padding de `#grimoire` (24px). Non retouché cette session.
- **Chevauchement fiche/liste** : `left`/`right`/`width` des deux pages doivent sommer à 100 % (`--spell-detail-left + --spell-detail-width + --spell-list-width + --spell-list-right`). Un ajustement d'un seul côté sans recalculer l'autre reproduit le bug.
- **Desktop** : positions des pages et du canvas vérifiées identiques avant/après conversion `px` → `vh` (1400x900), avant les réglages manuels ultérieurs de l'utilisateur.
- **Vite** : une modification CSS n'a pas été prise une fois (cache du serveur de dev). Si un réglage semble ignoré, recharger la page ou toucher le fichier.
- **Playwright** : le plugin `playwright@claude-plugins-official` cherche Google Chrome (`C:\Users\bouta\AppData\Local\Google\Chrome\Application\chrome.exe`), absent. Seul Chromium est installé (`npx playwright install`, dans `%LOCALAPPDATA%\ms-playwright`). Les captures ont été faites par un script Playwright hors plugin. Pour utiliser le plugin : installer Chrome, ou lui passer `--browser chromium` (config `.mcp.json` du plugin, redémarrage de Claude Code nécessaire).

## Fichiers clés

| Fichier | Rôle attendu |
|---|---|
| `src/components/BookSpread.tsx` | Bande, état de page visible, branchement du swipe |
| `src/components/BookSpread.css` | Fenêtre, bande, `translateX`, transition — règles desktop uniquement |
| `src/components/BookSpread.mobile.css` | Mêmes règles, réglages mobile (`@media max-width: 899px`) |
| `src/components/SpellDetailPanel.css` | Position de la fiche, desktop |
| `src/components/SpellListPanel.css` | Position de la liste, desktop |
| `src/components/BookCanvas.tsx` | Canvas 3D, deux jeux de contrôles Leva (`Livre (desktop)` / `Livre (mobile)`) |
| `src/hooks/useHorizontalSwipe.ts` | Swipe horizontal et tap sur le peek |
| `src/hooks/useMediaQuery.ts` | `MOBILE_QUERY` (seuil 899px) et état mobile côté JS |
| `src/components/SpellList.css` | Liste, règles desktop uniquement |
| `src/components/SpellList.mobile.css` | Liste réduite en mobile (niveau, nom) |
| `src/App.tsx` | Bascule vers la fiche à la première sélection, pagination desktop/mobile |
