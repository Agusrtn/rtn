import type { VideoCategory } from '../data/videos'
import { categoryLabels, categoryOrder } from '../data/videos'

export type SortOption = 'recientes' | 'antiguos' | 'az'

interface FiltersProps {
  sort: SortOption
  onSortChange: (s: SortOption) => void
}

const sortLabels: Record<SortOption, string> = {
  recientes: 'Más recientes',
  antiguos: 'Más antiguos',
  az: 'A — Z',
}

export function Filters({ sort, onSortChange }: FiltersProps) {
  return (
    <div className="filters-bar">
      <label className="pill">
        <span>Todas las playlists</span>
        <Chevron />
      </label>
      <label className="pill">
        <select
          className="pill__select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          aria-label="Ordenar"
        >
          {(Object.keys(sortLabels) as SortOption[]).map((key) => (
            <option key={key} value={key}>
              {sortLabels[key]}
            </option>
          ))}
        </select>
        <span>{sortLabels[sort]}</span>
        <Chevron />
      </label>
      <span className="pill pill--muted">Fecha</span>
      <button type="button" className="filters-bar__catalog">
        Catálogo
      </button>
    </div>
  )
}

export function CategoryPills({
  category,
  onCategoryChange,
}: {
  category: VideoCategory | 'todos'
  onCategoryChange: (c: VideoCategory | 'todos') => void
}) {
  const cats: (VideoCategory | 'todos')[] = ['todos', ...categoryOrder]
  return (
    <div className="category-pills">
      {cats.map((cat) => (
        <button
          key={cat}
          type="button"
          className={category === cat ? 'pill pill--active' : 'pill'}
          onClick={() => onCategoryChange(cat)}
        >
          {cat === 'todos' ? 'Todos' : categoryLabels[cat]}
        </button>
      ))}
    </div>
  )
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
