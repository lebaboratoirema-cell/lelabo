import type { CategoryFaqItem } from '@/types/database'

interface Props {
  items: CategoryFaqItem[]
}

export default function CategoryFaq({ items }: Props) {
  if (!items || items.length === 0) return null

  return (
    <section className="faq-block">
      <div className="wrap">
        <h2>Questions fréquentes</h2>
        {items.map((item, i) => (
          <details key={i}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
