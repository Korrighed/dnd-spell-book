# T012 — Assembler la vue Personnage (sections, total, clés)

Statut : fait
Story : US-03, constat B5 · Exigences : D-04, [DESIGN-BRIEF.md §4](../DESIGN-BRIEF.md#vue-personnage--maquette), [APP-FLOW.md parcours US-03](../APP-FLOW.md#parcours-us-03--classes-et-multiclasse)
Dépend de : T011
Parallélisable : non
Exécutant : workflow:front

## Objectif

La vue Personnage a deux sections titrées (« Personnages », « Classes »). La section Classes affiche le niveau total et transmet le plafond à chaque carte. Chaque carte a une `key` stable. Après « Retirer », le focus reste dans la section.

## Fichiers à lire

- `src/components/CharacterView.tsx` — composant actuel (`profiles.map` sans `key`).
- `src/utils/characterLevels.ts` — `totalSpecifiedLevel`, `maxLevelForProfile`, `MAX_TOTAL_CHARACTER_LEVEL` (T008).
- `src/components/SpellcasterProfileForm.tsx` — prop `maxSelectableLevel` (T011).
- `src/App.css` — section « Vues des marque-pages », règle `#grimoire .help-view h3`.

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/components/CharacterView.tsx` | modifier | section Classes, total, clés, focus après retrait |
| `src/App.css` | modifier | titres `h3` des vues, ligne du total |

## Étapes

1. `src/components/CharacterView.tsx` : importer `useEffect`, `useRef` depuis `react`, et `MAX_TOTAL_CHARACTER_LEVEL`, `maxLevelForProfile`, `totalSpecifiedLevel` depuis `'../utils/characterLevels'`.

2. Dans le composant, avant le `return` :

```tsx
  const totalLevel = totalSpecifiedLevel(profiles)
  const overCap = totalLevel > MAX_TOTAL_CHARACTER_LEVEL
  const classesRef = useRef<HTMLElement>(null)
  // Index de la carte retiree : apres le rendu, le focus va sur la carte
  // qui prend sa place (ou la carte d'ajout), sinon il tomberait sur <body>.
  const focusCardIndex = useRef<number | null>(null)
  useEffect(() => {
    const index = focusCardIndex.current
    if (index === null) return
    focusCardIndex.current = null
    const cards = classesRef.current ? Array.from(classesRef.current.querySelectorAll('fieldset')) : []
    if (cards.length === 0) return
    const card = cards[Math.min(index, cards.length - 1)]
    // Liste « Classe » d'abord, jamais le bouton Retirer : deux Entree
    // retireraient deux classes d'affilee.
    card.querySelector<HTMLSelectElement>('select')?.focus()
  })
```

3. Remplacer le contenu situé entre `{spellcastingClassesError && …}` (inclus) et la fin du `SpellcasterProfileForm` d'ajout (inclus) par :

```tsx
      <section ref={classesRef} className="character-classes" aria-labelledby="character-classes-title">
        <h3 id="character-classes-title">{t('Classes', 'Classes')}</h3>
        <p className={overCap ? 'character-total character-total--over' : 'character-total'}>
          {overCap
            ? t(
                `Niveau total : ${totalLevel} / ${MAX_TOTAL_CHARACTER_LEVEL}, réduisez un niveau`,
                `Total level: ${totalLevel} / ${MAX_TOTAL_CHARACTER_LEVEL}, lower a level`,
              )
            : t(
                `Niveau total : ${totalLevel} / ${MAX_TOTAL_CHARACTER_LEVEL}`,
                `Total level: ${totalLevel} / ${MAX_TOTAL_CHARACTER_LEVEL}`,
              )}
        </p>
        {spellcastingClassesError && <p role="alert">{spellcastingClassesError}</p>}
        {profiles.map((profile, index) => (
          <SpellcasterProfileForm
            key={profile.id}
            classes={spellcastingClasses}
            profile={profile}
            maxSelectableLevel={maxLevelForProfile(profiles, profile.id)}
            maxSpellLevel={perProfile[index].maxSpellLevel}
            subclassSpellGrants={perProfile[index].subclassSpellGrants}
            loading={perProfile[index].loading}
            error={perProfile[index].error}
            onChange={(next) => {
              if (next) {
                onSetProfile(profile.id, next)
              } else {
                focusCardIndex.current = index
                onRemoveProfile(profile.id)
              }
            }}
          />
        ))}
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
      </section>
```

4. JSDoc de `CharacterView` : « Section Personnages (CharacterSelector) puis section Classes : niveau total plafonne a 20 (D-04), une carte par classe (key = profile.id : l'etat local d'une carte ne glisse pas sur sa voisine apres un retrait), puis la carte d'ajout. ».

5. `src/App.css` : juste avant le commentaire `/* ===== Vue d'aide =====`, ajouter :

```css
/* Titres de section des vues (Personnages, Classes). La vue d'aide a sa
   propre regle plus bas (meme specificite, declaree apres : elle gagne). */
#grimoire .bookmark-view h3 {
  margin: 0 0 8px;
  color: var(--caput-mortuum);
  font-size: 20px;
}

