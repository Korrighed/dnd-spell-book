import { useMemo, useRef, useState } from 'react'
import { useSpellList } from './hooks/useSpellList'
import { useClassList } from './hooks/useClassList'
import { useClassSpellIndices } from './hooks/useClassSpellIndices'
import { useSchoolList } from './hooks/useSchoolList'
import { useSchoolSpellIndices } from './hooks/useSchoolSpellIndices'
import { useSpellDetail } from './hooks/useSpellDetail'
import { useSpellSummaries } from './hooks/useSpellSummaries'
import { usePersonalSpellbook } from './hooks/usePersonalSpellbook'
import { useMultiSpellAccess } from './hooks/useMultiSpellAccess'
import { useSpellcastingClasses } from './hooks/useSpellcastingClasses'
import { SpellSearch } from './components/SpellSearch'
import { SpellLevelFilter } from './components/SpellLevelFilter'
import { SpellClassFilter } from './components/SpellClassFilter'
import { SpellSchoolFilter } from './components/SpellSchoolFilter'
import { SpellList } from './components/SpellList'
import { SpellDetail } from './components/SpellDetail'
import { PersonalSpellbookPanel } from './components/PersonalSpellbookPanel'
import { SpellcasterProfileForm } from './components/SpellcasterProfileForm'
import { CharacterSelector } from './components/CharacterSelector'
import { BookSpread } from './components/BookSpread'
import { MOBILE_QUERY, useMediaQuery } from './hooks/useMediaQuery'
import type { BookPage } from './hooks/useHorizontalSwipe'
import { matchesSearch } from './utils/text'
import { DEFAULT_SORT_MODE, sortSpells, type SortMode } from './utils/spellSort'
import type { LanguageMode } from './types/language'
import { DevFrame, DevFramesToggle } from './dev/DevFrame'
import './App.css'

const SPELLS_PER_PAGE_DESKTOP = 14
const SPELLS_PER_PAGE_MOBILE = 16

