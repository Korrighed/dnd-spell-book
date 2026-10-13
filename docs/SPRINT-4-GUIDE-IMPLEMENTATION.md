# Sprint 4 — Guide d'implémentation (code préparé et consignes)

État au 2026-10-13. Complément de `SPRINT-4-RECHERCHE-MARQUE-PAGES.md` (le plan). Ce guide donne le code préparé à l'avance et les consignes à suivre pendant l'implémentation.

**Sources** : trois agents ont travaillé sur le plan, puis leurs rapports ont été réconciliés ici.

- `architect` : découpage, état, superposition, ordre des commits.
- `front` : brouillon de code.
- `qa` : cas limites et plan de test.

**Statut du code** : implémenté sur la branche `views-filtre` (6 commits de code, section 6). `tsc` et `eslint` passent à chaque commit. Tests manuels (section 7) **non exécutés** : pas de navigateur dans l'environnement d'implémentation. Écarts par rapport au code préparé : section 9.

---

## 1. Décisions à valider avant de coder

Les agents ont relevé des points sur lesquels le plan ne dit rien. Le code de la section 5 applique la recommandation de chaque ligne : si tu choisis autrement, il faut adapter le code.

| # | Question | Recommandation | Raison |
|---|---|---|---|
| D1 | Règle CSS structurelle pour poser la vue par-dessus le livre (dérogation à « aucun CSS ») | **Oui**, 3 règles minimales (section 4.4) | Sans elle, la vue s'affiche **sous** le livre, dans le flux. |
| D2 | Fond provisoire de la vue (`background: var(--bg)`) | **Oui** | Sans fond, la vue est transparente et le texte se mélange au livre. |
| D3 | Choisir un sort depuis la vue Grimoire | **Fermer la vue**, et en mobile **basculer sur la page de gauche à chaque fois** | Sinon la fiche s'ouvre derrière la vue et l'utilisateur croit que rien ne se passe (scénario QA). |
| D4 | Messages de chargement/erreur des sorts d'une classe ou d'une école quand la vue Filtres est fermée | **Les afficher sur la page de droite**, au-dessus de la liste | Ils vident la liste. Cachés dans une vue fermée, la liste devient vide sans explication (risque QA « High »). Les erreurs de chargement des **listes déroulantes** restent dans la vue Filtres. |
| D5 | Titre « Grimoire personnel (n) » | **Dans le titre de la vue**, `<h2>` retiré de `PersonalSpellbookPanel` | Évite le titre en double. |
| D6 | Grimoire en une langue : « Niv. » devient « Niv. / Lvl » selon la langue | **Oui** | Même règle que `SpellList`. |
| D7 | `hideOutOfProfile` quand le dernier profil est supprimé | **Ne rien changer** | Le filtre est déjà inactif sans profil (`isAccessible === null`). Si un profil revient, la case réapparaît cochée : l'état reste visible. |
| D8 | Indicateur de filtres actifs quand la vue est fermée | **Hors périmètre**, à prévoir dans la branche CSS | Le compteur `n / total` signale déjà une liste réduite. |
| D9 | Le grimoire personnel est-il trié ? | **Non**, il garde l'ordre d'ajout | Le plan ne trie que la liste principale. |
| D10 | Confirmation avant de supprimer un personnage | **Hors périmètre**, à noter | Aucune confirmation aujourd'hui dans `CharacterSelector` (vérifié). Ce sprint ne touche pas à ce comportement. |
| D11 | Nom de branche | Tranché : `views-filtre`, créée depuis `dev`. | Le `CLAUDE.md` du projet impose des commits directs sur `dev`, sans `feature/*`. Les branches récentes ne suivent pas cette règle. |

---

## 2. Corrections apportées au plan

- **Étape 8 du plan (tri)** : changer de tri ne remet **pas** la liste en page 1 automatiquement avec le code actuel. `filteredKey` (`App.tsx:127`) est calculé sur `filteredSpells`. Un tri change l'ordre, pas l'ensemble des index, donc la clé ne bougerait pas. Correction : `filteredKey`, `totalPages` et `pagedSpells` dérivent tous de `sortedSpells`.
- **`nameFr` n'est jamais vide** : `src/api/spells.ts:54` retombe déjà sur `name`. Pas de repli à prévoir dans le tri.
- **Aucune icône à ajouter** : `funnel.svg`, `arrow-up-1-0.svg`, `user-round-cog.svg` et `favourite-book.svg` existent dans `public/icons/`.

---

## 3. Consignes à suivre pendant l'implémentation

### Placement des vues (règles bloquantes)

1. **Ne jamais rendre une vue dans `BookSpread`**, ni dans `left`/`right`, ni dans `.book-spread`.
   - Dans `right`, la vue serait démontée pendant `isTurning` (`BookSpread.tsx`, `{!isTurning && right}`).
   - Les sections du livre deviennent `inert` en mobile quand elles ne sont pas affichées. La vue serait alors non cliquable.
   - `.book-spread` porte les gestionnaires de swipe (`useHorizontalSwipe`). Un tap dans la vue changerait la page du livre.
   - Un portail React (`createPortal`) ne corrige rien : les événements React remontent l'arbre React, pas l'arbre DOM.
2. **Les vues sont des sœurs de `BookSpread`**, dans un parent commun `.book-zone`.
3. **Le livre devient `inert` quand une vue est ouverte** : `<div inert={openView !== null}>` autour de `BookSpread`. Tab n'atteint plus le livre caché, et le swipe est bloqué. La recherche, la case « hors profil » et les marque-pages restent actifs, car ils sont hors de ce wrapper.

### Montage des vues

4. **Les 4 vues sont montées en permanence** et masquées par l'attribut HTML `hidden`. Il n'y a pas de rendu conditionnel. Trois raisons :
   - `aria-controls` doit pointer vers un id présent dans le DOM ;
   - le brouillon de renommage de `CharacterSelector` serait perdu à chaque fermeture ;
   - `useKeyedFetch` garde son cache dans un `useState` local. Démonter `SpellcasterProfileForm` relance le chargement des sous-classes à chaque ouverture.
