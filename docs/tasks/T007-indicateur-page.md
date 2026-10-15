# T007 — Afficher la page courante à côté du compteur

Statut : fait
Story : US-04 · Exigences : D-03, [APP-FLOW.md parcours US-04](../APP-FLOW.md#parcours-us-04--savoir-où-lon-est-dans-la-liste)
Dépend de : T006
Parallélisable : non
Exécutant : workflow:front

## Objectif

La ligne en haut de la page de la liste affiche `319 / 319 sorts · page 2 / 23`. Un lecteur d'écran entend « Page 2 sur 23 » à chaque tournage de page.

## Fichiers à lire

- `src/App.tsx` — `page` (ligne 61), `totalPages` (ligne 149), compteur (lignes 320-324).
- `src/components/BookSpread.tsx` — `isTurning`, section `spell-list-panel`.
- `src/utils/browserLanguage.ts` — fonction `t(fr, en)`.

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/App.tsx` | modifier | texte du compteur |
| `src/components/BookSpread.tsx` | modifier | zone d'annonce invisible |
| `src/index.css` | modifier | classe `.visually-hidden` |

## Étapes

1. `src/App.tsx`, remplacer le paragraphe du compteur :

```tsx
                      <p>
                        {sortedSpells.length} / {spells.length} {t('sorts', 'spells')}
                        {' · '}
                        {t('page', 'page')} {page + 1} / {totalPages}
                      </p>
```

2. `src/components/BookSpread.tsx` : importer `t` depuis `'../utils/browserLanguage'`. Dans la section `book-page spell-list-panel`, juste avant `{!isTurning && right}`, ajouter :

```tsx
            {/* Annonce du numero de page aux lecteurs d'ecran. Toujours
                montee (hors de la porte isTurning) : une zone aria-live
                recreee avec son contenu n'est en general pas annoncee. */}
            <p className="visually-hidden" aria-live="polite">
              {t(`Page ${page + 1} sur ${totalPages}`, `Page ${page + 1} of ${totalPages}`)}
            </p>
```

3. `src/index.css`, à la fin du fichier, ajouter :

```css
/* Texte reserve aux lecteurs d'ecran : present dans l'arbre
   d'accessibilite, invisible a l'ecran. */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
```

4. Lancer la vérification.

## Critères d'acceptation

- [ ] AC-01 : Desktop 1440×900, au chargement : la ligne affiche `319 / 319 sorts · page 1 / 23`.
- [ ] AC-02 : Clic sur la flèche « Page suivante » : après l'animation, `page 2 / 23`. La zone `aria-live` contient « Page 2 sur 23 ».
- [ ] AC-03 : Recherche « boule » : retour à `page 1 / N` avec N recalculé.
- [ ] AC-04 : Recherche sans résultat (« zzzz ») : `0 / 319 sorts · page 1 / 1`.
- [ ] AC-05 : Mobile 390×844 : la ligne tient sur une seule ligne (hauteur d'une ligne de texte), `page 1 / 20` au chargement.
- [ ] AC-06 : Pendant l'animation de tournage, la ligne visible disparaît avec la liste (comportement existant), la zone `aria-live` reste dans le DOM.

## Vérification

```bash
npm run lint
npm run build
```

Vérification navigateur : AC-01 à AC-06.

## Hors périmètre

- Position de la ligne, style du compteur.
- Retour en page 1 après filtre (règle existante, inchangée).
- Barre d'outils.

## Notes d'exécution

- Étapes 1 à 3 appliquées sur les 3 fichiers cibles. Aucun autre fichier modifié.
- `npm run lint` : pass. `npm run build` (tsc -b + vite build) : pass. Avertissement de taille de chunk (> 500 kB) pré-existant, lié à three.js, hors périmètre.
- Écart mineur : le compteur était aux lignes 319-321 (et non 320-324) au moment de l'exécution. Contenu identique à l'étape 1.
- Vérification navigateur AC-01 à AC-06 non effectuée : `npm run dev` réservé au vérificateur. Points à contrôler : AC-05 (la ligne ne doit pas passer à la ligne à 390px) et la zone `aria-live` présente après le tournage.
