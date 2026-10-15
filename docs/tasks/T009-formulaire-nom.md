# T009 — Créer le formulaire de nom de personnage

Statut : à faire
Story : US-01, US-02, constat B4 · Exigences : D-08, [APP-FLOW.md parcours US-01 et US-02](../APP-FLOW.md#2-parcours-utilisateur)
Dépend de : T003, T008
Parallélisable : non
Exécutant : workflow:front

## Objectif

Un composant réutilisable `CharacterNameForm` sert à créer et à renommer un personnage : champ limité à 40 caractères, refus des noms vides ou déjà pris, Entrée valide, Échap annule sans fermer la vue.

## Fichiers à lire

- `src/utils/characterName.ts` — `MAX_CHARACTER_NAME_LENGTH`, `cleanCharacterName` (créés par T008).
- `src/components/BookmarkView.tsx` — Échap ferme la vue sur la `<section>` parente : le formulaire doit arrêter la propagation.
- `src/utils/browserLanguage.ts` — `t(fr, en)`.
- `src/App.css` — classes `view-button`, `view-button--primary` (T003).

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/components/CharacterNameForm.tsx` | créer | nouveau composant |

## Étapes

1. Créer `src/components/CharacterNameForm.tsx` avec ce contenu :

```tsx
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
```

2. Ne pas importer le composant ailleurs : T010 le branche.

3. Lancer la vérification.

## Critères d'acceptation

- [ ] AC-01 : `npm run lint` et `npm run build` passent.
- [ ] AC-02 : Par lecture : un `<form>` dont `onSubmit` appelle `preventDefault` et n'appelle `onSubmit` que si `canSubmit`.
- [ ] AC-03 : Par lecture : Échap appelle `stopPropagation` puis `onCancel`.
- [ ] AC-04 : Par lecture : `maxLength={MAX_CHARACTER_NAME_LENGTH}` sur le champ, message d'erreur relié par `aria-describedby` quand le nom est pris.

## Vérification

```bash
npm run lint
npm run build
```

Vérification navigateur : aucune (composant non branché, contrôlé en T010).

## Hors périmètre

- Styles (`.character-name-form`, `.character-name-error`) : T010.
- `CharacterSelector.tsx` : T010.

## Notes d'exécution
