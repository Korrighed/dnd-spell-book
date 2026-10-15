# T011 — Refondre le formulaire de classe en carte

Statut : à faire
Story : US-03 · Exigences : D-04, [DESIGN-BRIEF.md §4](../DESIGN-BRIEF.md#vue-personnage--maquette), [APP-FLOW.md parcours US-03](../APP-FLOW.md#parcours-us-03--classes-et-multiclasse)
Dépend de : T008, T010
Parallélisable : non
Exécutant : workflow:front

## Objectif

Chaque classe du personnage est une carte avec un seul geste de retrait (« Retirer »). Les boutons `×` et « Effacer » disparaissent. Les listes proposent des options vides explicites. La liste des niveaux respecte le plafond transmis. La carte d'ajout est en pointillés. Les règles de remise à zéro en cascade restent identiques.

## Fichiers à lire

- `src/components/SpellcasterProfileForm.tsx` — composant actuel. Les blocs `onChange` des listes Classe (l. 81-98), Niveau (l. 121-134), Sous-classe (l. 166-171) et Terrain (l. 218-220) sont repris **mot pour mot** dans le code ci-dessous : ne pas les modifier.
- `src/components/SpellcasterProfileForm.css`.
- `src/index.css` — classe `.visually-hidden` (T007).
- `src/App.css` — `view-button` (T003).

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/components/SpellcasterProfileForm.tsx` | modifier | rendu, libellés, prop `maxSelectableLevel` |
| `src/components/SpellcasterProfileForm.css` | modifier (réécriture complète) | style de carte |

## Étapes

1. Dans `src/components/SpellcasterProfileForm.tsx` :
   - ajouter à l'interface des props, après `onChange` :

```tsx
  /**
   * Plus haut niveau proposable : plafond de niveau total deduit en amont
   * (src/utils/characterLevels.ts). Defaut : MAX_CHARACTER_LEVEL.
   */
  maxSelectableLevel?: number
```

   - dans la déstructuration des props, ajouter `maxSelectableLevel = MAX_CHARACTER_LEVEL,` ;
   - garder tel quel tout le code entre le début du composant et la ligne `const blockLabel = …` (inclus) ;
   - juste après `const blockLabel = …`, ajouter :

```tsx
  // Le niveau actuel reste toujours proposable, meme au-dela du plafond
  // (donnees anciennes) : sinon la liste afficherait une valeur absente.
  const levelOptions = CHARACTER_LEVELS.filter(
    (level) => level <= maxSelectableLevel || level === profile?.characterLevel,
  )
  const capReached = profile !== null && !hasLevel && maxSelectableLevel === 0

  function accessText(): string {
    if (!hasLevel) {
      return t(
        'Sorts accessibles : tous les niveaux (niveau non précisé)',
        'Accessible spells: all levels (level unspecified)',
      )
    }
    if (maxSpellLevel === null) return t('Sorts accessibles : inconnu', 'Accessible spells: unknown')
    if (maxSpellLevel === 0) {
      return t(
        'Sorts accessibles : aucun emplacement de sort à ce niveau',
        'Accessible spells: no spell slot at this level',
      )
    }
    return t(
      `Sorts accessibles : jusqu'au niveau ${maxSpellLevel}`,
      `Accessible spells: up to level ${maxSpellLevel}`,
    )
  }
```

2. Remplacer tout le `return ( … )` du composant par :

```tsx
  const title = profile ? blockLabel : t('Ajouter une classe (multiclasse)', 'Add a class (multiclass)')

  return (
    <fieldset className={profile ? 'spellcaster-profile' : 'spellcaster-profile spellcaster-profile--add'}>
      {/* Legende pour le nom accessible du groupe ; titre visible dans
          l'en-tete, a cote du bouton Retirer (une legende ne se place pas
          de facon fiable dans une grille ou un flex). */}
      <legend className="visually-hidden">{title}</legend>
      <div className="spellcaster-profile-header">
        <p className="spellcaster-profile-title" aria-hidden="true">
          {title}
        </p>
        {profile && (
          <button
            type="button"
            className="view-button"
            aria-label={t(`Retirer la classe ${blockLabel}`, `Remove class ${blockLabel}`)}
            onClick={() => onChange(null)}
          >
            {t('Retirer', 'Remove')}
          </button>
        )}
      </div>

      <div className="spellcaster-profile-fields">
        <label>
          {t('Classe', 'Class')}
          <select
            value={profile?.classIndex ?? ''}
            onChange={(event) => {
              const classIndex = event.target.value
              // Changer de classe conserve le niveau, mais efface la sous-classe :
              // elle est propre a l'ancienne classe. Retirer la classe retire ce bloc.
              // `id` : conserve celui du bloc existant ; pour un nouveau bloc (profile
              // null), la valeur est ignoree, addProfile assigne le vrai id.
              onChange(
                classIndex
                  ? {
                      id: profile?.id ?? '',
                      classIndex,
                      characterLevel: profile?.characterLevel ?? null,
                      subclassIndex: null,
                      subclassFeatureIndex: null,
                    }
                  : null,
              )
            }}
          >
            {profile === null && <option value="">{t('Choisir une classe', 'Choose a class')}</option>}
            {classes.map((cls) => (
              <option key={cls.index} value={cls.index}>
                {t(cls.nameFr, cls.name)}
              </option>
            ))}
          </select>
        </label>

        {profile && (
          <label>
            {t('Niveau', 'Level')}
            <select
              value={profile.characterLevel ?? ''}
              onChange={(event) => {
                const raw = event.target.value
                const characterLevel = raw ? Number(raw) : null
                // Repasser sous le seuil de deblocage retire la sous-classe :
                // le personnage ne l'a pas encore a ce niveau.
                const stillUnlocked = characterLevel === null || characterLevel >= subclassUnlockLevel
                onChange({
                  ...profile,
                  characterLevel,
                  subclassIndex: stillUnlocked ? profile.subclassIndex : null,
                  subclassFeatureIndex: stillUnlocked ? profile.subclassFeatureIndex : null,
                })
              }}
            >
              <option value="">{t('Niveau non précisé (tous les sorts)', 'Unspecified level (all spells)')}</option>
              {levelOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Le bloc reste visible tant que le profil a deja une sous-classe
            choisie, meme si la liste fraiche echoue ou charge encore : sinon
            les sorts qu'elle accorde resteraient appliques sans moyen de la
            voir ni de la retirer. */}
        {subclassUnlocked && (subclasses.length > 0 || profile?.subclassIndex) && (
          <label>
            {t('Sous-classe', 'Subclass')}
            <select
              value={profile?.subclassIndex ?? ''}
              onChange={(event) => {
                if (!profile) return
                const subclassIndex = event.target.value || null
                // Changer de sous-classe efface le sous-choix (terrain, etc.).
                onChange({ ...profile, subclassIndex, subclassFeatureIndex: null })
              }}
            >
              <option value="">{t('Aucune sous-classe', 'No subclass')}</option>
              {subclasses.length > 0
                ? subclasses.map((sub) => (
                    <option key={sub.index} value={sub.index}>
                      {t(sub.nameFr, sub.name)}
                    </option>
                  ))
                : profile?.subclassIndex && (
                    <option value={profile.subclassIndex}>{profile.subclassIndex}</option>
                  )}
            </select>
          </label>
        )}

        {profile?.subclassIndex && subclassFeatureOptions.length > 0 && (
          <label>
            {t('Terrain', 'Terrain')}
            <select
              value={profile.subclassFeatureIndex ?? ''}
              onChange={(event) =>
                onChange({ ...profile, subclassFeatureIndex: event.target.value || null })
              }
            >
              <option value="">{t('Non précisé', 'Unspecified')}</option>
              {subclassFeatureOptions.map((option) => (
                <option key={option.index} value={option.index}>
                  {t(option.nameFr, option.name)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {subclassUnlocked && subclasses.length === 0 && profile?.subclassIndex && (
        subclassesLoading && !subclassesError ? (
          <p role="status">{t('Chargement de la liste des sous-classes…', 'Loading subclass list…')}</p>
        ) : (
          <p role="alert">
            {subclassesError
              ? t(
                  `Liste des sous-classes indisponible (${subclassesError})`,
                  `Subclass list unavailable (${subclassesError})`,
                )
              : t(
                  'Sous-classe enregistrée introuvable dans la liste actuelle.',
                  'Saved subclass not found in the current list.',
                )}
          </p>
        )
      )}
      {capReached && (
        <p>{t('Niveau total de 20 atteint : seul « non précisé » reste possible.', 'Total level 20 reached: only “unspecified” is left.')}</p>
      )}
      {profile && loading && <p role="status">{t('Calcul des sorts accessibles…', 'Computing accessible spells…')}</p>}
      {profile && error && <p role="alert">{error}</p>}
      {profile && !loading && !error && <p className="spellcaster-profile-access">{accessText()}</p>}
    </fieldset>
  )
```

   Note : l'ancien message « sous-classes » s'affichait quand `subclasses.length === 0` à l'intérieur du bloc Sous-classe (donc avec `subclassUnlocked` et une liste vide ou un `subclassIndex`). La condition ci-dessus le restreint au cas où le bloc est visible faute de liste, c'est-à-dire `profile?.subclassIndex` présent : c'est le même cas d'affichage que l'existant, car le bloc n'apparaît avec une liste vide que si `profile?.subclassIndex` existe.

3. Si `hasLevel` n'était utilisée que dans l'ancien rendu, elle est maintenant utilisée par `accessText` et `capReached` : la garder.

4. Remplacer tout le contenu de `src/components/SpellcasterProfileForm.css` par :

```css
/* Carte de classe (docs/DESIGN-BRIEF.md). <fieldset> + <legend> masquee
   pour le nom accessible ; titre visible dans l'en-tete. */
.spellcaster-profile {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  margin: 0 0 12px;
  padding: 12px;
  border: 1px solid var(--coffee);
  border-radius: 8px;
  background: var(--paper-light);
}

.spellcaster-profile--add {
  border-style: dashed;
  background: none;
}

.spellcaster-profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.spellcaster-profile-title {
  font-weight: 700;
  font-size: 1.1em;
}

.spellcaster-profile-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.spellcaster-profile-fields label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

@media (max-width: 899px) {
  .spellcaster-profile-fields label {
    flex: 1 1 100%;
  }

  .spellcaster-profile-fields select {
    width: 100%;
  }
}
```

5. Lancer la vérification.

## Critères d'acceptation

- [ ] AC-01 : Plus aucun bouton `×` ni « Effacer » dans la vue Personnage. Une carte par classe, titre visible à gauche, un seul bouton « Retirer » à droite (capture).
- [ ] AC-02 : Carte d'ajout en pointillés, titre « Ajouter une classe (multiclasse) », liste « Classe » sur « Choisir une classe ». Choisir Magicien crée une carte « Magicien » au-dessus. La carte d'ajout se vide.
- [ ] AC-03 : Dans une carte existante, la liste Classe ne propose pas d'option vide.
- [ ] AC-04 (cascade) : Magicien niveau 5 avec une sous-classe choisie. Passer en Clerc : niveau 5 gardé, sous-classe vidée.
- [ ] AC-05 (cascade) : Magicien niveau 5 avec sous-classe. Passer au niveau 1 (sous le seuil 2) : la sous-classe disparaît.
- [ ] AC-06 : Niveau non précisé : « Sorts accessibles : tous les niveaux (niveau non précisé) ». Magicien niveau 5 : « jusqu'au niveau 3 ». Paladin niveau 1 : « aucun emplacement de sort à ce niveau ».
- [ ] AC-07 : « Retirer » supprime la carte. Les autres cartes gardent leurs valeurs.
- [ ] AC-08 : À 390×844, les champs d'une carte sont empilés en pleine largeur, sans défilement horizontal.
- [ ] AC-09 : Aucune chaîne affichée sans accent : `grep -n "'[^']*\(Deselectionner\|Non precise\|enregistree\|Niveau max\|Effacer\)" src/components/SpellcasterProfileForm.tsx` ne renvoie rien.
- [ ] AC-10 : Le lecteur d'écran nomme chaque groupe par sa légende (arbre d'accessibilité : `group` « Magicien », `group` « Ajouter une classe (multiclasse) »).

## Vérification

```bash
npm run lint
npm run build
```

Vérification navigateur : AC-01 à AC-08 et AC-10, 1440×900 et 390×844. Le plafond (`maxSelectableLevel`) n'est pas encore transmis : il est contrôlé en T012.

## Hors périmètre

- `CharacterView.tsx` (T012).
- La logique de `useMultiSpellAccess`, `useClassSubclasses`.
- La validation du niveau total dans le hook.

## Notes d'exécution
