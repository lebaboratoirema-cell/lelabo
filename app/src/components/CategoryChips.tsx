interface Chip {
  label: string
  href: string
  slug: string | null  // null = "Tous" chip
}

interface Props {
  chips: Chip[]
  activeSlug: string | null  // null = "Tous" is active
  allHref: string
}

export default function CategoryChips({ chips, activeSlug, allHref }: Props) {
  return (
    <div className="chips">
      <a
        href={allHref}
        className={`chip${activeSlug === null ? ' active' : ''}`}
      >
        Tous
      </a>
      {chips.map((chip) => (
        <a
          key={chip.slug}
          href={chip.href}
          className={`chip${activeSlug === chip.slug ? ' active' : ''}`}
        >
          {chip.label}
        </a>
      ))}
    </div>
  )
}
