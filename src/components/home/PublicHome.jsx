import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PublicHome.css";

const slides = [
  {
    eyebrow: "DHC HOMECARE · DAMAK",
    title: "Home Appliance Service",
    copy: "At your doorstep in Damak, Jhapa.",
    action: "Explore our services",
  },
  {
    eyebrow: "LOCAL CARE FOR YOUR HOME",
    title: "Care for the appliances you rely on.",
    copy: "Refrigerators, washing machines, air conditioners and more—one local service hub.",
    action: "See appliance services",
  },
  {
    eyebrow: "SERVICE, MADE CLEAR",
    title: "Book a visit for your appliance.",
    copy: "Get the right diagnosis, clear updates and trusted care at your doorstep.",
    action: "Choose an appliance",
  },
];

const appliances = [
  { name: "Refrigerator", image: "/appliance_fridge.jpg", alt: "Refrigerator in a bright home kitchen" },
  { name: "Washing machine", image: "/appliance_washer.jpg", alt: "Front-loading washing machine in a laundry space" },
  { name: "Air conditioner", image: "/appliance_ac.jpg", alt: "Wall-mounted air conditioner" },
];

const team = [
  { initials: "SS", name: "Sandesh Shiwakoti", role: "CTO" },
  { initials: "DHC", name: "DHC Service Team", role: "Local appliance care" },
];

function PublicHome() {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const [teamIndex, setTeamIndex] = useState(0);
  const slide = slides[slideIndex];
  const teammate = team[teamIndex];

  useEffect(() => {
    const timer = window.setInterval(() => setSlideIndex((current) => (current + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const startRegistration = (applianceName) => navigate("/signup", { state: { applianceName } });
  const showSlide = (index) => setSlideIndex((index + slides.length) % slides.length);

  return (
    <main className="public-home">
      <header className="public-header">
        <a className="public-brand" href="#home" aria-label="DHC HomeCare home">
          <img src="/dhc-logo.png" alt="DHC HomeCare Service Hub" />
          <span>DHC HomeCare<small>Home Appliance Service · Damak</small></span>
        </a>
        <nav className="public-nav-links" aria-label="Main navigation">
          <a href="#appliances">Services</a>
          <a href="#about-dhc">About DHC</a>
          <a href="#contact-dhc">Contact</a>
        </nav>
        <div className="public-auth-actions">
          <button className="public-signin" type="button" onClick={() => navigate("/login")}>Sign in</button>
          <button className="public-signup" type="button" onClick={() => navigate("/signup")}>Sign up</button>
        </div>
      </header>

      <section className="public-hero-wrap" id="home" aria-label="DHC HomeCare introduction">
        <div className="public-hero" key={slideIndex}>
          <div className="public-hero-copy">
            <span className="public-eyebrow">{slide.eyebrow}</span>
            <h1>{slide.title}</h1>
            <p>{slide.copy}</p>
            <button type="button" onClick={() => document.getElementById("appliances")?.scrollIntoView({ behavior: "smooth" })}>
              {slide.action}<span aria-hidden="true"> →</span>
            </button>
          </div>
          <div className="public-hero-mark" aria-hidden="true"><img src="/dhc-logo.png" alt="" /></div>
          <button className="hero-arrow hero-prev" type="button" aria-label="Previous slide" onClick={() => showSlide(slideIndex - 1)}>‹</button>
          <button className="hero-arrow hero-next" type="button" aria-label="Next slide" onClick={() => showSlide(slideIndex + 1)}>›</button>
        </div>
        <div className="public-slide-dots" aria-label={`Slide ${slideIndex + 1} of ${slides.length}`}>
          {slides.map((item, index) => <button key={item.title} className={index === slideIndex ? "active" : ""} type="button" aria-label={`Show slide ${index + 1}`} onClick={() => showSlide(index)} />)}
        </div>
      </section>

      <section className="public-appliances" id="appliances">
        <div className="public-section-heading">
          <div><span className="public-eyebrow">LOCAL HOME APPLIANCE CARE</span><h2>What needs a little care?</h2><p>Choose an appliance to start a service request.</p></div>
          <span className="local-pill">Damak · Jhapa</span>
        </div>
        <div className="public-appliance-grid">
          {appliances.map((appliance) => (
            <button className="public-appliance-card" key={appliance.name} type="button" onClick={() => startRegistration(appliance.name)}>
              <img src={appliance.image} alt={appliance.alt} />
              <span className="appliance-card-name">{appliance.name}</span>
              <span className="appliance-card-cta">Register to book <b aria-hidden="true">→</b></span>
            </button>
          ))}
        </div>
        <p className="public-register-note">Create a customer account before sending your first service request.</p>
      </section>

      <section className="public-about" id="about-dhc">
        <div className="about-copy">
          <span className="public-eyebrow">ABOUT DHC</span>
          <h2>Home appliance care for our community.</h2>
          <p>DHC HomeCare Service Hub helps Damak households arrange appliance service and follow every update, on mobile and on the web.</p>
          <div className="about-questions">
            <details><summary>Who are we?</summary><p>DHC HomeCare Service Hub is a local home appliance service platform based in Damak, Jhapa. We bring customers, service coordination and appliance technicians together in one place.</p></details>
            <details><summary>What do we do?</summary><p>We help households request service for home appliances, share useful visit information with the service team, and follow request updates through the mobile app or web version.</p></details>
            <details><summary>Why do we do what we do?</summary><p>When an essential appliance stops working, people need clear next steps and dependable local support. DHC aims to make arranging help simpler and keep customers informed along the way.</p></details>
          </div>
        </div>
        <div className="public-team-panel">
          <div className="team-heading"><div><span className="public-eyebrow">OUR TEAM</span><h3>People behind DHC</h3></div><span className="team-count">{teamIndex + 1} / {team.length}</span></div>
          <div className="team-carousel">
            <button type="button" className="team-arrow" aria-label="Previous team member" onClick={() => setTeamIndex((teamIndex + team.length - 1) % team.length)}>‹</button>
            <article className="team-person" key={teammate.name}>
              <div className="team-avatar" aria-label={`${teammate.name} profile photo placeholder`}>{teammate.initials}</div>
              <h4>{teammate.name}</h4><p>{teammate.role}</p>
            </article>
            <button type="button" className="team-arrow" aria-label="Next team member" onClick={() => setTeamIndex((teamIndex + 1) % team.length)}>›</button>
          </div>
          <div className="public-investor"><span>OUR INVESTOR</span><b>SS Digital</b></div>
        </div>
      </section>

      <section className="public-contact" id="contact-dhc">
        <div><span className="public-eyebrow">HERE FOR DAMAK</span><h2>Home care, at your doorstep.</h2><p>Damak-2, Jhapa, Nepal</p></div>
        <a href="tel:9815945474">Call DHC <strong>9815945474</strong></a>
      </section>
      <footer className="public-footer"><span>DHC HomeCare Service Hub · Mobile app and web version</span><span>All rights reserved to DHC. Software developed by Mr Sandesh Shiwakoti.</span></footer>
    </main>
  );
}

export default PublicHome;
