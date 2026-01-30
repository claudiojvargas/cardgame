import { CHESTS } from "../../game/data/chests.catalog";
import { useGame } from "../hooks/useGame";

export function ChestsScreen() {
  const { profile } = useGame();
  const shopItems = CHESTS.slice(0, 6).map((chest, index) => ({
    id: chest.type,
    name: chest.name,
    priceGold: chest.priceGold,
    frameSrc: `/assets/shop/frames/book-frame-${index + 1}.png`,
    coverSrc: `/assets/shop/books/book-${index + 1}.png`,
  }));
  const featuredItem = {
    id: "featured",
    name: "Tomo Mítico",
    priceDiamonds: 500,
    frameSrc: "/assets/shop/frames/featured-frame.png",
    coverSrc: "/assets/shop/books/featured-book.png",
  };
  const shopAssets = {
    background: "/assets/shop/backgrounds/store-bg.png",
    topBar: "/assets/shop/ui/top-bar.png",
    backIcon: "/assets/shop/icons/back-arrow.png",
    coinIcon: "/assets/shop/icons/coin.png",
    gemIcon: "/assets/shop/icons/gem.png",
    sectionDivider: "/assets/shop/ui/section-divider.png",
    tabFrame: "/assets/shop/ui/tab-frame.png",
    openButton: "/assets/shop/ui/open-button.png",
    cardPlate: "/assets/shop/ui/card-plate.png",
  };
  const tabs = ["All", "Region", "Rarity"];

  return (
    <div
      className="shop-screen"
      style={{
        backgroundImage: `url('${shopAssets.background}')`,
      }}
    >
      <div className="shop-top-bar" style={{ backgroundImage: `url('${shopAssets.topBar}')` }}>
        <button className="shop-back" type="button">
          <span
            className="shop-icon"
            style={{ backgroundImage: `url('${shopAssets.backIcon}')` }}
            aria-hidden
          />
          <span className="shop-back-label">Voltar</span>
        </button>
        <h1 className="shop-title">Tomo Mítico</h1>
        <div className="shop-currency">
          <div className="shop-currency-item">
            <span
              className="shop-icon"
              style={{ backgroundImage: `url('${shopAssets.coinIcon}')` }}
              aria-hidden
            />
            <span>{profile.currencies.gold}</span>
          </div>
          <div className="shop-currency-item">
            <span
              className="shop-icon"
              style={{ backgroundImage: `url('${shopAssets.gemIcon}')` }}
              aria-hidden
            />
            <span>{profile.currencies.diamonds}</span>
          </div>
        </div>
      </div>

      <section className="shop-section">
        <div
          className="shop-section-header"
          style={{ backgroundImage: `url('${shopAssets.sectionDivider}')` }}
        >
          <h2>Grimórios</h2>
        </div>
        <div className="shop-tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              className="shop-tab"
              style={{ backgroundImage: `url('${shopAssets.tabFrame}')` }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="shop-content">
          <div className="shop-grid">
            {shopItems.map(item => (
              <div key={item.id} className="shop-card">
                <div
                  className="shop-card-frame"
                  style={{ backgroundImage: `url('${item.frameSrc}')` }}
                >
                  <div
                    className="shop-card-cover"
                    style={{ backgroundImage: `url('${item.coverSrc}')` }}
                  />
                </div>
                <div
                  className="shop-card-footer"
                  style={{ backgroundImage: `url('${shopAssets.cardPlate}')` }}
                >
                  <span
                    className="shop-icon"
                    style={{ backgroundImage: `url('${shopAssets.coinIcon}')` }}
                    aria-hidden
                  />
                  <span>{item.priceGold}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="shop-feature">
            <div
              className="shop-feature-frame"
              style={{ backgroundImage: `url('${featuredItem.frameSrc}')` }}
            >
              <div
                className="shop-feature-cover"
                style={{ backgroundImage: `url('${featuredItem.coverSrc}')` }}
              />
            </div>
            <div className="shop-open-panel">
              <button
                type="button"
                className="shop-open-button"
                style={{ backgroundImage: `url('${shopAssets.openButton}')` }}
              >
                Abrir
              </button>
              <div className="shop-open-price">
                <span
                  className="shop-icon"
                  style={{ backgroundImage: `url('${shopAssets.gemIcon}')` }}
                  aria-hidden
                />
                <span>{featuredItem.priceDiamonds}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
