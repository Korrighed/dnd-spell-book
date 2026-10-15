# T010 — Refondre le sélecteur de personnage en pastilles

Statut : à faire
Story : US-01, US-02, constat B4 · Exigences : D-05, D-08, [DESIGN-BRIEF.md §4 maquette](../DESIGN-BRIEF.md#vue-personnage--maquette), [APP-FLOW.md §2-3](../APP-FLOW.md#2-parcours-utilisateur)
Dépend de : T009
Parallélisable : non
Exécutant : workflow:front

## Objectif

Le haut de la vue Personnage montre les personnages en pastilles (le personnage actif en Caput Mortuum), une pastille « + » pour en créer un, puis le nom du personnage actif avec deux boutons icône : renommer (crayon) et supprimer (corbeille, confirmation dans la vue). La liste déroulante, le champ « Renommer » toujours visible et `window.confirm` disparaissent.

## Fichiers à lire

- `src/components/CharacterSelector.tsx` — composant actuel (props conservées).
- `src/components/CharacterNameForm.tsx` — T009.
- `src/utils/characterName.ts` — `isCharacterNameTaken`.
- `src/components/MaskIcon.tsx` — icône en masque.
- `src/components/CharacterView.tsx` — appelant.
- `src/App.css` — classes `view-button`, `view-button--primary`, `icon-button` (T003).
- `docs/APP-FLOW.md` — parcours US-01, US-02 et diagramme d'états §3.

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/components/CharacterSelector.tsx` | modifier (réécriture complète) | pastilles, modes création / renommage / confirmation |
| `src/components/CharacterSelector.css` | modifier (réécriture complète) | styles |
| `src/components/CharacterView.tsx` | modifier | passe `open` au sélecteur |

## Étapes

1. Remplacer tout le contenu de `src/components/CharacterSelector.tsx` par :

```tsx
import { useEffect, useRef, useState } from 'react'
import { isCharacterNameTaken } from '../utils/characterName'
import { t } from '../utils/browserLanguage'
import { CharacterNameForm } from './CharacterNameForm'
import { MaskIcon } from './MaskIcon'
import './CharacterSelector.css'

interface CharacterListItem {
  id: string
  name: string
}

interface CharacterSelectorProps {
  /** Vue Personnage visible. Fermee : tout formulaire en cours est abandonne. */
  open: boolean
  characters: CharacterListItem[]
  activeCharacterId: string
  onSelect: (id: string) => void
  onAdd: (name: string) => void
  onRemove: (id: string) => void
  onRename: (id: string, name: string) => void
}

type Mode = 'view' | 'create' | 'rename' | 'confirm-delete'
type FocusTarget = 'active-chip' | 'plus' | 'pencil' | 'trash' | 'cancel-delete'

function chipDomId(id: string): string {
  return `character-chip-${id}`
}

/**
 * Personnages en pastilles (le personnage actif est enfonce), creation,
 * renommage et suppression en place. Un seul mode a la fois
 * (docs/APP-FLOW.md, §3). Plus de window.confirm : confirmation dans la vue
 * (D-05).
 */
export function CharacterSelector({
  open,
  characters,
  activeCharacterId,
  onSelect,
  onAdd,
  onRemove,
  onRename,
}: CharacterSelectorProps) {
  const [mode, setMode] = useState<Mode>('view')
  // Vue fermee : abandon du formulaire en cours. Ajustement pendant le rendu
  // (pas un effet), meme motif que les autres composants du projet.
  if (!open && mode !== 'view') {
    setMode('view')
  }

  const plusRef = useRef<HTMLButtonElement>(null)
  const pencilRef = useRef<HTMLButtonElement>(null)
  const trashRef = useRef<HTMLButtonElement>(null)
  const cancelDeleteRef = useRef<HTMLButtonElement>(null)
  // Cible du focus apres un changement de mode, appliquee apres le rendu :
  // l'element vise (nouvelle pastille, crayon...) n'existe qu'a ce moment-la.
  const pendingFocus = useRef<FocusTarget | null>(null)
  useEffect(() => {
    const target = pendingFocus.current
    if (target === null) return
    pendingFocus.current = null
    if (target === 'active-chip') {
      document.getElementById(chipDomId(activeCharacterId))?.focus()
      return
    }
    const refs = {
      plus: plusRef,
      pencil: pencilRef,
      trash: trashRef,
      'cancel-delete': cancelDeleteRef,
    }
    refs[target].current?.focus()
  })

  const activeName = characters.find((character) => character.id === activeCharacterId)?.name ?? ''
  const onlyOne = characters.length <= 1

  function backToView(focus: FocusTarget) {
    pendingFocus.current = focus
    setMode('view')
  }

  function renderActive() {
    if (mode === 'rename') {
      return (
        <CharacterNameForm
          label={t('Nouveau nom', 'New name')}
          initialName={activeName}
          submitLabel={t('Valider', 'Confirm')}
          isTaken={(name) => isCharacterNameTaken(characters, name, activeCharacterId)}
          onSubmit={(name) => {
            if (name !== activeName) onRename(activeCharacterId, name)
            backToView('pencil')
          }}
          onCancel={() => backToView('pencil')}
        />
      )
    }
    if (mode === 'confirm-delete') {
      return (
        <div
          className="character-confirm"
          role="group"
          aria-label={t('Confirmer la suppression', 'Confirm deletion')}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation()
              backToView('trash')
            }
          }}
        >
          <p>
            {t(
              `Supprimer « ${activeName} », ses classes et ses sorts ?`,
              `Delete "${activeName}", their classes and their spells?`,
            )}
          </p>
          <button
            type="button"
            className="view-button view-button--primary"
            onClick={() => {
              onRemove(activeCharacterId)
              backToView('active-chip')
            }}
          >
            {t('Supprimer', 'Delete')}
          </button>
          <button
            ref={cancelDeleteRef}
            type="button"
            className="view-button"
            onClick={() => backToView('trash')}
          >
            {t('Annuler', 'Cancel')}
          </button>
        </div>
      )
    }
    return (
      <>
        <p className="character-active-name">{activeName}</p>
        <button
          ref={pencilRef}
          type="button"
          className="icon-button"
          aria-label={t('Renommer le personnage', 'Rename character')}
          title={t('Renommer le personnage', 'Rename character')}
          onClick={() => setMode('rename')}
        >
          <MaskIcon file="pencil.svg" />
        </button>
        <button
          ref={trashRef}
          type="button"
          className="icon-button"
          aria-label={t('Supprimer le personnage', 'Delete character')}
          title={t('Supprimer le personnage', 'Delete character')}
          disabled={onlyOne}
          onClick={() => {
            pendingFocus.current = 'cancel-delete'
            setMode('confirm-delete')
          }}
        >
          <MaskIcon file="trash-2.svg" />
        </button>
        {onlyOne && (
          <p className="character-hint">
            {t('Il faut garder au moins un personnage.', 'At least one character is required.')}
          </p>
        )}
      </>
    )
  }

  return (
    <div className="character-selector">
      <h3>{t('Personnages', 'Characters')}</h3>
      <div className="character-chips" role="group" aria-label={t('Personnages', 'Characters')}>
        {characters.map((character) => (
          <button
            key={character.id}
            id={chipDomId(character.id)}
            type="button"
            className="character-chip"
            aria-pressed={character.id === activeCharacterId}
            title={character.name}
            onClick={() => {
              setMode('view')
              onSelect(character.id)
            }}
          >
            <span className="character-chip-name">{character.name}</span>
          </button>
        ))}
        <button
          ref={plusRef}
          type="button"
          className="character-chip character-chip--add"
          aria-label={t('Nouveau personnage', 'New character')}
          title={t('Nouveau personnage', 'New character')}
          aria-expanded={mode === 'create'}
          onClick={() => setMode('create')}
        >
          <MaskIcon file="plus.svg" />
        </button>
      </div>

      {mode === 'create' && (
        <CharacterNameForm
          label={t('Nom du nouveau personnage', 'New character name')}
          initialName=""
          submitLabel={t('Créer', 'Create')}
          isTaken={(name) => isCharacterNameTaken(characters, name)}
          onSubmit={(name) => {
            onAdd(name)
            backToView('active-chip')
          }}
          onCancel={() => backToView('plus')}
        />
      )}

      <div className="character-active">{renderActive()}</div>
    </div>
  )
}
```

2. Remplacer tout le contenu de `src/components/CharacterSelector.css` par :

```css
.character-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--coffee);
}

