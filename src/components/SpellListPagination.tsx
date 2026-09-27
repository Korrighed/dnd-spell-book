interface SpellListPaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function SpellListPagination({ page, totalPages, onChange }: SpellListPaginationProps) {
  return (
    <div className="spell-list-pagination">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 0}>
        Precedent <em>Previous</em>
      </button>
      <span>
        Page {page + 1} / {totalPages}
      </span>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1}>
        Suivant <em>Next</em>
      </button>
    </div>
  )
}
