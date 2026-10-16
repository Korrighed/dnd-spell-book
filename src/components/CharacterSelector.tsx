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