#grimoire .character-total {
  margin: 0 0 12px;
}

#grimoire .character-total--over {
  color: var(--caput-mortuum);
  font-weight: 700;
}
```

6. Lancer la vérification.

## Critères d'acceptation

- [ ] AC-01 : La vue montre « PERSONNAGES » puis « CLASSES » en OLDWEST Caput Mortuum, et « Niveau total : 0 / 20 » sans classe.
- [ ] AC-02 : Magicien niveau 12, puis Clerc choisi dans la carte d'ajout : la nouvelle carte Clerc propose les niveaux 1 à 8 (plus « Niveau non précisé (tous les sorts) »). Total « 12 / 20 ».
- [ ] AC-03 : Magicien 12 + Clerc 8 : la liste du Magicien propose 1 à 12, celle du Clerc 1 à 8. Total « 20 / 20 ».
- [ ] AC-04 : Magicien non précisé + Clerc 5 : total « 5 / 20 », le Magicien propose 1 à 15.
- [ ] AC-05 : Données anciennes. Dans la console, puis recharger :

```js
sessionStorage.removeItem('dnd-personal-spellbook:active-tab')
localStorage.setItem('dnd-personal-spellbook', JSON.stringify({
  version: 4,
  activeCharacterId: 'c1',
  characters: [{ id: 'c1', name: 'Test', spells: [], profiles: [
    { id: 'p1', classIndex: 'wizard', characterLevel: 15, subclassIndex: null, subclassFeatureIndex: null },
    { id: 'p2', classIndex: 'cleric', characterLevel: 10, subclassIndex: null, subclassFeatureIndex: null },
  ] }],
}))
```

   Attendu : total « 25 / 20, réduisez un niveau » en Caput Mortuum, gras. La liste du Magicien propose 1 à 10 puis 15 (valeur actuelle conservée, liste non contiguë : attendu). Aucune donnée modifiée tant que l'utilisateur ne touche à rien.
- [ ] AC-06 : Trois classes, « Retirer » sur celle du milieu : la troisième garde sa classe, son niveau et sa sous-classe. Le focus est sur la liste « Classe » de la carte qui a pris la place (pas sur « Retirer »). Aucun avertissement React `key` en console.
- [ ] AC-07 : L'aide garde ses titres (taille et marges de `.help-view h3` inchangées).

## Vérification

```bash
npm run lint
npm run build
```

Vérification navigateur : AC-01 à AC-07 à 1440×900, puis AC-01 et AC-03 à 390×844.

## Hors périmètre

- `SpellcasterProfileForm.tsx` (T011, fait), `CharacterSelector.tsx` (T010, fait).
- Indexer `perProfile` par id (alignement par position conservé, voir rapport d'architecture).
- Modifier les données enregistrées au-delà de 20.

## Notes d'exécution

- Étapes 1 à 5 appliquées (CharacterView.tsx, App.css). Aucun autre fichier touché.
- `npm run lint` : pass. `npm run build` : pass, avec l'avertissement vite « chunk > 500 kB » (hors périmètre T012).
- Vérification navigateur (AC-01 à AC-07, 1440×900 et 390×844) non exécutée par l'exécutant : à faire par le vérificateur.
- Carte d'ajout : `maxSelectableLevel` non transmis (conforme à l'étape 3). Sans effet visible : cette carte n'a pas de liste « Niveau ».
