import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MarketplaceHome.css";

const appliances = [
  { name: "Refrigerator", image: "/appliance_fridge.jpg", description: "Cooling, compressor and water leaks" },
  { name: "Washing machine", image: "/appliance_washer.jpg", description: "Drum, spin cycle and drainage" },
  { name: "Air conditioner", image: "/appliance_ac.jpg", description: "Cooling, cleaning and installation" },
  { name: "Microwave oven", image: "/appliance_microwave.jpg", description: "Heating, power and door issues" },
  { name: "Dishwasher", image: "/appliance_dishwasher.jpg", description: "Wash cycle, water and drainage" },
  { name: "LED television", image: "/appliance_oven.jpg", description: "Picture, sound and power issues" },
];

const benefits = [
  { icon: "⌂", title: "Local to Damak", copy: "Home appliance support for our Jhapa community." },
  { icon: "✓", title: "Clear service updates", copy: "Follow your request from booking through completion." },
  { icon: "↗", title: "A visit that works for you", copy: "Share your appliance, issue and preferred visit details." },
];

const steps = [
  ["01", "Choose your appliance", "Tell us what needs attention and what is happening."],
  ["02", "Request a visit", "Add your address and a date that suits your household."],
  ["03", "Follow the progress", "See assignment and service updates in your account."],
  ["04", "Review the outcome", "Keep the final service details with your request history."],
];

