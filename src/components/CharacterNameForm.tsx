import { useEffect, useId, useRef, useState } from 'react'
import { cleanCharacterName, MAX_CHARACTER_NAME_LENGTH } from '../utils/characterName'
import { t } from '../utils/browserLanguage'

interface CharacterNameFormProps {
  /** Libelle visible du champ. */
  label: string
  /** Valeur de depart : '' a la creation, nom actuel au renommage. */
  initialName: string
  /** Libelle du bouton de validation (« Creer », « Valider »). */
  submitLabel: string
  /** Vrai si ce nom (deja nettoye) est pris par un AUTRE personnage. */
  isTaken: (name: string) => boolean
  /** Recoit le nom nettoye, jamais vide ni pris. */
  onSubmit: (name: string) => void
  onCancel: () => void
}

/**
 * Champ de nom + Valider / Annuler, pour la creation et le renommage d'un
 * personnage. Entree valide (vrai <form>). Echap annule ce formulaire
 * seulement : la propagation est arretee, sinon BookmarkView fermerait la vue.
 */
export function CharacterNameForm({
  label,
  initialName,
  submitLabel,
  isTaken,
  onSubmit,
  onCancel,
}: CharacterNameFormProps) {
  const [draft, setDraft] = useState(initialName)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const errorId = useId()
  const cleaned = cleanCharacterName(draft)
  const taken = cleaned !== '' && isTaken(cleaned)
  const canSubmit = cleaned !== '' && !taken

  // Focus et selection a l'ouverture : on tape directement le nouveau nom.
  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  return (
    <form
      className="character-name-form"
      onSubmit={(event) => {
        event.preventDefault()
        if (canSubmit) onSubmit(cleaned)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation()
          event.preventDefault()
          onCancel()
        }
      }}
    >
      <label htmlFor={inputId}>{label}</label>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        value={draft}
        maxLength={MAX_CHARACTER_NAME_LENGTH}
        autoComplete="off"
        aria-invalid={taken}
        aria-describedby={taken ? errorId : undefined}
        onChange={(event) => setDraft(event.target.value)}
      />
      <button type="submit" className="view-button view-button--primary" disabled={!canSubmit}>
        {submitLabel}
      </button>
      <button type="button" className="view-button" onClick={onCancel}>
        {t('Annuler', 'Cancel')}
      </button>
      {taken && (
        <p id={errorId} role="alert" className="character-name-error">
          {t('Ce nom est déjà pris.', 'This name is already taken.')}
        </p>
      )}
    </form>
  )
}
