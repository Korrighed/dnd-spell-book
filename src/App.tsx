import { useMemo, useState } from 'react'
import { useSpellList } from './hooks/useSpellList'
import { useClassList } from './hooks/useClassList'
import { useClassSpellIndices } from './hooks/useClassSpellIndices'
import { useSchoolList } from './hooks/useSchoolList'
import { useSchoolSpellIndices } from './hooks/useSchoolSpellIndices'
import { useSpellDetail } from './hooks/useSpellDetail'
import { usePersonalSpellbook } from './hooks/usePersonalSpellbook'
import { useSpellAccess } from './hooks/useSpellAccess'
import { useSpellcastingClasses } from './hooks/useSpellcastingClasses'
import { useClassSubclasses } from './hooks/useClassSubclasses'
import { getSubclassUnlockLevel } from './data/subclassUnlockLevel'
import type { SubclassFeatureOption } from './api/subclasses'
import { SpellSearch } from './components/SpellSearch'
import { SpellLevelFilter } from './components/SpellLevelFilter'
import { SpellClassFilter } from './components/SpellClassFilter'
import { SpellSchoolFilter } from './components/SpellSchoolFilter'
import { SpellList } from './components/SpellList'
import { SpellDetail } from './components/SpellDetail'
import { PersonalSpellbookPanel } from './components/PersonalSpellbookPanel'
import { SpellcasterProfileForm } from './components/SpellcasterProfileForm'
import { matchesSearch } from './utils/text'
import type { LanguageMode } from './types/language'
import { DevFrame, DevFramesToggle } from './dev/DevFrame'
import './App.css'

