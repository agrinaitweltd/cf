import { useState } from 'react'
import { useIntersection } from '../hooks/useIntersection'
import PageBanner from '../components/PageBanner'
import CTABanner from '../components/CTABanner'
import styles from './Projects.module.css'

const projects = [
  { id: 1, img: '/project1.png', title: 'Full Kitchen Renovation',      category: 'Renovations' },
  { id: 2, img: '/project2.png', title: 'Living Room Makeover',  category: 'Renovations' },
  { id: 3, img: '/project3.png', title: 'Flooring Renovation',        category: 'Painting & Decorating' },
  { id: 4, img: '/project4.png', title: 'House Removals',     category: 'Removals' },
  { id: 5, img: '/project5.png', title: 'Bathroom Plumbing Upgrade',   category: 'Plumbing' },
  { id: 6, img: '/project6.png', title: 'Full Electrical Rewire',       category: 'Electrics' },
  { id: 7, img: '/project7.png', title: 'Painting for New Bedroom',    category: 'Painting & Decorating' },
  { id: 8, img: '/project8.png', title: 'Tilling Exchange', category: 'Renovations' },
  { id: 9, img: '/project9.png', title: 'Custom-Built Home Office',     category: 'Painting & Decorating' },
]

const categories = ['All', ...new Set(projects.map(p => p.category))]

function Projects() {
  const [active, setActive] = useState('All')
  const [gridRef, gridVisible] = useIntersection()

  const filtered = active === 'All' ? projects : projects.filter(p => p.category === active)

  return (
    <>
      <PageBanner
        title="Our Projects"
        subtitle="A selection of recent work carried out by our specialist teams across London."
        image="/projects-banner.png"
      />

      <section className="section">
        <div className="container">
          {/* Filter tabs */}
          <div className={styles.filters} role="tablist" aria-label="Filter projects by category">
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${active === cat ? styles.filterActive : ''}`}
                onClick={() => setActive(cat)}
                role="tab"
                aria-selected={active === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div ref={gridRef} className={styles.grid} role="list">
            {filtered.map((project, i) => (
              <article
                key={project.id}
                className={`reveal ${gridVisible ? 'visible' : ''} d${(i % 6) + 1} ${styles.card}`}
                role="listitem"
              >
                <div
                  className={styles.cardImage}
                  style={{ backgroundImage: `url(${project.img})` }}
                  role="img"
                  aria-label={project.title}
                />
                <div className={styles.cardOverlay}>
                  <span className={styles.cardCat}>{project.category}</span>
                  <h3 className={styles.cardTitle}>{project.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        heading="Inspired by Our Work? Let's Build Yours."
        subtext="Every project we deliver is crafted to the same exceptional standard. Yours will be too."
      />
    </>
  )
}

export default Projects