function App() {
  const { spells, loading, error } = useSpellList()
  const spellSummaries = useSpellSummaries(spells)
  const { classes, error: classListError } = useClassList()
  const { schools, error: schoolListError } = useSchoolList()
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | null>(null)
  const [classFilter, setClassFilter] = useState<string | null>(null)
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null)
  const [hideOutOfProfile, setHideOutOfProfile] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>(DEFAULT_SORT_MODE)
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null)
  // Mobile : page du livre visible (liste par defaut). Bascule automatique
  // vers la fiche a la PREMIERE selection d'un sort seulement, pour montrer
  // que l'autre page existe. Flag en memoire (pas sessionStorage) : un
  // rechargement de la page rearme la bascule.
  const [mobilePage, setMobilePage] = useState<BookPage>('right')
  const hasAutoSwitchedPage = useRef(false)
  const handleSelectSpell = (index: string) => {
    setSelectedIndex(index)
    if (!hasAutoSwitchedPage.current && window.matchMedia(MOBILE_QUERY).matches) {
      hasAutoSwitchedPage.current = true
      setMobilePage('left')
    }
  }
  const [page, setPage] = useState(0)
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const spellsPerPage = isMobile ? SPELLS_PER_PAGE_MOBILE : SPELLS_PER_PAGE_DESKTOP
  const [language, setLanguage] = useState<LanguageMode>('fr')
  const {
    spells: personalSpells,
    indices: personalIndices,
    remove: removeFromSpellbook,
    toggle: toggleSpellbook,
    profiles,
    setProfileById,
    addProfile,
    removeProfileById,
    characters,
    activeCharacterId,
    setActiveCharacterId,
    addCharacter,
    removeCharacter,
    renameCharacter,
  } = usePersonalSpellbook()
  const { spellcastingClasses, error: spellcastingClassesError } = useSpellcastingClasses(classes)
  const { isAccessible, perProfile } = useMultiSpellAccess(profiles)
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

  // Tri applique APRES le filtrage, sur une copie : un tri ne retire aucun sort.
  const sortedSpells = useMemo(
    () => sortSpells(filteredSpells, sortMode),
    [filteredSpells, sortMode],
  )

  // Remise a la premiere page a chaque changement du CONTENU ou de l'ORDRE de
  // la liste (recherche, filtres, profil, tri) : une page 5 peut ne plus
  // exister apres coup. Cle calculee sur la liste TRIEE : un tri change
  // l'ordre des index sans changer leur ensemble. Comparaison sur les index,
  // pas sur la reference du tableau : filteredSpells est recalcule des
  // qu'isAccessible change, meme quand la liste affichee est identique.
  // Comparaison pendant le rendu plutot que dans un effet (regle
  // react-hooks/set-state-in-effect).
  const filteredKey = useMemo(
    () => sortedSpells.map((spell) => spell.index).join(','),
    [sortedSpells],
  )
  const [prevFilteredKey, setPrevFilteredKey] = useState(filteredKey)
  if (filteredKey !== prevFilteredKey) {
    setPrevFilteredKey(filteredKey)
    setPage(0)
  }

  const totalPages = Math.max(1, Math.ceil(sortedSpells.length / spellsPerPage))
  // Le changement de gabarit d'ecran (spellsPerPage) peut rendre la page
  // courante hors bornes (ex. page 4 avec 15/page, resize vers 8/page).
  if (page >= totalPages) {
    setPage(totalPages - 1)
  }
  const pagedSpells = sortedSpells.slice(
    page * spellsPerPage,
    (page + 1) * spellsPerPage,
  )

  const selectedOutOfProfile =
    selectedSpell !== null &&
    isAccessible !== null &&
    !isAccessible(selectedSpell.mechanics.index, selectedSpell.mechanics.level)

  return (
    <main id="grimoire">
      {/* Recherche permanente, au-dessus du livre, sur tous les formats. */}
      <DevFrame name="SpellSearch" uses={['state:search']}>
        <SpellSearch value={search} onChange={setSearch} />
      </DevFrame>

      {/* Acces rapide : se bascule souvent pendant une recherche. */}
      {profiles.length > 0 && (
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

      {/* Replie par defaut : le but est de laisser un maximum de place au
          canvas pendant le reglage de la position/taille du livre 3D.
          Remonte en haut de page (avant BookSpread) : les filtres restent
          la premiere chose visible/deployable en haut de la fenetre. */}
      <details className="other-panels">
        <summary>Filtres et grimoire personnel</summary>

        <div className="filters">
          <DevFrame name="SpellLevelFilter" uses={['state:filtres']}>
            <SpellLevelFilter value={levelFilter} onChange={setLevelFilter} />
          </DevFrame>
          <DevFrame name="SpellClassFilter" uses={['state:filtres', 'useClassList']}>
            <SpellClassFilter classes={classes} value={classFilter} onChange={setClassFilter} />
          </DevFrame>
          <DevFrame name="SpellSchoolFilter" uses={['state:filtres', 'useSchoolList']}>
            <SpellSchoolFilter schools={schools} value={schoolFilter} onChange={setSchoolFilter} />
          </DevFrame>
        </div>

        <DevFrame name="SortView (radios)" uses={['state:sortMode']}>
          <fieldset>
            <legend>
              Trier la liste <em>Sort the list</em>
            </legend>
            <label>
              <input
                type="radio"
                name="sort-mode"
                value="alpha"
                checked={sortMode === 'alpha'}
                onChange={() => setSortMode('alpha')}
              />{' '}
              Ordre alphabetique <em>Alphabetical</em>
            </label>
            <label>
              <input
                type="radio"
                name="sort-mode"
                value="level"
                checked={sortMode === 'level'}
                onChange={() => setSortMode('level')}
              />{' '}
              Par niveau <em>By level</em>
            </label>
          </fieldset>
        </DevFrame>

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

        <DevFrame name="CharacterSelector" uses={['usePersonalSpellbook']}>
          <CharacterSelector
            characters={characters}
            activeCharacterId={activeCharacterId}
            onSelect={setActiveCharacterId}
            onAdd={addCharacter}
            onRemove={removeCharacter}
            onRename={renameCharacter}
          />
        </DevFrame>
        {spellcastingClassesError && <p role="alert">{spellcastingClassesError}</p>}
        {profiles.map((profile, index) => (
          <DevFrame
            key={profile.id}
            name={`SpellcasterProfileForm (classe ${index + 1})`}
            uses={['usePersonalSpellbook', 'useSpellcastingClasses', 'useMultiSpellAccess']}
          >
            <SpellcasterProfileForm
              classes={spellcastingClasses}
              profile={profile}
              maxSpellLevel={perProfile[index].maxSpellLevel}
              subclassSpellGrants={perProfile[index].subclassSpellGrants}
              loading={perProfile[index].loading}
              error={perProfile[index].error}
              onChange={(next) =>
                next ? setProfileById(profile.id, next) : removeProfileById(profile.id)
              }
            />
          </DevFrame>
        ))}
        <DevFrame
          name="SpellcasterProfileForm (ajouter une classe)"
          uses={['usePersonalSpellbook', 'useSpellcastingClasses']}
        >
          <SpellcasterProfileForm
            classes={spellcastingClasses}
            profile={null}
            maxSpellLevel={null}
            subclassSpellGrants={null}
            loading={false}
            error={null}
            onChange={(next) => {
              if (next) addProfile(next)
            }}
          />
        </DevFrame>

        <DevFrame
          name="PersonalSpellbookPanel"
          uses={['usePersonalSpellbook', 'useSpellList', 'useMultiSpellAccess', 'state:selectedIndex']}
        >
          <PersonalSpellbookPanel
            spells={personalSpells}
            allSpells={spells}
            selectedIndex={selectedIndex}
            onSelectSpell={handleSelectSpell}
            onRemoveSpell={removeFromSpellbook}
            isAccessible={isAccessible}
          />
        </DevFrame>
      </details>

      <BookSpread
        mobilePage={mobilePage}
        onMobilePageChange={setMobilePage}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        left={
          <>
            {selectedIndex && detailLoading && <p>Chargement du detail du sort...</p>}
            {detailError && <p role="alert">{detailError}</p>}
            {/* La fiche reste toujours lisible, meme pour un sort hors profil ou masque de la liste. */}
            {selectedSpell && (
              <DevFrame
                name="SpellDetail"
                uses={[
                  'useSpellDetail',
                  'usePersonalSpellbook',
                  'useMultiSpellAccess',
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
          </>
        }
        right={
          <>
            {/* Sur la page elle-meme, pas dans le panneau replie : sinon un
                echec de l'API laisse une page vide sans explication. */}
            {loading && (
              <p>
                Chargement des sorts... <em>Loading spells...</em>
              </p>
            )}
            {error && <p role="alert">{error}</p>}
            {!loading && !error && (
            <DevFrame
              name="SpellList"
              uses={[
                'useSpellList',
                'state:search',
                'state:filtres',
                'state:sortMode',
                'useClassSpellIndices',
                'useSchoolSpellIndices',
                'useMultiSpellAccess',
                'state:hideOutOfProfile',
                'state:selectedIndex',
                'state:page',
                'useSpellSummaries',
              ]}
            >
              <p>
                {sortedSpells.length} / {spells.length} sorts <em>spells</em>
              </p>
              <SpellList
                spells={pagedSpells}
                onSelect={handleSelectSpell}
                isAccessible={isAccessible}
                summaries={spellSummaries}
              />
            </DevFrame>
            )}
          </>
        }
      />

      <DevFramesToggle />
    </main>
  )
}

export default App
