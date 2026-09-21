import { useState } from 'react'
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
        Personnage <em>Character</em>{' '}
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
        aria-label="Supprimer ce personnage"
        disabled={characters.length <= 1}
        onClick={() => {
          // Suppression definitive (sorts + classes du personnage), pas de corbeille :
          // seule action de ce composant qui merite une confirmation bloquante.
          if (window.confirm(`Supprimer le personnage « ${activeCharacter?.name ?? ''} » ?`)) {
            onRemove(activeCharacterId)
          }
        }}
      >
        Supprimer <em>Delete</em>
      </button>{' '}
      <label>
        Renommer <em>Rename</em>{' '}
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
        Nouveau personnage <em>New character</em>{' '}
        <input
          type="text"
          value={newName}
          placeholder="Nom (Name)"
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
        Ajouter <em>Add</em>
      </button>
    </div>
  )
}
