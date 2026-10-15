# T003 — Unifier les champs et boutons des vues

Statut : à faire
Story : constat M1 (architecte), A2, zoom iOS, titre mobile recouvert · Exigences : [DESIGN-BRIEF.md §4](../DESIGN-BRIEF.md#4-composants)
Dépend de : T002
Parallélisable : non
Exécutant : workflow:front

## Objectif

Une seule source de style pour les champs et boutons des vues (`.bookmark-view`), dans `src/App.css`. Les règles génériques qui écrasaient les fichiers CSS des composants disparaissent. Les champs font 16 px et 44 px de haut, bordure Coffee. En mobile, la croix ne recouvre plus le titre de la vue.

## Fichiers à lire

- `src/App.css` — lignes 123-134 (`.filters`, règle `input[type='search'], select`), 417-502 (vues).
- `src/App.mobile.css` — bloc `.bookmark-view` mobile.
- `src/components/FiltersView.tsx` — le `<fieldset>` du tri (sans classe).
- `src/components/CharacterSelector.css`, `src/components/SpellcasterProfileForm.css` — règles de contrôles dupliquées.

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/App.css` | modifier | règles génériques retirées, règles partagées ajoutées |
| `src/App.mobile.css` | modifier | titre de vue non recouvert |
| `src/components/FiltersView.tsx` | modifier | classe `filters-sort` sur le fieldset |
| `src/components/CharacterSelector.css` | modifier | règles de contrôles retirées |
| `src/components/SpellcasterProfileForm.css` | modifier | règles de contrôles retirées |

## Étapes

1. `src/App.css` : supprimer entièrement la règle `#grimoire input[type='search'], #grimoire select { padding: 8px 12px; font-size: 16px; }` (lignes 130-134). La recherche a déjà ses propres `padding` et `font-size` (`#grimoire .spell-search input[type='search']`).

2. `src/App.css` : supprimer la règle `#grimoire .bookmark-view select { … }` et la règle `#grimoire .bookmark-view fieldset { … }`. À leur place, insérer :

```css
/* Champs des vues (filtres, personnage) : une seule source de style.
   16px minimum : en dessous, iOS zoome la page au focus. 44px : cible
   tactile. Bordure Coffee : >= 3:1 sur le papier (WCAG 1.4.11). */
#grimoire .bookmark-view select,
#grimoire .bookmark-view input[type='text'] {
  box-sizing: border-box;
  min-height: 44px;
  max-width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--coffee);
  border-radius: 6px;
  background: var(--paper-light);
  color: #000;
  font: inherit;
  font-size: 16px;
}

#grimoire .bookmark-view select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tri de la liste (FiltersView) : groupe de boutons radio encadre. */
#grimoire .filters-sort {
  border: 1px solid var(--coffee);
  border-radius: 6px;
}

/* Boutons texte des vues. Principal : plein Caput Mortuum (comme les
   onglets). Secondaire : contour Coffee. */
#grimoire .view-button {
  box-sizing: border-box;
  min-height: 44px;
  padding: 8px 16px;
  border: 1px solid var(--coffee);
  border-radius: 6px;
  background: none;
  color: #000;
  font: inherit;
  font-size: 16px;
  cursor: pointer;
}

#grimoire .view-button:hover:not(:disabled) {
  border-color: var(--caput-mortuum);
}

#grimoire .view-button--primary {
  border-color: var(--caput-mortuum);
  background: var(--caput-mortuum);
  color: var(--tan);
}

#grimoire .view-button--primary:hover:not(:disabled) {
  background: var(--caput-mortuum-hover);
}

/* Bouton icone seule (renommer, supprimer) : 44x44, icone Coffee en masque. */
#grimoire .icon-button {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--coffee);
  cursor: pointer;
}

#grimoire .icon-button:hover:not(:disabled) {
  background: var(--accent-bg);
}

#grimoire .icon-button .mask-icon {
  width: 24px;
  height: 24px;
}

#grimoire .view-button:disabled,
#grimoire .icon-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

3. `src/App.css` : la règle `.mask-icon` (fin de fichier) est utilisée ci-dessus. Ne pas la déplacer ni la modifier.

4. `src/components/FiltersView.tsx` : remplacer `<fieldset>` par `<fieldset className="filters-sort">`. Rien d'autre.

5. `src/components/CharacterSelector.css` : supprimer toutes les règles sauf `.character-selector { … }` (garder celle-ci telle quelle).

6. `src/components/SpellcasterProfileForm.css` : supprimer les règles `.spellcaster-profile select, .spellcaster-profile input`, `.spellcaster-profile button`, `.spellcaster-profile button:hover:not(:disabled)`, `.spellcaster-profile button:disabled`. Garder `.spellcaster-profile` et `.spellcaster-profile legend`.

7. `src/App.css`, règle `#grimoire .bookmark-view h2` : ajouter `overflow-wrap: anywhere;` (un nom de personnage long sans espace ne doit pas déborder du titre, voir T013).

   `src/App.mobile.css`, dans `@media (max-width: 899px)`, après la règle `#grimoire .bookmark-view-close { … }`, ajouter :

```css
  /* Croix a 12px du bord, 40px de large : marge de securite pour le
     titre (recouvrement observe en revue a 390px). */
  #grimoire .bookmark-view h2 {
    padding-right: 60px;
  }
```

8. Lancer la vérification.

## Critères d'acceptation

- [ ] AC-01 : `grep -n "#grimoire select\|bookmark-view fieldset" src/App.css` ne renvoie rien.
- [ ] AC-02 : Vue Filtres ouverte : les trois listes déroulantes ont une police calculée de 16px, une hauteur ≥ 44px et une bordure `rgb(111, 77, 56)`.
- [ ] AC-03 : Vue Personnage ouverte : la liste « Personnage » et les champs « Renommer » / « Nouveau personnage » ont la même hauteur (≥ 44px) et la même bordure Coffee.
- [ ] AC-04 : Vue Filtres : le groupe « Trier la liste » a une bordure Coffee de 1px.
- [ ] AC-05 : À 390×844, vue Personnage ouverte : le titre « PERSONNAGE » n'est pas recouvert par la croix (capture).
- [ ] AC-06 : La recherche de la barre d'outils garde son aspect (pilule, 16px, icône à droite).

## Vérification

```bash
npm run lint
npm run build
```

Vérification navigateur : AC-02 à AC-04 et AC-06 à 1440×900, AC-05 à 390×844, avec captures.

Note pour le vérificateur : entre T003 et T010/T011, les boutons de la vue Personnage (« Supprimer », « Ajouter », `×`, « Effacer ») n'ont plus de style propre (boutons natifs). C'est attendu : ils sont remplacés en T010 et T011. Ne pas échouer la tâche sur leur aspect.

## Hors périmètre

- Les composants `.tsx` du personnage (T009 à T012). Les classes `view-button`, `icon-button` ne sont pas encore utilisées : c'est voulu.
- `PersonalSpellbookPanel.css`.
- La géométrie du livre (`--book-*`, `--spell-list-*`).

## Notes d'exécution