5. **Ne jamais poser `display` sur `.bookmark-view`** dans le CSS. Une règle `display` écrase l'attribut `hidden`, et la vue ne se fermerait plus.

### Clavier et focus

6. **Escape s'écoute sur la vue** (`onKeyDown` sur la `section`), pas sur `document`. Sinon, Escape dans la recherche viderait le champ (comportement natif) **et** fermerait la vue.
7. **À l'ouverture**, le focus va sur le titre de la vue (`tabIndex={-1}`).
8. **À la fermeture**, le focus revient au marque-page qui a ouvert la vue. C'est `App.closeView` qui s'en charge, pas la vue : si l'utilisateur passe d'une vue à une autre, le focus ne doit pas revenir à l'ancien marque-page.

### Tri

9. Le tri s'applique **après** le filtrage, sur une **copie** (`[...spells].sort`). `spells` ne doit jamais être muté : `useMemo` en dépend.
10. **Une seule source pour la langue** : `BROWSER_LANGUAGE` dans `src/utils/browserLanguage.ts`. `SpellList`, `PersonalSpellbookPanel` et le tri l'importent. Supprimer la constante de module dans `SpellList`.
11. Comparateur : `Intl.Collator` dans la langue du navigateur. En cas d'égalité, départage par `index`, pour un ordre déterministe.

### Conventions du dépôt

12. Commentaires en français **sans accents**, densité proche du code existant. Exports nommés, `interface XxxProps`, libellés bilingues `Français <em>English</em>`.
13. Garder les `DevFrame` existants et leurs noms. Ajouter `state:sortMode` et `state:openView` dans `SOURCE_COLORS` (`src/dev/DevFrame.tsx`).
14. Garder `className="filters"` sur le conteneur de `FiltersView` : `App.css` cible `#grimoire .filters`.
15. Chaque commit passe `npx tsc -b --noEmit` et `npx eslint .`. Format de message du `CLAUDE.md`, sans `Co-Authored-By`.

---

## 4. Architecture

### 4.1 Arbre

```
main#grimoire
  SpellSearch                         (toujours visible)
  case « masquer hors profil »        (si profiles.length > 0)
  Bookmarks                           (4 boutons)
  div.book-zone                       (parent commun, position: relative)
    div inert={openView !== null}
      BookSpread                      (inchangé)
    FiltersView    -> BookmarkView id="bookmark-view-filters"
    SortView       -> BookmarkView id="bookmark-view-sort"
    CharacterView  -> BookmarkView id="bookmark-view-character"
    SpellbookView  -> BookmarkView id="bookmark-view-spellbook"
  DevFramesToggle
```

### 4.2 Fichiers

| Fichier | Action |
|---|---|
| `src/utils/browserLanguage.ts` | Ajout de `BROWSER_LANGUAGE` et `spellDisplayName` |
| `src/utils/bookmarks.ts` | Nouveau : type `BookmarkId`, liste et ids. Hors du `.tsx` pour éviter l'avertissement `react-refresh/only-export-components`. |
| `src/utils/spellSort.ts` | Nouveau : `SortMode`, `DEFAULT_SORT_MODE`, `sortSpells` |
| `src/components/Bookmarks.tsx` | Nouveau |
| `src/components/BookmarkView.tsx` | Nouveau : coquille commune (titre, Fermer, Escape, `hidden`) |
| `src/components/FiltersView.tsx` | Nouveau |
| `src/components/SortView.tsx` | Nouveau |
| `src/components/CharacterView.tsx` | Nouveau |
| `src/components/SpellbookView.tsx` | Nouveau |
| `src/components/PersonalSpellbookPanel.tsx` | Prop `profileForm` et `<h2>` retirés, un seul nom affiché |
| `src/components/SpellList.tsx` | Utilise `BROWSER_LANGUAGE` et `spellDisplayName` |
| `src/App.tsx` | Réécrit : recherche en haut, tri, `openView`, vues, `details.other-panels` supprimé |
| `src/App.css` | 3 règles structurelles (D1, D2) |
| `src/dev/DevFrame.tsx` | 2 couleurs ajoutées |
| `src/components/PersonalSpellbookPanel.css` | Règles mortes à supprimer : `h2`, `.name-fr`, `.name-en` (à vérifier au moment du commit) |

### 4.3 État

- `App` garde tout : `search`, filtres, `hideOutOfProfile`, `sortMode`, `openView`. Les vues sont présentationnelles : elles affichent ce qu'on leur passe, sans état métier.
- Pas de contexte, pas de nouveau hook métier : ce serait disproportionné pour ce projet.
- Ne **pas** appeler `usePersonalSpellbook` dans une vue : on créerait un second état, désynchronisé.
- Coût accepté : `CharacterView` reçoit une douzaine de props explicites.

### 4.4 CSS structurel (D1, D2)

À ajouter dans `src/App.css`. Ce n'est pas du style : c'est le minimum pour que la vue se superpose au livre. La branche CSS reprendra ces règles.

```css
/* Parent commun du livre et des vues de marque-page : sert d'ancre a
   .bookmark-view (position: absolute). */
#grimoire .book-zone {
  position: relative;
}

/* Vue par-dessus le livre. Jamais de `display` ici : il ecraserait
   l'attribut `hidden` qui ferme la vue. Fond provisoire (D2) en attendant la
   branche CSS. */
#grimoire .bookmark-view {
  position: absolute;
  inset: 0;
  z-index: 10;
  overflow-y: auto;
  background: var(--bg);
}
```

En mobile, `.book-zone` a la largeur de l'écran, pas celle de la bande qui glisse. La vue reste donc fixe quand `mobilePage` change.

---

## 5. Code préparé

### 5.1 `src/utils/browserLanguage.ts` (ajout en fin de fichier)

