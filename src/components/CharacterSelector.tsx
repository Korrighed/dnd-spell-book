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
        onClick={() => onRemove(activeCharacterId)}
      >
        Supprimer <em>Delete</em>
      </button>{' '}
      <label>
        Renommer <em>Rename</em>{' '}
        <input
          type="text"
          value={activeCharacter?.name ?? ''}
          onChange={(event) => onRename(activeCharacterId, event.target.value)}
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
