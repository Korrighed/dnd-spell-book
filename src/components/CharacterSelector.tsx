import { useState } from 'react'
import { t } from '../utils/browserLanguage'
import './CharacterSelector.css'

interface CharacterListItem {
  id: string
  name: string
}

interface CharacterSelectorProps {
  characters: CharacterListItem[]
  activeCharacterId: string
  onSelect: (id: string) => void
  onAdd: (name: string) => void
  onRemove: (id: string) => void
  onRename: (id: string, name: string) => void
}

/** Un personnage = un grimoire complet (sorts sauvegardes + classes). */
export function CharacterSelector({
  characters,
  activeCharacterId,
  onSelect,
  onAdd,
  onRemove,
  onRename,
}: CharacterSelectorProps) {
  const [newName, setNewName] = useState('')
  const activeCharacter = characters.find((character) => character.id === activeCharacterId)

  // Brouillon local : evite d'ecrire dans le stockage partage a chaque frappe
  // (un `storage` event par caractere tape, et une fenetre de collision entre
  // onglets elargie d'autant). Resynchronise pendant le rendu (pas un effet)
  // quand le personnage actif change, selon le pattern React recommande pour
  // ajuster un etat local a partir d'une prop qui change.
  const [nameDraft, setNameDraft] = useState(activeCharacter?.name ?? '')
  const [trackedCharacterId, setTrackedCharacterId] = useState(activeCharacterId)
  if (trackedCharacterId !== activeCharacterId) {
    setTrackedCharacterId(activeCharacterId)
    setNameDraft(activeCharacter?.name ?? '')
  }

  function commitRename() {
    const trimmed = nameDraft.trim()
    // Un nom vide viderait le libelle dans le menu deroulant : on garde le nom existant.
    if (trimmed && trimmed !== activeCharacter?.name) {
      onRename(activeCharacterId, trimmed)
    } else {
      setNameDraft(activeCharacter?.name ?? '')
    }
  }

  return (
    <div className="character-selector">
      <label>
        {t('Personnage', 'Character')}{' '}
        <select value={activeCharacterId} onChange={(event) => onSelect(event.target.value)}>
          {characters.map((character) => (
            <option key={character.id} value={character.id}>
              {character.name}
            </option>
          ))}
        </select>
      </label>{' '}
      <button
        type="button"
        aria-label={t('Supprimer ce personnage', 'Delete this character')}
        disabled={characters.length <= 1}
        onClick={() => {
          // Suppression definitive (sorts + classes du personnage), pas de corbeille :
          // seule action de ce composant qui merite une confirmation bloquante.
          const name = activeCharacter?.name ?? ''
          if (window.confirm(t(`Supprimer le personnage « ${name} » ?`, `Delete character "${name}"?`))) {
            onRemove(activeCharacterId)
          }
        }}
      >
        {t('Supprimer', 'Delete')}
      </button>{' '}
      <label>
        {t('Renommer', 'Rename')}{' '}
        <input
          type="text"
          value={nameDraft}
          onChange={(event) => setNameDraft(event.target.value)}
          onBlur={commitRename}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              commitRename()
              event.currentTarget.blur()
            }
          }}
        />
      </label>{' '}
      <label>
        {t('Nouveau personnage', 'New character')}{' '}
        <input
          type="text"
          value={newName}
          placeholder={t('Nom', 'Name')}
          onChange={(event) => setNewName(event.target.value)}
        />
      </label>{' '}
      <button
        type="button"
        disabled={!newName.trim()}
        onClick={() => {
          onAdd(newName.trim())
          setNewName('')
        }}
      >
        {t('Ajouter', 'Add')}
      </button>
    </div>
  )
}