```ts
/**
 * Langue du navigateur, lue une seule fois : elle ne change pas pendant la
 * vie de l'application. Source unique pour l'affichage (SpellList,
 * PersonalSpellbookPanel) et le tri (spellSort), pour qu'ils restent d'accord.
 */
export const BROWSER_LANGUAGE: BrowserLanguage = detectBrowserLanguage()

/** Nom d'un sort dans la langue du navigateur (nameFr retombe deja sur name, voir api/spells.ts). */
export function spellDisplayName(spell: { name: string; nameFr: string }): string {
  return BROWSER_LANGUAGE === 'fr' ? spell.nameFr : spell.name
}
```

### 5.2 `src/utils/bookmarks.ts`

```ts
/** Les quatre vues ouvrables par un marque-page. */
export type BookmarkId = 'filters' | 'sort' | 'character' | 'spellbook'

export const BOOKMARK_IDS: readonly BookmarkId[] = ['filters', 'sort', 'character', 'spellbook']

/** Id du bouton marque-page : sert a lui rendre le focus a la fermeture de la vue. */
export function bookmarkButtonId(id: BookmarkId): string {
  return `bookmark-${id}`
}

/** Id de la vue : cible de aria-controls sur le marque-page. */
export function bookmarkViewId(id: BookmarkId): string {
  return `bookmark-view-${id}`
}
```

### 5.3 `src/utils/spellSort.ts`

```ts
import type { SpellListItem } from '../api/spells'
import { BROWSER_LANGUAGE, spellDisplayName } from './browserLanguage'

export type SortMode = 'alpha' | 'level'

export const DEFAULT_SORT_MODE: SortMode = 'alpha'

type SortableSpell = Pick<SpellListItem, 'index' | 'name' | 'nameFr' | 'level'>

// Collator cree une fois : comparaison dans la langue du navigateur (accents :
// "Eau" avant "Eclair" en francais).
const collator = new Intl.Collator(BROWSER_LANGUAGE)

/** Nom affiche, puis index en dernier recours : ordre toujours deterministe. */
function compareByName(a: SortableSpell, b: SortableSpell): number {
  return (
    collator.compare(spellDisplayName(a), spellDisplayName(b)) ||
    (a.index < b.index ? -1 : a.index > b.index ? 1 : 0)
  )
}

/**
 * Renvoie une COPIE triee, le tableau d'entree n'est jamais modifie.
 * Niveau : tours de magie (0) en tete, a niveau egal ordre alphabetique.
 */
export function sortSpells<T extends SortableSpell>(spells: readonly T[], mode: SortMode): T[] {
  const compare =
    mode === 'level' ? (a: T, b: T) => a.level - b.level || compareByName(a, b) : compareByName
  return [...spells].sort(compare)
}
```

### 5.4 `src/components/Bookmarks.tsx`

```tsx
import {
  BOOKMARK_IDS,
  bookmarkButtonId,
  bookmarkViewId,
  type BookmarkId,
} from '../utils/bookmarks'

interface BookmarksProps {
  /** Vue actuellement ouverte, `null` si aucune. */
  openView: BookmarkId | null
  /** Clic sur un marque-page : l'appelant ouvre la vue, ou la ferme si elle est deja ouverte. */
  onToggle: (id: BookmarkId) => void
}

const BOOKMARKS: Record<BookmarkId, { icon: string; label: string }> = {
  filters: { icon: 'funnel.svg', label: 'Filtres (Filters)' },
  sort: { icon: 'arrow-up-1-0.svg', label: 'Tri (Sort)' },
  character: { icon: 'user-round-cog.svg', label: 'Personnage (Character)' },
  spellbook: { icon: 'favourite-book.svg', label: 'Grimoire personnel (Personal spellbook)' },
}

/**
 * Rangee de quatre marque-pages, identiques sur desktop et mobile.
 * aria-expanded : la vue liee est ouverte. aria-controls : id de cette vue
 * (toujours presente dans le DOM, masquee par `hidden`).
 * Aucun style ici : position, forme et couleur viendront dans la branche CSS.
 */
export function Bookmarks({ openView, onToggle }: BookmarksProps) {
  return (
    <div className="bookmarks">
      {BOOKMARK_IDS.map((id) => {
        const { icon, label } = BOOKMARKS[id]

        return (
          <button
            key={id}
            id={bookmarkButtonId(id)}
            type="button"
            className="bookmark"
            aria-label={label}
            title={label}
            aria-expanded={openView === id}
            aria-controls={bookmarkViewId(id)}
            onClick={() => onToggle(id)}
          >
            <img src={`${import.meta.env.BASE_URL}icons/${icon}`} alt="" draggable={false} />
          </button>
        )
      })}
    </div>
  )
}
```

### 5.5 `src/components/BookmarkView.tsx`

```tsx
import { useEffect, useRef, type ReactNode } from 'react'
import { bookmarkViewId, type BookmarkId } from '../utils/bookmarks'

interface BookmarkViewProps {
  id: BookmarkId
  /** Vue visible. Fermee : masquee par `hidden`, mais toujours montee. */
  open: boolean
  /** Contenu du titre (h2), bilingue comme le reste de l'interface. */
  title: ReactNode
  /** Bouton Fermer et touche Escape. Le retour du focus au marque-page est fait par l'appelant. */
  onClose: () => void
  children: ReactNode
}

/**
 * Coquille d'une vue ouverte par un marque-page, affichee par-dessus le livre
 * (App.css : .book-zone / .bookmark-view). Toujours montee : garde l'etat des
 * formulaires (renommage en cours, cache des sous-classes) entre deux
 * ouvertures, et la cible de aria-controls existe toujours.
 * Escape ecoute sur la vue et pas sur document : Escape dans la recherche
 * doit seulement vider le champ, pas fermer la vue.
 */
export function BookmarkView({ id, open, title, onClose, children }: BookmarkViewProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const titleId = `${bookmarkViewId(id)}-title`

  // A l'ouverture, le focus entre dans la vue (sur le titre).
  useEffect(() => {
    if (open) titleRef.current?.focus()
  }, [open])

  return (
    <section
      id={bookmarkViewId(id)}
      className="bookmark-view"
      role="dialog"
      aria-labelledby={titleId}
      hidden={!open}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation()
          onClose()
        }
      }}
    >
      <h2 id={titleId} ref={titleRef} tabIndex={-1}>
        {title}
      </h2>
      <button type="button" className="bookmark-view-close" onClick={onClose}>
        Fermer <em>Close</em>
      </button>
      {children}
    </section>
  )
}
```

