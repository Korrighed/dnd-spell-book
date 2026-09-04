import { useMemo, useState } from 'react'
import { useSpellList } from './hooks/useSpellList'
import { SpellSearch } from './components/SpellSearch'
import { SpellLevelFilter } from './components/SpellLevelFilter'
import { SpellList } from './components/SpellList'
import './App.css'

function App() {
  const { spells, loading, error } = useSpellList()
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | null>(null)

  const filteredSpells = useMemo(() => {
    const query = search.trim().toLowerCase()
    return spells.filter((spell) => {
      const matchesQuery =
        !query ||
        spell.name.toLowerCase().includes(query) ||
        spell.nameFr.toLowerCase().includes(query)
      const matchesLevel = levelFilter === null || spell.level === levelFilter
      return matchesQuery && matchesLevel
    })
  }, [spells, search, levelFilter])

  return (
    <main id="grimoire">
      <h1>Grimoire des sorts</h1>

      <div className="filters">
        <SpellSearch value={search} onChange={setSearch} />
        <SpellLevelFilter value={levelFilter} onChange={setLevelFilter} />
      </div>

      {loading && <p>Chargement des sorts...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <p>
            {filteredSpells.length} / {spells.length} sorts
          </p>
          <SpellList spells={filteredSpells} />
        </>
      )}
    </main>
  )
}

export default App