function App() {
  const { spells, loading, error } = useSpellList()
  const { classes, error: classListError } = useClassList()
  const { schools, error: schoolListError } = useSchoolList()
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | null>(null)
  const [classFilter, setClassFilter] = useState<string | null>(null)
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null)
  const [hideOutOfProfile, setHideOutOfProfile] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null)
  const [language, setLanguage] = useState<LanguageMode>('fr')
  const {
    spells: personalSpells,
    indices: personalIndices,
    remove: removeFromSpellbook,
    toggle: toggleSpellbook,
    profile,
    setProfile,
  } = usePersonalSpellbook()
  const { spellcastingClasses, error: spellcastingClassesError } = useSpellcastingClasses(classes)
  const {
    isAccessible,
    maxSpellLevel,
    loading: accessLoading,
    error: accessError,
    subclassSpellGrants,
  } = useSpellAccess(profile)
  const { subclasses, error: subclassesError } = useClassSubclasses(profile?.classIndex ?? null)
  const subclassUnlockLevel = profile ? getSubclassUnlockLevel(profile.classIndex) : 3
  const subclassFeatureOptions = useMemo(() => {
    if (!subclassSpellGrants) return []
    const seen = new Map<string, SubclassFeatureOption>()
    for (const grant of subclassSpellGrants) {
      if (grant.feature && !seen.has(grant.feature.index)) seen.set(grant.feature.index, grant.feature)
    }
    return [...seen.values()]
  }, [subclassSpellGrants])
  const {
    detail: selectedSpell,
    loading: detailLoading,
    error: detailError,
  } = useSpellDetail(selectedIndex)
  const {
    indices: classSpellIndices,
    loading: classSpellsLoading,
    error: classSpellsError,
  } = useClassSpellIndices(classFilter)
  const {
    indices: schoolSpellIndices,
    loading: schoolSpellsLoading,
    error: schoolSpellsError,
  } = useSchoolSpellIndices(schoolFilter)

  const filteredSpells = useMemo(() => {
    const query = search.trim()
    return spells.filter((spell) => {
      const matchesQuery =
        !query || matchesSearch(spell.name, query) || matchesSearch(spell.nameFr, query)
      const matchesLevel = levelFilter === null || spell.level === levelFilter
      const matchesClass = classFilter === null || (classSpellIndices?.has(spell.index) ?? false)
      const matchesSchool =
        schoolFilter === null || (schoolSpellIndices?.has(spell.index) ?? false)
      // Masquage optionnel, limite a la liste complete : le grimoire personnel grise seulement.
      const matchesProfile =
        !hideOutOfProfile || isAccessible === null || isAccessible(spell.index, spell.level)
      return matchesQuery && matchesLevel && matchesClass && matchesSchool && matchesProfile
    })
  }, [
    spells,
    search,
    levelFilter,
    classFilter,
    classSpellIndices,
    schoolFilter,
    schoolSpellIndices,
    hideOutOfProfile,
    isAccessible,
  ])

  const selectedOutOfProfile =
    selectedSpell !== null &&
    isAccessible !== null &&
    !isAccessible(selectedSpell.mechanics.index, selectedSpell.mechanics.level)

  return (
    <main id="grimoire">
      <h1>
        Grimoire des sorts <em>Spell book</em>
      </h1>

      <div className="filters">
        <DevFrame name="SpellSearch" uses={['state:search']}>
          <SpellSearch value={search} onChange={setSearch} />
        </DevFrame>
        <DevFrame name="SpellLevelFilter" uses={['state:filtres']}>
          <SpellLevelFilter value={levelFilter} onChange={setLevelFilter} />
        </DevFrame>
        <DevFrame name="SpellClassFilter" uses={['state:filtres', 'useClassList']}>
          <SpellClassFilter classes={classes} value={classFilter} onChange={setClassFilter} />
        </DevFrame>
        <DevFrame name="SpellSchoolFilter" uses={['state:filtres', 'useSchoolList']}>
          <SpellSchoolFilter schools={schools} value={schoolFilter} onChange={setSchoolFilter} />
        </DevFrame>
        {profile && (
          <DevFrame
            name="HideOutOfProfile (App)"
            uses={['state:hideOutOfProfile', 'usePersonalSpellbook']}
          >
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
      </div>

      {classListError && <p role="alert">{classListError}</p>}
      {schoolListError && <p role="alert">{schoolListError}</p>}
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

      {loading && (
        <p>
          Chargement des sorts... <em>Loading spells...</em>
        </p>
      )}
      {error && <p role="alert">{error}</p>}

      <DevFrame
        name="PersonalSpellbookPanel"
        uses={['usePersonalSpellbook', 'useSpellList', 'useSpellAccess', 'state:selectedIndex']}
      >
        <PersonalSpellbookPanel
          spells={personalSpells}
          allSpells={spells}
          selectedIndex={selectedIndex}
          onSelectSpell={setSelectedIndex}
          onRemoveSpell={removeFromSpellbook}
          profileForm={
            <DevFrame
              name="SpellcasterProfileForm"
              uses={['usePersonalSpellbook', 'useSpellcastingClasses', 'useSpellAccess']}
            >
              <SpellcasterProfileForm
                classes={spellcastingClasses}
                subclasses={subclasses}
                subclassUnlockLevel={subclassUnlockLevel}
                subclassFeatureOptions={subclassFeatureOptions}
                profile={profile}
                maxSpellLevel={maxSpellLevel}
                loading={accessLoading}
                error={accessError ?? spellcastingClassesError ?? subclassesError}
                onChange={setProfile}
              />
            </DevFrame>
          }
          isAccessible={isAccessible}
        />
      </DevFrame>

      {!loading && !error && (
        <DevFrame
          name="SpellList"
          uses={[
            'useSpellList',
            'state:search',
            'state:filtres',
            'useClassSpellIndices',
            'useSchoolSpellIndices',
            'useSpellAccess',
            'state:hideOutOfProfile',
            'state:selectedIndex',
          ]}
        >
          <p>
            {filteredSpells.length} / {spells.length} sorts <em>spells</em>
          </p>
          <SpellList
            spells={filteredSpells}
            onSelect={setSelectedIndex}
            isAccessible={isAccessible}
          />
        </DevFrame>
      )}

      {selectedIndex && detailLoading && <p>Chargement du detail du sort...</p>}
      {detailError && <p role="alert">{detailError}</p>}
      {/* La fiche reste toujours lisible, meme pour un sort hors profil ou masque de la liste. */}
      {selectedSpell && (
        <DevFrame
          name="SpellDetail"
          uses={[
            'useSpellDetail',
            'usePersonalSpellbook',
            'useSpellAccess',
            'state:language',
            'state:selectedIndex',
          ]}
        >
          <SpellDetail
            detail={selectedSpell}
            language={language}
            onLanguageChange={setLanguage}
            inSpellbook={personalIndices.has(selectedSpell.mechanics.index)}
            onToggleSpellbook={toggleSpellbook}
            outOfProfile={selectedOutOfProfile}
          />
        </DevFrame>
      )}

      <DevFramesToggle />
    </main>
  )
}

export default App