### 5.6 `src/components/FiltersView.tsx`

Seules les erreurs de chargement des **listes déroulantes** restent ici. Les messages des sorts d'une classe ou d'une école passent sur la page de droite (D4).

```tsx
import type { ClassListItem } from '../api/classes'
import type { SchoolListItem } from '../api/schools'
import { DevFrame } from '../dev/DevFrame'
import { BookmarkView } from './BookmarkView'
import { SpellLevelFilter } from './SpellLevelFilter'
import { SpellClassFilter } from './SpellClassFilter'
import { SpellSchoolFilter } from './SpellSchoolFilter'

interface FiltersViewProps {
  open: boolean
  onClose: () => void
  levelFilter: number | null
  onLevelChange: (value: number | null) => void
  classes: ClassListItem[]
  classFilter: string | null
  onClassChange: (value: string | null) => void
  schools: SchoolListItem[]
  schoolFilter: string | null
  onSchoolChange: (value: string | null) => void
  /** Echecs de chargement des listes deroulantes classes / ecoles. */
  classListError: string | null
  schoolListError: string | null
}

/** Niveau, classe, ecole de magie. */
export function FiltersView({
  open,
  onClose,
  levelFilter,
  onLevelChange,
  classes,
  classFilter,
  onClassChange,
  schools,
  schoolFilter,
  onSchoolChange,
  classListError,
  schoolListError,
}: FiltersViewProps) {
  return (
    <BookmarkView
      id="filters"
      open={open}
      title={
        <>
          Filtres <em>Filters</em>
        </>
      }
      onClose={onClose}
    >
      {/* className conserve : App.css cible #grimoire .filters. */}
      <div className="filters">
        <DevFrame name="SpellLevelFilter" uses={['state:filtres']}>
          <SpellLevelFilter value={levelFilter} onChange={onLevelChange} />
        </DevFrame>
        <DevFrame name="SpellClassFilter" uses={['state:filtres', 'useClassList']}>
          <SpellClassFilter classes={classes} value={classFilter} onChange={onClassChange} />
        </DevFrame>
        <DevFrame name="SpellSchoolFilter" uses={['state:filtres', 'useSchoolList']}>
          <SpellSchoolFilter schools={schools} value={schoolFilter} onChange={onSchoolChange} />
        </DevFrame>
      </div>

      {classListError && <p role="alert">{classListError}</p>}
      {schoolListError && <p role="alert">{schoolListError}</p>}
    </BookmarkView>
  )
}
```

### 5.7 `src/components/SortView.tsx`

```tsx
import { DevFrame } from '../dev/DevFrame'
import type { SortMode } from '../utils/spellSort'
import { BookmarkView } from './BookmarkView'

interface SortViewProps {
  open: boolean
  onClose: () => void
  value: SortMode
  onChange: (value: SortMode) => void
}

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: 'alpha', label: 'Ordre alphabetique (Alphabetical)' },
  { mode: 'level', label: 'Par niveau (By level)' },
]

/** Un seul tri actif a la fois. Un tri ne retire aucun sort (contrairement au filtre niveau). */
export function SortView({ open, onClose, value, onChange }: SortViewProps) {
  return (
    <BookmarkView
      id="sort"
      open={open}
      title={
        <>
          Tri <em>Sort</em>
        </>
      }
      onClose={onClose}
    >
      <DevFrame name="SortView (radios)" uses={['state:sortMode']}>
        <fieldset>
          <legend>
            Trier la liste <em>Sort the list</em>
          </legend>
          {SORT_OPTIONS.map((option) => (
            <label key={option.mode}>
              <input
                type="radio"
                name="sort-mode"
                value={option.mode}
                checked={value === option.mode}
                onChange={() => onChange(option.mode)}
              />{' '}
              {option.label}
            </label>
          ))}
        </fieldset>
      </DevFrame>
    </BookmarkView>
  )
}
```

Écart appliqué à l'implémentation : libellés en JSX avec `<em>` (convention bilingue du dépôt), voir section 9.

### 5.8 `src/components/CharacterView.tsx`

