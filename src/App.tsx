import { useMemo, useState } from 'react'
import { useSpellList } from './hooks/useSpellList'
import { useClassList } from './hooks/useClassList'
import { useClassSpellIndices } from './hooks/useClassSpellIndices'
import { SpellSearch } from './components/SpellSearch'
import { SpellLevelFilter } from './components/SpellLevelFilter'
import { SpellClassFilter } from './components/SpellClassFilter'
import { SpellList } from './components/SpellList'
import './App.css'

function App() {
  const { spells, loading, error } = useSpellList()
  const { classes, error: classListError } = useClassList()
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | null>(null)
  const [classFilter, setClassFilter] = useState<string | null>(null)
  const {
    indices: classSpellIndices,
    loading: classSpellsLoading,
    error: classSpellsError,
  } = useClassSpellIndices(classFilter)

  const filteredSpells = useMemo(() => {
    const query = search.trim().toLowerCase()
    return spells.filter((spell) => {
      const matchesQuery =
        !query ||
        spell.name.toLowerCase().includes(query) ||
        spell.nameFr.toLowerCase().includes(query)
      const matchesLevel = levelFilter === null || spell.level === levelFilter
      const matchesClass = classFilter === null || (classSpellIndices?.has(spell.index) ?? false)
      return matchesQuery && matchesLevel && matchesClass
    })
  }, [spells, search, levelFilter, classFilter, classSpellIndices])

  return (
    <main id="grimoire">
      <h1>
        Grimoire des sorts <em>Spell book</em>
      </h1>

      <div className="filters">
        <SpellSearch value={search} onChange={setSearch} />
        <SpellLevelFilter value={levelFilter} onChange={setLevelFilter} />
        <SpellClassFilter classes={classes} value={classFilter} onChange={setClassFilter} />
      </div>

      {classListError && <p role="alert">{classListError}</p>}
      {classSpellsLoading && (
        <p>
          Chargement des sorts de la classe... <em>Loading class spells...</em>
        </p>
      )}
      {classSpellsError && <p role="alert">{classSpellsError}</p>}

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
          <SpellList spells={filteredSpells} />
        </>
      )}
    </main>
  )
}

export default App
