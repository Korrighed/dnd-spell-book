import { useMemo, useState } from 'react'
import { useSpellList } from './hooks/useSpellList'
import { SpellSearch } from './components/SpellSearch'
import { SpellList } from './components/SpellList'
import './App.css'

function App() {
  const { spells, loading, error } = useSpellList()
  const [search, setSearch] = useState('')

  const filteredSpells = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return spells
    return spells.filter(
      (spell) =>
        spell.name.toLowerCase().includes(query) ||
        spell.nameFr.toLowerCase().includes(query),
    )
  }, [spells, search])

  return (
    <main id="grimoire">
      <h1>Grimoire des sorts</h1>

      <SpellSearch value={search} onChange={setSearch} />

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