```tsx
import type { ClassListItem } from '../api/classes'
import { DevFrame } from '../dev/DevFrame'
import type { ProfileSpellcastingInfo } from '../hooks/useMultiSpellAccess'
import type { SpellcasterProfile } from '../hooks/usePersonalSpellbook'
import { BookmarkView } from './BookmarkView'
import { CharacterSelector } from './CharacterSelector'
import { SpellcasterProfileForm } from './SpellcasterProfileForm'

interface CharacterViewProps {
  open: boolean
  onClose: () => void
  /** Forme renvoyee par usePersonalSpellbook (id + nom seulement), pas `Character`. */
  characters: { id: string; name: string }[]
  activeCharacterId: string
  onSelectCharacter: (id: string) => void
  onAddCharacter: (name: string) => void
  onRemoveCharacter: (id: string) => void
  onRenameCharacter: (id: string, name: string) => void
  /** Classes lanceuses de sorts, et echec de leur chargement. */
  spellcastingClasses: ClassListItem[]
  spellcastingClassesError: string | null
  profiles: SpellcasterProfile[]
  /** Une entree par profil, meme ordre que `profiles`. */
  perProfile: ProfileSpellcastingInfo[]
  onSetProfile: (id: string, profile: SpellcasterProfile) => void
  onAddProfile: (profile: SpellcasterProfile) => void
  onRemoveProfile: (id: string) => void
}

/** Choix du personnage actif + un formulaire par classe + « ajouter une classe ». */
export function CharacterView({
  open,
  onClose,
  characters,
  activeCharacterId,
  onSelectCharacter,
  onAddCharacter,
  onRemoveCharacter,
  onRenameCharacter,
  spellcastingClasses,
  spellcastingClassesError,
  profiles,
  perProfile,
  onSetProfile,
  onAddProfile,
  onRemoveProfile,
}: CharacterViewProps) {
  return (
    <BookmarkView
      id="character"
      open={open}
      title={
        <>
          Personnage <em>Character</em>
        </>
      }
      onClose={onClose}
    >
      <DevFrame name="CharacterSelector" uses={['usePersonalSpellbook']}>
        <CharacterSelector
          characters={characters}
          activeCharacterId={activeCharacterId}
          onSelect={onSelectCharacter}
          onAdd={onAddCharacter}
          onRemove={onRemoveCharacter}
          onRename={onRenameCharacter}
        />
      </DevFrame>
      {spellcastingClassesError && <p role="alert">{spellcastingClassesError}</p>}
      {profiles.map((profile, index) => (
        <DevFrame
          key={profile.id}
          name={`SpellcasterProfileForm (classe ${index + 1})`}
          uses={['usePersonalSpellbook', 'useSpellcastingClasses', 'useMultiSpellAccess']}
        >
          <SpellcasterProfileForm
            classes={spellcastingClasses}
            profile={profile}
            maxSpellLevel={perProfile[index].maxSpellLevel}
            subclassSpellGrants={perProfile[index].subclassSpellGrants}
            loading={perProfile[index].loading}
            error={perProfile[index].error}
            onChange={(next) => (next ? onSetProfile(profile.id, next) : onRemoveProfile(profile.id))}
          />
        </DevFrame>
      ))}
      <DevFrame
        name="SpellcasterProfileForm (ajouter une classe)"
        uses={['usePersonalSpellbook', 'useSpellcastingClasses']}
      >
        <SpellcasterProfileForm
          classes={spellcastingClasses}
          profile={null}
          maxSpellLevel={null}
          subclassSpellGrants={null}
          loading={false}
          error={null}
          onChange={(next) => {
            if (next) onAddProfile(next)
          }}
        />
      </DevFrame>
    </BookmarkView>
  )
}
```

Vérifié dans `usePersonalSpellbook.ts:436-455` et `CharacterSelector.tsx:9-16` : signatures des callbacks conformes. Le hook renvoie `characters` sous la forme `{ id, name }[]`. Le brouillon de l'agent `front` typait `Character[]`, ce qui ne compilait pas : corrigé ici.

### 5.9 `src/components/SpellbookView.tsx`

```tsx
import type { SpellListItem } from '../api/spells'
import { DevFrame } from '../dev/DevFrame'
import type { PersonalSpell } from '../hooks/usePersonalSpellbook'
import type { SpellAccessCheck } from '../utils/spellAccess'
import { BookmarkView } from './BookmarkView'
import { PersonalSpellbookPanel } from './PersonalSpellbookPanel'

interface SpellbookViewProps {
  open: boolean
  onClose: () => void
  spells: PersonalSpell[]
  allSpells: SpellListItem[]
  selectedIndex: string | null
  onSelectSpell: (index: string) => void
  onRemoveSpell: (index: string) => void
  /** `null` : aucun profil, rien n'est grise. */
  isAccessible: SpellAccessCheck | null
}

/** Liste du grimoire du personnage actif. Le compteur est dans le titre de la vue. */
export function SpellbookView({
  open,
  onClose,
  spells,
  allSpells,
  selectedIndex,
  onSelectSpell,
  onRemoveSpell,
  isAccessible,
}: SpellbookViewProps) {
  return (
    <BookmarkView
      id="spellbook"
      open={open}
      title={
        <>
          Grimoire personnel <em>Personal spellbook</em> ({spells.length})
        </>
      }
      onClose={onClose}
    >
      <DevFrame
        name="PersonalSpellbookPanel"
        uses={['usePersonalSpellbook', 'useSpellList', 'useMultiSpellAccess', 'state:selectedIndex']}
      >
        <PersonalSpellbookPanel
          spells={spells}
          allSpells={allSpells}
          selectedIndex={selectedIndex}
          onSelectSpell={onSelectSpell}
          onRemoveSpell={onRemoveSpell}
          isAccessible={isAccessible}
        />
      </DevFrame>
    </BookmarkView>
  )
}
```

### 5.10 `src/components/PersonalSpellbookPanel.tsx` (version complète)

Changements : prop `profileForm` et import `ReactNode` retirés ; `<h2>` retiré (D5) ; un seul nom selon la langue ; « Niv. / Lvl » selon la langue (D6) ; `aria-label` « Retirer » avec le nom affiché.

```tsx
import type { PersonalSpell } from '../hooks/usePersonalSpellbook'
import type { SpellListItem } from '../api/spells'
import type { SpellAccessCheck } from '../utils/spellAccess'
import { BROWSER_LANGUAGE, spellDisplayName } from '../utils/browserLanguage'
import { OutOfProfileLabel } from './OutOfProfileLabel'
import './PersonalSpellbookPanel.css'

interface PersonalSpellbookPanelProps {
  spells: PersonalSpell[]
  allSpells: SpellListItem[]
  selectedIndex: string | null
  onSelectSpell: (index: string) => void
  onRemoveSpell: (index: string) => void
  /** `null` : aucun profil, rien n'est grise. */
  isAccessible: SpellAccessCheck | null
}

export function PersonalSpellbookPanel({
  spells,
  allSpells,
  selectedIndex,
  onSelectSpell,
  onRemoveSpell,
  isAccessible,
}: PersonalSpellbookPanelProps) {
  const spellByIndex = new Map(allSpells.map((spell) => [spell.index, spell]))

  return (
    <section className="personal-spellbook">
      {/* La liste complete arrive de facon asynchrone : tant qu'elle est vide,
          aucun nom ne peut etre resolu, donc on n'affiche pas les sorts. */}
      {spells.length > 0 && allSpells.length > 0 && (
        <ul>
          {spells.map((personal) => {
            const spell = spellByIndex.get(personal.index)
            const isSelected = personal.index === selectedIndex
            // Un sort sauvegarde n'est jamais retire du grimoire : il est seulement grise.
            const outOfProfile =
              isAccessible !== null && spell !== undefined && !isAccessible(spell.index, spell.level)
            const className = [isSelected && 'selected', outOfProfile && 'out-of-profile']
              .filter(Boolean)
              .join(' ')
            // Une seule langue, comme SpellList.
            const name = spell ? spellDisplayName(spell) : personal.index

            return (
              <li key={personal.index} className={className || undefined}>
                <button
                  type="button"
                  className="open"
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={() => onSelectSpell(personal.index)}
                >
                  {spell && (
                    <span className="level">
                      {BROWSER_LANGUAGE === 'fr' ? 'Niv.' : 'Lvl'} {spell.level}
                    </span>
                  )}
                  <span className="name">{name}</span>
                  {outOfProfile && <OutOfProfileLabel />}
                </button>
                <button
                  type="button"
                  className="remove"
                  aria-label={`Retirer ${name} du grimoire personnel`}
                  onClick={() => onRemoveSpell(personal.index)}
                >
                  &times;
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
```