.character-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.character-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 44px;
  max-width: 16em;
  padding: 8px 16px;
  border: 1px solid var(--coffee);
  border-radius: 999px;
  background: var(--paper-light);
  color: #000;
  font: inherit;
  font-size: 16px;
  cursor: pointer;
}

.character-chip:hover {
  border-color: var(--caput-mortuum);
}

.character-chip[aria-pressed='true'] {
  border-color: var(--caput-mortuum);
  background: var(--caput-mortuum);
  color: var(--tan);
}

/* Nom long : coupe par des points de suspension, nom complet en title. */
.character-chip-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.character-chip--add {
  width: 44px;
  padding: 0;
  color: var(--coffee);
}

.character-active,
.character-confirm,
.character-name-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.character-active-name {
  min-width: 0;
  font-size: 1.2em;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.character-name-form input {
  flex: 1 1 14em;
  min-width: 0;
}

.character-name-error,
.character-hint {
  flex-basis: 100%;
}

.character-name-error {
  color: var(--caput-mortuum);
}

.character-hint {
  font-size: 0.9em;
}
```

3. `src/components/CharacterView.tsx` : passer `open={open}` à `<CharacterSelector … />`. Rien d'autre dans ce fichier.

4. Lancer la vérification.

## Critères d'acceptation

- [ ] AC-01 : Vue Personnage : une pastille par personnage, l'active en fond Caput Mortuum avec `aria-pressed="true"`. Plus aucun `<select>` de personnage.
- [ ] AC-02 : Clic sur « + », saisie « Gandalf », Entrée : pastille « Gandalf » créée et active, formulaire fermé, focus sur la nouvelle pastille.
- [ ] AC-03 : Création avec « gandalf » (existe déjà) : « Créer » désactivé, « Ce nom est déjà pris. » affiché. Avec « GÀNDALF » : refusé aussi (majuscules et accents ignorés).
- [ ] AC-04 : Saisie de 60 caractères : le champ s'arrête à 40.
- [ ] AC-05 : Formulaire de création ouvert, Échap : formulaire fermé, **vue toujours ouverte**, focus sur « + ».
- [ ] AC-06 : Crayon, nouveau nom, Entrée : nom mis à jour sur la pastille et sous les pastilles, une seule écriture `localStorage` (clé `dnd-personal-spellbook`), focus sur le crayon.
- [ ] AC-07 : Corbeille : message « Supprimer « Gandalf », ses classes et ses sorts ? », focus sur « Annuler ». Échap : retour, vue ouverte, focus sur la corbeille. « Supprimer » : personnage retiré, premier personnage actif, focus sur sa pastille. Aucune boîte `window.confirm`.
- [ ] AC-08 : Un seul personnage : corbeille désactivée et texte visible « Il faut garder au moins un personnage. ».
- [ ] AC-09 : Nom de 40 « A » : pas de défilement horizontal de la vue (`scrollWidth <= clientWidth`) à 390×844 **et** à 1440×900, pastille coupée par « … ».
- [ ] AC-10 : Formulaire de création ouvert, fermeture de la vue par la croix puis réouverture : formulaire fermé.

## Vérification

```bash
npm run lint
npm run build
```

Vérification navigateur : AC-01 à AC-10, à 1440×900 et 390×844 (AC-09). Vider `localStorage` et `sessionStorage` avant de commencer.

## Hors périmètre

- Formulaires de classe et section Classes (T011, T012).
- Hook `usePersonalSpellbook` : aucune modification.
- Titre `h3` en Caput Mortuum : T012.

## Notes d'exécution
