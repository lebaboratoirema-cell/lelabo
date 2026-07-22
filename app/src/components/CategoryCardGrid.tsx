interface CardItem {
  href: string
  img: string
  title: string
  desc?: string
}

interface Props {
  items: CardItem[]
}

export default function CategoryCardGrid({ items }: Props) {
  return (
    <div className="cat-grid">
      {items.map((item) => (
        <a className="cat-card reveal" href={item.href} key={item.href}>
          <img src={item.img} alt={item.title} />
          <div className="cc">
            <h3>{item.title}</h3>
            {item.desc && <p>{item.desc}</p>}
            <span className="go">Voir →</span>
          </div>
        </a>
      ))}
    </div>
  )
}