### 5.11 `src/components/SpellList.tsx` (diff)

```diff
-import { detectBrowserLanguage } from '../utils/browserLanguage'
+import { BROWSER_LANGUAGE as LANGUAGE, spellDisplayName } from '../utils/browserLanguage'
@@
-// Une seule langue par ligne, deduite du navigateur : contrairement a
-// SpellDetail, la liste n'a pas de toggle FR/EN explicite, donc pas de FR+EN
-// mixe possible ici. Constante au niveau module : la langue du navigateur ne
-// change pas pendant la vie de l'application.
-const LANGUAGE = detectBrowserLanguage()
+// Une seule langue par ligne, deduite du navigateur (BROWSER_LANGUAGE, partagee
+// avec le tri) : contrairement a SpellDetail, la liste n'a pas de toggle
+// FR/EN explicite, donc pas de FR+EN mixe possible ici.
@@
-        const name = LANGUAGE === 'fr' ? spell.nameFr : spell.name
+        const name = spellDisplayName(spell)
```

### 5.12 `src/App.tsx` (parties modifiées)

Le début du composant ne change pas jusqu'aux hooks `useSchoolSpellIndices` inclus. Les imports de `SpellLevelFilter`, `SpellClassFilter`, `SpellSchoolFilter`, `PersonalSpellbookPanel`, `SpellcasterProfileForm` et `CharacterSelector` sortent d'`App.tsx`.

Imports à ajouter :

```tsx
import { useCallback, useMemo, useRef, useState } from 'react'
import { Bookmarks } from './components/Bookmarks'
import { FiltersView } from './components/FiltersView'
import { SortView } from './components/SortView'
import { CharacterView } from './components/CharacterView'
import { SpellbookView } from './components/SpellbookView'
import { bookmarkButtonId, type BookmarkId } from './utils/bookmarks'
import { DEFAULT_SORT_MODE, sortSpells, type SortMode } from './utils/spellSort'
```

État à ajouter, à côté de `hideOutOfProfile` :

```tsx
  const [sortMode, setSortMode] = useState<SortMode>(DEFAULT_SORT_MODE)
  // Vue ouverte par un marque-page, une seule a la fois, `null` : aucune.
  const [openView, setOpenView] = useState<BookmarkId | null>(null)
```

Ouverture, fermeture et sélection depuis le grimoire (après les hooks) :

```tsx
  // Fermeture d'une vue : le focus revient au marque-page qui l'a ouverte.
  // Fait ici et pas dans la vue : passer d'une vue a une autre ne doit pas
  // rendre le focus a l'ancien marque-page.
  const closeView = useCallback(() => {
    if (openView === null) return
    setOpenView(null)
    document.getElementById(bookmarkButtonId(openView))?.focus()
  }, [openView])

  // Clic sur le marque-page actif : referme la vue.
  const handleToggleView = (id: BookmarkId) => {
    if (id === openView) closeView()
    else setOpenView(id)
  }

  // Choix d'un sort depuis le grimoire (D3) : la fiche serait cachee sous la
  // vue, donc on la ferme. En mobile, bascule sur la fiche a chaque fois (pas
  // seulement a la premiere selection) : l'utilisateur vient de demander ce sort.
  const handleSelectFromSpellbook = (index: string) => {
    handleSelectSpell(index)
    closeView()
    if (window.matchMedia(MOBILE_QUERY).matches) setMobilePage('left')
  }
```

Tri et remise en page 1, à la place du bloc `filteredKey` actuel (`App.tsx:120-146`) :

```tsx
  // Tri applique APRES le filtrage, sur une copie : un tri ne retire aucun sort.
  const sortedSpells = useMemo(() => sortSpells(filteredSpells, sortMode), [filteredSpells, sortMode])

  // Remise a la premiere page a chaque changement du CONTENU ou de l'ORDRE de
  // la liste (recherche, filtres, profil, tri) : une page 5 peut ne plus
  // exister apres coup. Cle calculee sur la liste TRIEE : un tri change
  // l'ordre des index sans changer leur ensemble. Comparaison sur les index,
  // pas sur la reference du tableau : filteredSpells est recalcule des
  // qu'isAccessible change, meme quand la liste affichee est identique.
  // Comparaison pendant le rendu plutot que dans un effet (regle
  // react-hooks/set-state-in-effect).
  const filteredKey = useMemo(
    () => sortedSpells.map((spell) => spell.index).join(','),
    [sortedSpells],
  )
  const [prevFilteredKey, setPrevFilteredKey] = useState(filteredKey)
  if (filteredKey !== prevFilteredKey) {
    setPrevFilteredKey(filteredKey)
    setPage(0)
  }

  const totalPages = Math.max(1, Math.ceil(sortedSpells.length / spellsPerPage))
  // Le changement de gabarit d'ecran (spellsPerPage) peut rendre la page
  // courante hors bornes (ex. page 4 avec 15/page, resize vers 8/page).
  if (page >= totalPages) {
    setPage(totalPages - 1)
  }
  const pagedSpells = sortedSpells.slice(page * spellsPerPage, (page + 1) * spellsPerPage)
```

Rendu, à la place de tout le `return` actuel :

