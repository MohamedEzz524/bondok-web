/* Skeleton shown while MenuBrowser hydrates - reserves the full layout
   (search, category bar, sidebar, grid) so nothing collapses or shifts. */
export default function MenuSkeleton() {
  return (
    <>
      <div className="menu-toolbar">
        <div className="sk sk-search" />
      </div>
      <nav className="cat-nav" aria-hidden="true">
        <div className="cat-nav-inner">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="sk sk-chip" />
          ))}
        </div>
      </nav>
      <div className="menu-layout">
        <aside className="filter-sidebar" aria-hidden="true">
          <span className="sk sk-line" style={{ width: '40%' }} />
          {Array.from({ length: 3 }, (_, g) => (
            <div key={g} className="fgroup">
              <span className="sk sk-line" style={{ width: '30%' }} />
              <div className="fchips" style={{ marginTop: 8 }}>
                <span className="sk sk-chip" />
                <span className="sk sk-chip" />
                <span className="sk sk-chip" />
              </div>
            </div>
          ))}
        </aside>
        <div className="menu-content">
          <div className="menu-section">
            <span className="sk sk-line" style={{ width: 220, height: 26 }} />
            <div className="menu-grid" style={{ marginTop: 20 }}>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="product-card" aria-hidden="true">
                  <div className="sk sk-img" />
                  <div className="product-body">
                    <span className="sk sk-line" style={{ width: '70%' }} />
                    <span className="sk sk-btn" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
