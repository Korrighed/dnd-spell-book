import { useMemo, useState } from 'react'
import { useSpellList } from './hooks/useSpellList'
import { useClassList } from './hooks/useClassList'
import { useClassSpellIndices } from './hooks/useClassSpellIndices'
import { useSchoolList } from './hooks/useSchoolList'
import { useSchoolSpellIndices } from './hooks/useSchoolSpellIndices'
import { useSpellDetail } from './hooks/useSpellDetail'
import { SpellSearch } from './components/SpellSearch'
import { SpellLevelFilter } from './components/SpellLevelFilter'
import { SpellClassFilter } from './components/SpellClassFilter'
import { SpellSchoolFilter } from './components/SpellSchoolFilter'
import { SpellList } from './components/SpellList'
import { SpellDetail } from './components/SpellDetail'
import { normalizeForSearch } from './utils/text'
import './App.css'

function App() {
  const { spells, loading, error } = useSpellList()
  const { classes, error: classListError } = useClassList()
  const { schools, error: schoolListError } = useSchoolList()
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | null>(null)
  const [classFilter, setClassFilter] = useState<string | null>(null)
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null)
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
    const query = normalizeForSearch(search.trim())
    return spells.filter((spell) => {
      const matchesQuery =
        !query ||
        normalizeForSearch(spell.name).includes(query) ||
        normalizeForSearch(spell.nameFr).includes(query)
      const matchesLevel = levelFilter === null || spell.level === levelFilter
      const matchesClass = classFilter === null || (classSpellIndices?.has(spell.index) ?? false)
      const matchesSchool =
        schoolFilter === null || (schoolSpellIndices?.has(spell.index) ?? false)
      return matchesQuery && matchesLevel && matchesClass && matchesSchool
    })
  }, [
    spells,
    search,
    levelFilter,
    classFilter,
    classSpellIndices,
    schoolFilter,
    schoolSpellIndices,
  ])

  return (
    <main id="grimoire">
      <h1>
        Grimoire des sorts <em>Spell book</em>
      </h1>

      <div className="filters">
        <SpellSearch value={search} onChange={setSearch} />
        <SpellLevelFilter value={levelFilter} onChange={setLevelFilter} />
        <SpellClassFilter classes={classes} value={classFilter} onChange={setClassFilter} />
        <SpellSchoolFilter schools={schools} value={schoolFilter} onChange={setSchoolFilter} />
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

      {!loading && !error && (
        <>
          <p>
            {filteredSpells.length} / {spells.length} sorts <em>spells</em>
          </p>
          <SpellList spells={filteredSpells} onSelect={setSelectedIndex} />
        </>
      )}

      {selectedIndex && detailLoading && <p>Chargement du detail du sort...</p>}
      {detailError && <p role="alert">{detailError}</p>}
      {selectedSpell && <SpellDetail detail={selectedSpell} />}
    </main>
  )
}

export default App