```tsx
  return (
    <main id="grimoire">
      {/* Recherche permanente, au-dessus du livre, sur tous les formats. */}
      <DevFrame name="SpellSearch" uses={['state:search']}>
        <SpellSearch value={search} onChange={setSearch} />
      </DevFrame>

      {/* Acces rapide : se bascule souvent pendant une recherche, donc hors des vues. */}
      {profiles.length > 0 && (
        <DevFrame name="HideOutOfProfile (App)" uses={['state:hideOutOfProfile', 'usePersonalSpellbook']}>
          <label>
            <input
              type="checkbox"
              checked={hideOutOfProfile}
              onChange={(event) => setHideOutOfProfile(event.target.checked)}
            />{' '}
            Masquer les sorts hors profil <em>Hide out-of-profile spells</em>
          </label>
        </DevFrame>
      )}

      <DevFrame name="Bookmarks" uses={['state:openView']}>
        <Bookmarks openView={openView} onToggle={handleToggleView} />
      </DevFrame>

      {/* Parent commun du livre et des vues (App.css). Les vues sont soeurs de
          BookSpread, jamais dedans : dans une page elles seraient demontees
          pendant le tournage, inertes en mobile, et prises par le swipe. */}
      <div className="book-zone">
        {/* Livre inerte sous une vue ouverte : ni focus clavier, ni swipe. */}
        <div inert={openView !== null}>
          <BookSpread
            mobilePage={mobilePage}
            onMobilePageChange={setMobilePage}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            left={
              /* ... inchange (fiche de sort) ... */
            }
            right={
              <>
                {loading && (
                  <p>
                    Chargement des sorts... <em>Loading spells...</em>
                  </p>
                )}
                {error && <p role="alert">{error}</p>}
                {/* Sur la page et pas dans la vue Filtres (D4) : ces etats
                    vident la liste, ils doivent rester visibles vue fermee. */}
                {classSpellsLoading && (
                  <p>
                    Chargement des sorts de la classe... <em>Loading class spells...</em>
                  </p>
                )}
                {classSpellsError && <p role="alert">{classSpellsError}</p>}
                {schoolSpellsLoading && (
                  <p>
                    Chargement des sorts de l'ecole... <em>Loading school spells...</em>
                  </p>
                )}
                {schoolSpellsError && <p role="alert">{schoolSpellsError}</p>}
                {!loading && !error && (
                  <DevFrame
                    name="SpellList"
                    uses={[
                      'useSpellList',
                      'state:search',
                      'state:filtres',
                      'state:sortMode',
                      'useClassSpellIndices',
                      'useSchoolSpellIndices',
                      'useMultiSpellAccess',
                      'state:hideOutOfProfile',
                      'state:selectedIndex',
                      'state:page',
                      'useSpellSummaries',
                    ]}
                  >
                    <p>
                      {sortedSpells.length} / {spells.length} sorts <em>spells</em>
                    </p>
                    <SpellList
                      spells={pagedSpells}
                      onSelect={handleSelectSpell}
                      isAccessible={isAccessible}
                      summaries={spellSummaries}
                    />
                  </DevFrame>
                )}
              </>
            }
          />
        </div>

        {/* Toujours montees, masquees par `hidden` : voir BookmarkView. */}
        <FiltersView
          open={openView === 'filters'}
          onClose={closeView}
          levelFilter={levelFilter}
          onLevelChange={setLevelFilter}
          classes={classes}
          classFilter={classFilter}
          onClassChange={setClassFilter}
          schools={schools}
          schoolFilter={schoolFilter}
          onSchoolChange={setSchoolFilter}
          classListError={classListError}
          schoolListError={schoolListError}
        />
        <SortView
          open={openView === 'sort'}
          onClose={closeView}
          value={sortMode}
          onChange={setSortMode}
        />
        <CharacterView
          open={openView === 'character'}
          onClose={closeView}
          characters={characters}
          activeCharacterId={activeCharacterId}
          onSelectCharacter={setActiveCharacterId}
          onAddCharacter={addCharacter}
          onRemoveCharacter={removeCharacter}
          onRenameCharacter={renameCharacter}
          spellcastingClasses={spellcastingClasses}
          spellcastingClassesError={spellcastingClassesError}
          profiles={profiles}
          perProfile={perProfile}
          onSetProfile={setProfileById}
          onAddProfile={addProfile}
          onRemoveProfile={removeProfileById}
        />
        <SpellbookView
          open={openView === 'spellbook'}
          onClose={closeView}
          spells={personalSpells}
          allSpells={spells}
          selectedIndex={selectedIndex}
          onSelectSpell={handleSelectFromSpellbook}
          onRemoveSpell={removeFromSpellbook}
          isAccessible={isAccessible}
        />
      </div>

      <DevFramesToggle />
    </main>
  )
```

Le contenu de `left` reste identique au code actuel (`App.tsx:278-305`).

Les vues ne sont pas enveloppées dans un `DevFrame` à ce niveau : le `DevFrame` ajoute un conteneur qui casserait l'ancrage `position: absolute` de `.bookmark-view` sur `.book-zone`. Les `DevFrame` restent à l'intérieur des vues.

### 5.13 `src/dev/DevFrame.tsx` (ajout dans `SOURCE_COLORS`)

```diff
   'state:hideOutOfProfile': '#9a6324',
+  'state:sortMode': '#800000',
+  'state:openView': '#000075',
```

---

## 6. Ordre des commits

Un commit par étape. Chacun passe `tsc` et `eslint`, et laisse l'application utilisable.