function MarketplaceHome() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [heroAppliance, setHeroAppliance] = useState(0);
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });
  const heroFrame = useRef(null);
  const heroScenes = appliances.slice(0, 3);
  const filteredAppliances = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return appliances;
    return appliances.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(normalized));
  }, [query]);

  const bookFor = (applianceName = "") => navigate("/signup", { state: { applianceName } });
  const scrollToAppliances = () => document.getElementById("dhc-appliances")?.scrollIntoView({ behavior: "smooth" });
  const moveHeroScene = (direction) => setHeroAppliance((current) => (current + direction + heroScenes.length) % heroScenes.length);
  const tiltHeroScene = (event) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = heroFrame.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setHeroTilt({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
  };

  return (
    <main className="dhc-market-home">
      <div className="dhc-market-topline">
        <span>Home appliance care, close to home</span>
        <a href="tel:9815945474">Damak support <strong>9815945474</strong></a>
      </div>

      <header className="dhc-market-header">
        <a className="dhc-market-brand" href="#dhc-home" aria-label="DHC HomeCare home">
          <img src="/dhc-logo.png" alt="" />
          <span>DHC <b>HOMECARE</b><small>HOME APPLIANCE SERVICE · DAMAK</small></span>
        </a>
        <nav className="dhc-market-nav" aria-label="Main navigation">
          <a href="#dhc-appliances">Appliances</a>
          <a href="#dhc-how-it-works">How it works</a>
          <a href="#dhc-about">About DHC</a>
          <a href="#dhc-contact">Contact</a>
        </nav>
        <div className="dhc-market-auth">
          <button className="dhc-market-login" type="button" onClick={() => navigate("/login")}>Log in</button>
          <button className="dhc-market-join" type="button" onClick={() => navigate("/signup")}>Join DHC <span aria-hidden="true">→</span></button>
        </div>
      </header>

      <section className="dhc-market-hero" id="dhc-home">
        <div className="dhc-market-hero-copy">
          <div className="dhc-market-kicker"><span /> YOUR LOCAL SERVICE HUB · DAMAK, JHAPA</div>
          <h1>Appliance Trouble</h1>
          <p className="dhc-market-hero-lead">Home appliance service, right at your doorstep.<br />Trusted local care in Damak, Jhapa.</p>
          <p className="dhc-market-hero-detail">Book a visit and follow every service update from your account.</p>
          <div className="dhc-market-hero-actions">
            <button className="dhc-market-join" type="button" onClick={() => bookFor()}>Book a service <span aria-hidden="true">→</span></button>
            <button className="dhc-market-text-action" type="button" onClick={scrollToAppliances}>Explore appliances <span aria-hidden="true">↓</span></button>
          </div>
          <div className="dhc-market-local-note"><span className="dhc-market-pin">⌖</span><span><b>Serving our local community</b><small>Damak-2, Jhapa, Nepal</small></span></div>
        </div>
        <div className="dhc-market-hero-art">
          <div className="dhc-market-scene" ref={heroFrame} onPointerMove={tiltHeroScene} onPointerLeave={() => setHeroTilt({ x: 0, y: 0 })}>
            <div className="dhc-market-photo-frame" style={{ "--scene-tilt-x": `${heroTilt.y * -5}deg`, "--scene-tilt-y": `${heroTilt.x * 7}deg` }}>
              <img key={heroScenes[heroAppliance].name} src={heroScenes[heroAppliance].image} alt={`${heroScenes[heroAppliance].name} home service scene`} />
              <span className="dhc-market-scene-vignette" />
              <span className="dhc-market-scene-focus" />
              <span className="dhc-market-live"><i /> DHC SERVICE IN ACTION</span>
              <span className="dhc-market-scene-caption"><small>HOME APPLIANCE CARE</small><b>{heroScenes[heroAppliance].name}</b></span>
            </div>
            <button className="dhc-market-scene-arrow dhc-market-scene-prev" type="button" aria-label="Show previous appliance" onClick={() => moveHeroScene(-1)}>‹</button>
            <button className="dhc-market-scene-arrow dhc-market-scene-next" type="button" aria-label="Show next appliance" onClick={() => moveHeroScene(1)}>›</button>
            <div className="dhc-market-scene-dots" aria-label="Choose an appliance scene">
              {heroScenes.map((scene, index) => <button key={scene.name} type="button" aria-label={`Show ${scene.name}`} aria-pressed={index === heroAppliance} onClick={() => setHeroAppliance(index)} />)}
            </div>
          </div>
          <div className="dhc-market-photo-chip"><span className="dhc-market-chip-icon">✓</span><span><b>Care at your doorstep</b><small>Service for the appliances you rely on</small></span></div>
          <div className="dhc-market-orbit dhc-market-orbit-one" />
          <div className="dhc-market-orbit dhc-market-orbit-two" />
        </div>
      </section>

      <section className="dhc-market-trust" aria-label="DHC service benefits">
        {benefits.map((item) => <article key={item.title}><span className="dhc-market-benefit-icon">{item.icon}</span><div><b>{item.title}</b><small>{item.copy}</small></div></article>)}
      </section>

      <section className="dhc-market-appliances" id="dhc-appliances">
        <div className="dhc-market-section-heading">
          <div><span className="dhc-market-kicker">START WITH YOUR APPLIANCE</span><h2>What needs a little care?</h2><p>Choose an appliance to see the right service path.</p></div>
          <label className="dhc-market-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search appliances" aria-label="Search appliances" /></label>
        </div>
        <div className="dhc-market-appliance-grid">
          {filteredAppliances.map((item, index) => (
            <button key={item.name} className="dhc-market-appliance-card" type="button" onClick={() => bookFor(item.name)}>
              <span className="dhc-market-card-image"><img src={item.image} alt={item.name} loading={index > 2 ? "lazy" : "eager"} /><span className="dhc-market-card-arrow" aria-hidden="true">↗</span></span>
              <span className="dhc-market-card-copy"><b>{item.name}</b><small>{item.description}</small><strong>Book service <span aria-hidden="true">→</span></strong></span>
            </button>
          ))}
          {filteredAppliances.length === 0 && <div className="dhc-market-no-results">No matching appliance found. Call DHC at <a href="tel:9815945474">9815945474</a> and we’ll help.</div>}
        </div>
        <div className="dhc-market-more"><span>Need help choosing?</span><a href="tel:9815945474">Talk to the DHC team <b aria-hidden="true">→</b></a></div>
      </section>

      <section className="dhc-market-process" id="dhc-how-it-works">
        <div className="dhc-market-process-heading"><span className="dhc-market-kicker">SIMPLE FROM THE START</span><h2>Service, without the guesswork.</h2><p>Book, stay informed and find your service history in one place.</p></div>
        <div className="dhc-market-steps">{steps.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <button className="dhc-market-join" type="button" onClick={() => bookFor()}>Get started <span aria-hidden="true">→</span></button>
      </section>

      <section className="dhc-market-about" id="dhc-about">
        <div className="dhc-market-about-mark"><img src="/dhc-logo.png" alt="DHC HomeCare" /></div>
        <div><span className="dhc-market-kicker">HOME CARE, ROOTED IN DAMAK</span><h2>Local service for the things that make a house feel like home.</h2><p>DHC HomeCare Service Hub brings customers, service coordination and technicians together so arranging appliance care is easier to understand and easier to follow.</p><a href="tel:9815945474">Questions? Call 9815945474 <b aria-hidden="true">→</b></a></div>
      </section>

      <footer className="dhc-market-footer" id="dhc-contact">
        <a className="dhc-market-brand" href="#dhc-home"><img src="/dhc-logo.png" alt="" /><span>DHC <b>HOMECARE</b><small>HOME APPLIANCE SERVICE · DAMAK</small></span></a>
        <p>Damak-2, Jhapa, Nepal<br /><a href="tel:9815945474">9815945474</a></p>
        <div className="dhc-market-footer-links"><a href="#dhc-appliances">Services</a><button type="button" onClick={() => navigate("/login")}>Log in</button><button type="button" onClick={() => navigate("/signup")}>Join DHC</button></div>
        <small className="dhc-market-copyright">All rights reserved to DHC · Software developed by Mr Sandesh Shiwakoti</small>
      </footer>
    </main>
  );
}

export default MarketplaceHome;
