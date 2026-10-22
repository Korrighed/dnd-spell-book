import { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react'
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
import { SpellList } from './components/SpellList'
import { SpellDetail } from './components/SpellDetail'
import { Bookmarks } from './components/Bookmarks'
import { FiltersView } from './components/FiltersView'
import { CharacterView } from './components/CharacterView'
import { SpellbookView } from './components/SpellbookView'
import { HelpView } from './components/HelpView'
import { BookSpread } from './components/BookSpread'
import { MOBILE_QUERY, useMediaQuery } from './hooks/useMediaQuery'
import type { BookPage } from './hooks/useHorizontalSwipe'
import { matchesSearch } from './utils/text'
import { BROWSER_LANGUAGE, t } from './utils/browserLanguage'
import type { LanguageMode } from './types/language'
import { bookmarkButtonId, bookmarkViewId, type BookmarkId } from './utils/bookmarks'
import { DEFAULT_SORT_MODE, sortSpells, type SortMode } from './utils/spellSort'
import './App.css'
import './App.mobile.css'

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
  // Vue ouverte par un marque-page, une seule a la fois, `null` : aucune.
  const [openView, setOpenView] = useState<BookmarkId | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null)
  // Mobile : page visible (liste par defaut). Bascule auto vers la fiche a la
  // premiere selection d'un sort seulement.
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
  const [language, setLanguage] = useState<LanguageMode>(BROWSER_LANGUAGE)
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

  const sortedSpells = useMemo(
    () => sortSpells(filteredSpells, sortMode),
    [filteredSpells, sortMode],
  )

  // Retour en page 1 quand le contenu ou l'ordre de la liste change. Cle sur
  // les index, pas sur la reference du tableau (recalcule sans changer).
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
  // Page hors bornes apres un changement de spellsPerPage (desktop / mobile).
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

  // Fermeture d'une vue : le focus revient au marque-page qui l'a ouverte.
  const closeView = useCallback(() => {
    if (openView === null) return
    setOpenView(null)
    document.getElementById(bookmarkButtonId(openView))?.focus()
  }, [openView])

  // Clic sur le marque-page actif : referme la vue.
  const handleToggleView = (id: BookmarkId) => {
    if (id === openView) closeView()
    else setOpenView(id)
  }

  // Choix d'un sort depuis le grimoire : ferme la vue et, en mobile, affiche la fiche.
  const handleSelectFromSpellbook = (index: string) => {
    handleSelectSpell(index)
    closeView()
    if (window.matchMedia(MOBILE_QUERY).matches) setMobilePage('left')
  }

  const activeCharacterName = characters.find((character) => character.id === activeCharacterId)?.name ?? ''

  return (
    <>
      <header className="site-header">
        <h1>{t('Grimoire de sorts', 'Spell grimoire')}</h1>
        <button
          id={bookmarkButtonId('help')}
          type="button"
          className="help-button"
          aria-label={t('Aide et mentions légales', 'Help and legal notice')}
          title={t('Aide et mentions légales', 'Help and legal notice')}
          aria-expanded={openView === 'help'}
          aria-controls={bookmarkViewId('help')}
          onClick={() => handleToggleView('help')}
        >
          <span
            className="help-button-icon"
            aria-hidden="true"
            style={
              { '--icon': `url(${import.meta.env.BASE_URL}icons/circle-help.svg)` } as CSSProperties
            }
          />
        </button>
      </header>

      {/* data-mobile-page : lu par App.mobile.css (barre masquee sur la fiche). */}
      <main id="grimoire" data-mobile-page={mobilePage}>
        {/* Barre d'outils hors de BookSpread : la recherche resterait sinon
            demontee pendant le tournage de page. Recherche inerte sous une
            vue ouverte, barre entiere inerte sous l'aide. */}
        <div className="toolbar" inert={openView === 'help'}>
          <div className="search-bar" inert={openView !== null}>
            {profiles.length > 0 && (
              <button
                type="button"
                className="profile-toggle"
                aria-pressed={hideOutOfProfile}
                aria-label={t('Masquer les sorts hors profil', 'Hide out-of-profile spells')}
                title={t('Masquer les sorts hors profil', 'Hide out-of-profile spells')}
                onClick={() => setHideOutOfProfile((hidden) => !hidden)}
              >
                <span
                  className="profile-toggle-icon"
                  aria-hidden="true"
                  style={
                    {
                      '--icon': `url(${import.meta.env.BASE_URL}icons/${
                        hideOutOfProfile ? 'eye-off.svg' : 'eye.svg'
                      })`,
                    } as CSSProperties
                  }
                />
              </button>
            )}

            <SpellSearch value={search} onChange={setSearch} />
          </div>

          <Bookmarks openView={openView} onToggle={handleToggleView} />
        </div>

        {/* Vues soeurs de BookSpread, jamais dedans (tournage de page, swipe). */}
        <div className="book-zone">

          <div inert={openView !== null}>
            <BookSpread
              mobilePage={mobilePage}
              onMobilePageChange={setMobilePage}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              left={
                <>
                  {selectedIndex && detailLoading && <p>{t('Chargement du détail du sort…', 'Loading spell details…')}</p>}
                  {detailError && <p role="alert">{detailError}</p>}
                  {selectedSpell && (
                    <SpellDetail
                      detail={selectedSpell}
                      language={language}
                      onLanguageChange={setLanguage}
                      inSpellbook={personalIndices.has(selectedSpell.mechanics.index)}
                      onToggleSpellbook={toggleSpellbook}
                      outOfProfile={selectedOutOfProfile}
                    />
                  )}
                </>
              }
              right={
                <>
                  {loading && (
                    <p>
                      {t('Chargement des sorts…', 'Loading spells…')}
                    </p>
                  )}
                  {error && <p role="alert">{error}</p>}
                  {classSpellsLoading && (
                    <p>
                      {t('Chargement des sorts de la classe…', 'Loading class spells…')}
                    </p>
                  )}
                  {classSpellsError && <p role="alert">{classSpellsError}</p>}
                  {schoolSpellsLoading && (
                    <p>
                      {t("Chargement des sorts de l'école…", 'Loading school spells…')}
                    </p>
                  )}
                  {schoolSpellsError && <p role="alert">{schoolSpellsError}</p>}
                  {!loading && !error && (
                    <>
                      <p>
                        {sortedSpells.length} / {spells.length} {t('sorts', 'spells')}
                        {' · '}
                        {t('page', 'page')} {page + 1} / {totalPages}
                      </p>
                      <SpellList
                        spells={pagedSpells}
                        onSelect={handleSelectSpell}
                        isAccessible={isAccessible}
                        summaries={spellSummaries}
                      />
                    </>
                  )}
                </>
              }
            />
          </div>

          <FiltersView
            open={openView === 'filters'}
            onClose={closeView}
            levelFilter={levelFilter}
            onLevelChange={setLevelFilter}
            classes={classes}
            classFilter={classFilter}
            onClassChange={setClassFilter}
            schools={schools}
            schoolFilter={schoolFilter}
            onSchoolChange={setSchoolFilter}
            sortMode={sortMode}
            onSortChange={setSortMode}
            classListError={classListError}
            schoolListError={schoolListError}
          />
          <CharacterView
            open={openView === 'character'}
            onClose={closeView}
            characters={characters}
            activeCharacterId={activeCharacterId}
            onSelectCharacter={setActiveCharacterId}
            onAddCharacter={addCharacter}
            onRemoveCharacter={removeCharacter}
            onRenameCharacter={renameCharacter}
            spellcastingClasses={spellcastingClasses}
            spellcastingClassesError={spellcastingClassesError}
            profiles={profiles}
            perProfile={perProfile}
            onSetProfile={setProfileById}
            onAddProfile={addProfile}
            onRemoveProfile={removeProfileById}
          />
          <SpellbookView
            open={openView === 'spellbook'}
            onClose={closeView}
            characterName={activeCharacterName}
            spells={personalSpells}
            allSpells={spells}
            selectedIndex={selectedIndex}
            onSelectSpell={handleSelectFromSpellbook}
            onRemoveSpell={removeFromSpellbook}
            isAccessible={isAccessible}
          />
        </div>

        <HelpView open={openView === 'help'} onClose={closeView} />
      </main>

      <footer className="site-footer">
        <p>
          {t('Données : SRD 5e via ', 'Data: 5e SRD via ')}
          <a href="https://www.dnd5eapi.co/" target="_blank" rel="noreferrer">
            dnd5eapi.co
          </a>
          {t(
            ', projet communautaire non affilié à Wizards of the Coast.',
            ', a community project not affiliated with Wizards of the Coast.',
          )}
        </p>
      </footer>
    </>
  )
}

export default App