| # | Message (format `CLAUDE.md`) | Contenu |
|---|---|---|
| 1 | `refactor(i18n): partage la langue du navigateur.` | 5.1, 5.11. Aucun changement visible. |
| 2 | `feat(grimoire): affiche le grimoire en une seule langue.` | Nom et « Niv./Lvl » dans `PersonalSpellbookPanel`. |
| 3 | `refactor(grimoire): separe la liste du formulaire de profil.` | Suppression de `profileForm`. Le formulaire reste provisoirement dans `details.other-panels`. |
| 4 | `feat(search): place la recherche et le filtre hors profil au-dessus du livre.` | Recherche et case F5 sorties de `details`. |
| 5 | `feat(sort): ajoute le tri alphabetique et par niveau.` | 5.3, `sortedSpells`, `filteredKey` sur la liste triée. Contrôle provisoire dans `details`. |
| 6 | `feat(bookmarks): ajoute les marque-pages et leurs vues.` | 5.2, 5.4 à 5.9, 5.12, 5.13, CSS 4.4, suppression de `details.other-panels`, messages D4 sur la page. Un seul commit, pour ne jamais avoir de contrôles en double. |
| 7 | `docs(plan): met a jour les specs et le plan du sprint 4.` | `SPECS.md` (section « Panneau de filtres »), les deux documents du sprint 4. |

Annulation : chaque commit peut être annulé seul avec `git revert`, sauf le 6, qui dépend des commits 3 à 5.

---

## 7. Plan de test

Il n'y a pas de framework de test dans le projet (pas de Vitest dans `package.json`), donc les tests sont manuels. Tester en desktop puis en mobile (fenêtre < 900px).

### Recherche et « hors profil »

- [ ] La recherche est visible pendant le chargement, en cas d'erreur API, et quand la liste est vide.
- [ ] Taper une recherche depuis la page 3 renvoie à la page 1. Vider le champ aussi.
- [ ] Accents, majuscules, noms FR et EN, espaces seuls.
- [ ] Escape dans la recherche vide le champ, sans effet sur une vue.
- [ ] Case F5 absente sans profil, présente dès le premier profil.
- [ ] F5 coché, puis suppression du dernier profil : la case disparaît, la liste est complète. Au retour d'un profil, la case réapparaît cochée et filtre à nouveau (D7).

### Marque-pages et vues

- [ ] Une seule vue ouverte à la fois. Vue A ouverte, clic sur B : A se ferme, B s'ouvre, le focus est sur le titre de B.
- [ ] Fermeture par le marque-page actif, par le bouton Fermer, par Escape. Le focus revient au marque-page d'origine.
- [ ] Escape quand une liste déroulante native est ouverte dans la vue : seule la liste se ferme (à vérifier par navigateur).
- [ ] Renommage de personnage en cours, fermeture puis réouverture de la vue : la saisie est conservée.
- [ ] Vue ouverte : Tab ne va pas dans le livre ; la recherche et les marque-pages restent atteignables.
- [ ] Mobile, vue ouverte : un swipe ou un tap près de la reliure ne change pas de page du livre.
- [ ] Mobile, vue ouverte avec `mobilePage` à gauche puis à droite : la vue reste au même endroit.
- [ ] Ouvrir une vue pendant l'animation de tournage : pas de blocage.
- [ ] Changer un filtre pendant que la vue est ouverte : la liste se met à jour dessous ; à la fermeture, la page 1 est affichée.
- [ ] Redimensionner desktop vers mobile avec une vue ouverte : la vue reste utilisable.
- [ ] Rechargement : aucune vue ouverte.

### Tri

- [ ] Au chargement, le tri est alphabétique.
- [ ] Navigateur FR : « Eau » avant « Éclair ». Navigateur EN : tri sur le nom anglais.
- [ ] Tri par niveau : tours de magie (niveau 0) en tête, ordre alphabétique à niveau égal.
- [ ] Changer de tri renvoie à la page 1 (correction de la section 2).
- [ ] Tri combiné aux filtres et à F5 : compteur `n / total` inchangé, aucun sort perdu ni dupliqué.

### Grimoire

- [ ] Un seul nom par sort, dans la langue du navigateur. `aria-label` « Retirer » dans la même langue.
- [ ] Choisir un sort : la vue se ferme et la fiche s'affiche. En mobile, la page de gauche s'affiche à chaque sélection (D3).
- [ ] Retirer un sort, puis le dernier sort : la liste se vide sans erreur.
- [ ] Sort hors profil : grisé, avec la mention « hors profil ».

### Personnage

- [ ] Changer de personnage avec des filtres actifs : les filtres restent, la liste est recalculée, retour en page 1.
- [ ] Supprimer le personnage actif : un autre devient actif, la vue reste ouverte.
- [ ] Ajouter ou retirer un profil pendant que la vue est ouverte : la vue reste ouverte.
- [ ] API coupée : l'erreur « classes lanceuses » s'affiche dans la vue Personnage.
- [ ] API coupée avec un filtre classe actif : le message d'erreur apparaît sur la page de droite, vue fermée (D4).

### Accessibilité

- [ ] `aria-expanded` à `true` seulement sur le marque-page ouvert. `aria-controls` vise un id présent dans le DOM.
- [ ] Icônes en `alt=""`, nom porté par l'`aria-label` du bouton, infobulle par `title`.
- [ ] Clavier seul : Tab atteint les 4 marque-pages, Entrée et Espace les activent.

---

## 8. Hors périmètre, noté pour plus tard

- Style des marque-pages, des vues, du fond et de la position (branche CSS).
- Indicateur de filtres actifs sur le marque-page « Filtres » (D8).
- Confirmation avant la suppression d'un personnage (D10).
- Zones tactiles d'au moins 44px et débordement des 4 marque-pages sur un écran de 320px : à traiter dans la branche CSS.

---

## 9. Écarts par rapport au code préparé

- Commits 2 et 3 : le `<h2>` de `PersonalSpellbookPanel` reste jusqu'au commit 6, où le titre passe dans la vue. Le commit 2 retire seulement la règle `.name-en` ; le commit 3 retire seulement `profileForm`.
- Commit 5 : la couleur `state:sortMode` de `DevFrame` est ajoutée dès le commit 5 (et non 6), car la liste l'utilise à ce commit. Le choix du tri est provisoire, en fieldset dans `details`, jusqu'au commit 6.
- `SortView` : libellés en JSX avec `<em>` (convention bilingue du dépôt), au lieu de chaînes « FR (EN) ».
- Le commit 6 retire les règles `h2` et `h2 em` de `PersonalSpellbookPanel.css`, devenues mortes.