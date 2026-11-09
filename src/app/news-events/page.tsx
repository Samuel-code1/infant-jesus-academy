
"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import "./news-events.css";

type NewsIconName =
  | "arrowUpRight"
  | "arrowUp"
  | "search"
  | "mapPin"
  | "mail"
  | "clock"
  | "facebook"
  | "whatsapp"
  | "instagram"
  | "youtube";

function AcademyLogo() {
  return (
    <svg
      viewBox="0 0 64 72"
      width="44"
      height="49"
      role="img"
      aria-label="Infant Jesus Academy crest"
      xmlns="http://www.w3.org/2000/svg"
      className="academy-logo"
    >
      <path
        d="M32 3 57 12V33C57 49 46 61 32 68 18 61 7 49 7 33V12Z"
        fill="#172c43"
        stroke="#b18d52"
        strokeWidth="2"
      />
      <path
        d="M32 8 52 15V33C52 46 43 56 32 62 21 56 12 46 12 33V15Z"
        fill="none"
        stroke="#e2c995"
        strokeWidth="0.8"
      />
      <path
        d="M18 25Q25 22 32 28Q39 22 46 25V39Q39 36 32 42Q25 36 18 39Z"
        fill="#fffefa"
        stroke="#e2c995"
        strokeWidth="1"
      />
      <path d="M32 28V42" fill="none" stroke="#b18d52" strokeWidth="1.4" />
      <text
        x="32"
        y="52"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#e2c995"
      >
        IJA
      </text>
    </svg>
  );
}

function NewsIcon({ name }: { name: NewsIconName }) {
  const paths: Record<NewsIconName, ReactNode> = {
    arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
    arrowUp: <path d="M12 20V4m-7 5 7-5 7 5" />,
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    mapPin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </>
    ),
    facebook: (
      <path
        d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.3v2.1H7.5V13h2.7v8h3.2Z"
        fill="currentColor"
        stroke="none"
      />
    ),
    whatsapp: (
      <>
        <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4.1Z" />
        <path d="M8.5 8.3c.2-.5.5-.5.8-.5h.5l1 2.2c.1.3 0 .5-.2.7l-.6.7c.7 1.3 1.7 2.3 3 2.9l.7-.8c.2-.2.4-.3.7-.2l2.1 1c.3.1.4.3.4.6-.1 1-.9 1.8-1.9 1.9-1.6.1-3.6-1-5.3-2.6-1.6-1.6-2.6-3.4-2.4-4.8.1-.5.5-.9 1.2-1.1Z" />
      </>
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle
          cx="17.5"
          cy="6.5"
          r=".75"
          fill="currentColor"
          stroke="none"
        />
      </>
    ),
    youtube: (
      <>
        <path d="M21 8.2a2.8 2.8 0 0 0-2-2C17.3 5.7 12 5.7 12 5.7s-5.3 0-7 .5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.5 12a29 29 0 0 0 .5 3.8 2.8 2.8 0 0 0 2 2c1.7.5 7 .5 7 .5s5.3 0 7-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 21.5 12a29 29 0 0 0-.5-3.8Z" />
        <path
          d="m10 15 5-3-5-3v6Z"
          fill="currentColor"
          stroke="none"
        />
      </>
    ),
  };

  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}

type Story = {
  id: number;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  featured?: boolean;
};

const stories: Story[] = [
  {
    id: 1,
    category: "School Life",
    date: "Featured story",
    title: "Every day is an opportunity to learn and grow",
    excerpt:
      "Discover how classroom learning, creativity, friendship, and curiosity can shape a meaningful school experience.",
    image: "/images/classroom.jpg",
    featured: true,
  },
  {
    id: 2,
    category: "Academics",
    date: "School update",
    title: "Building strong foundations for lifelong learning",
    excerpt:
      "Explore the importance of developing literacy, numeracy, critical thinking, and confidence at every stage of learning.",
    image: "/images/learning.jpg",
  },
  {
    id: 3,
    category: "Events",
    date: "Event spotlight",
    title: "Making school memories through shared experiences",
    excerpt:
      "From school gatherings to creative activities, shared experiences help learners build friendships and a sense of belonging.",
    image: "/images/activities-sports.jpg",
  },
  {
    id: 4,
    category: "School Life",
    date: "Student life",
    title: "Learning beyond the classroom",
    excerpt:
      "Practical activities, teamwork, and discovery can help students connect classroom lessons with the world around them.",
    image: "/images/kids-playground.jpg",
  },
  {
    id: 5,
    category: "Announcements",
    date: "Notice board",
    title: "Stay connected with school information",
    excerpt:
      "Use this space for verified school notices, term updates, admission information, and important reminders for families.",
    image: "/images/parents.jpg",
  },
  {
    id: 6,
    category: "Academics",
    date: "Learning spotlight",
    title: "Encouraging curiosity, creativity, and confidence",
    excerpt:
      "A supportive learning environment gives children room to ask questions, express ideas, and develop their abilities.",
    image: "/images/creative-learning.jpg",
  },
];

const heroSlides = [
  { title: "Sports Activities", image: "/images/activities-sports.jpg" },
  { title: "Creative Learning", image: "/images/creative-learning.jpg" },
  { title: "School Community", image: "/images/teamwork.jpg" },
  { title: "Library Discovery", image: "/images/library.jpg" },
  { title: "Nursery Learning", image: "/images/nursery-student.jpg" },
  { title: "Campus Life", image: "/images/kids-playground.jpg" },
];

const categories = [
  "All",
  "Academics",
  "Events",
  "School Life",
  "Announcements",
];

export default function NewsEventsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const featuredStory = stories[0];
  const closeMenu = () => setMenuOpen(false);

  const filteredStories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return stories.slice(1).filter((story) => {
      const matchesCategory =
        activeCategory === "All" || story.category === activeCategory;

      const matchesSearch =
        !query ||
        story.title.toLowerCase().includes(query) ||
        story.excerpt.toLowerCase().includes(query) ||
        story.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  return (
    <main className="news-page" id="news-top">
      <div className="announcement-bar" aria-label="School announcement bar">
        <div className="announcement-marquee">
          <div className="announcement-marquee-track">
            <span>
              <span className="announcement-dot" />
              INFANT JESUS ACADEMY
            </span>
            <span>Rukuba Road, Jos, Plateau State, Nigeria</span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <Link className="school-brand" href="/" aria-label="Infant Jesus Academy home">
          <span className="school-crest" aria-hidden="true">
            <AcademyLogo />
          </span>
          <span className="brand-copy">
            <strong>INFANT JESUS</strong>
            <strong>ACADEMY</strong>
            <small>KNOWLEDGE · CHARACTER · EXCELLENCE</small>
          </span>
        </Link>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="news-main-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`main-navigation ${menuOpen ? "navigation-open" : ""}`}
          id="news-main-navigation"
          aria-label="Main navigation"
        >
          <Link href="/" onClick={closeMenu}>Home</Link>
          <Link href="/#about" onClick={closeMenu}>About Us</Link>
          <Link href="/#academics" onClick={closeMenu}>Academics</Link>
          <Link href="/#admissions" onClick={closeMenu}>Admissions</Link>
          <Link href="/news-events" aria-current="page" onClick={closeMenu}>
            News &amp; Events
          </Link>
          <Link href="/#contact" onClick={closeMenu}>Contact Us</Link>
          <Link
            className="nav-apply-button nav-community-button"
            href="/community"
            onClick={closeMenu}
          >
            Parents &amp; Teachers
          </Link>
          <Link className="nav-apply-button" href="/#admissions" onClick={closeMenu}>
            Apply for Admission <NewsIcon name="arrowUpRight" />
          </Link>
        </nav>
      </header>

      <section className="news-hero">
        <div className="news-hero-content">
          <p className="news-eyebrow">
            <span /> THE IJA COMMUNITY
          </p>
          <h1>
            News, events
            <br />
            <em>&amp; school stories.</em>
          </h1>
          <p className="news-hero-description">
            Discover the ideas, activities, and experiences that bring our
            school community together.
          </p>
          <div className="news-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>News &amp; Events</span>
          </div>
        </div>

        <div className="news-hero-showcase" aria-label="School event slideshow">
          <div className="news-hero-track">
            {[...heroSlides, ...heroSlides].map((slide, index) => (
              <article
                key={`${slide.title}-${index}`}
                className="news-hero-slide"
                style={{ backgroundImage: `url("${slide.image}")` }}
                aria-label={slide.title}
              >
                <div className="news-hero-slide-overlay">
                  <h1>{slide.title}</h1>
                </div>
              </article>
            ))}
          </div>
          <span className="news-hero-art-label">A COMMUNITY THAT LEARNS TOGETHER</span>
        </div>
        <div className="news-hero-number" aria-hidden="true">
          IJA
        </div>
      </section>

      <section className="news-featured-section">
        <div className="news-section-heading">
          <div>
            <p className="news-eyebrow">IN FOCUS</p>
            <h2>Stories worth sharing.</h2>
          </div>
          <p>
            A place for school highlights, learning moments, and updates for
            families.
          </p>
        </div>

        <article className="news-featured-card">
          <div
            className="news-featured-image"
            role="img"
            aria-label="A classroom learning environment"
            style={{ backgroundImage: `url("${featuredStory.image}")` }}
          >
            <span className="news-image-tag">FEATURED</span>
          </div>
          <div className="news-featured-copy">
            <p className="news-card-meta">
              <span>{featuredStory.category}</span>
              <span>·</span>
              <span>{featuredStory.date}</span>
            </p>
            <h3>{featuredStory.title}</h3>
            <p>{featuredStory.excerpt}</p>
            <span className="news-demo-note">
              Demonstration content — replace with an approved school story.
            </span>
          </div>
        </article>
      </section>

      <section className="news-list-section" id="all-stories">
        <div className="news-section-heading news-list-heading">
          <div>
            <p className="news-eyebrow">THE LATEST</p>
            <h2>Explore our stories.</h2>
          </div>
          <label className="news-search">
            <span className="news-search-icon" aria-hidden="true">
              <NewsIcon name="search" />
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search stories..."
              aria-label="Search news and events"
            />
          </label>
        </div>

        <div className="news-filters" aria-label="Filter stories by category">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`news-filter ${activeCategory === category ? "is-active" : ""}`}
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredStories.length > 0 ? (
          <div className="news-card-grid">
            {filteredStories.map((story) => (
              <article className="news-card" key={story.id}>
                <div
                  className="news-card-image"
                  role="img"
                  aria-label={`Illustrative image for ${story.category.toLowerCase()}`}
                  style={{ backgroundImage: `url("${story.image}")` }}
                >
                  <span className="news-card-category">{story.category}</span>
                </div>
                <div className="news-card-body">
                  <p className="news-card-date">{story.date}</p>
                  <h3>{story.title}</h3>
                  <p className="news-card-excerpt">{story.excerpt}</p>
                  <span className="news-card-read-more">
                    Sample story <NewsIcon name="arrowUpRight" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="news-empty-state">
            <span aria-hidden="true"><NewsIcon name="search" /></span>
            <h3>No matching stories</h3>
            <p>Try another search term or choose a different category.</p>
            <button
              type="button"
              className="news-reset-button"
              onClick={() => {
                setActiveCategory("All");
                setSearchTerm("");
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        <p className="news-content-disclaimer">
          The stories on this page are illustrative examples for website
          development. They are not official school announcements or confirmed
          event listings.
        </p>
      </section>

      <section className="news-community-cta">
        <div>
          <p className="news-eyebrow">STAY CONNECTED</p>
          <h2>Be part of the school story.</h2>
          <p>
            For admission enquiries or general questions, get in touch with
            Infant Jesus Academy.
          </p>
        </div>
        <Link href="/#contact" className="news-cta-button">
          Contact the School <NewsIcon name="arrowUpRight" />
        </Link>
      </section>

      <footer className="site-footer news-footer">
        <div className="footer-main">
          <div className="footer-brand-column">
            <Link className="school-brand footer-brand" href="/">
              <span className="school-crest" aria-hidden="true">
                <AcademyLogo />
              </span>
              <span className="brand-copy">
                <strong>INFANT JESUS</strong>
                <strong>ACADEMY</strong>
                <small>KNOWLEDGE · CHARACTER · EXCELLENCE</small>
              </span>
            </Link>
            <p>
              Supporting the growth of young minds through education,
              character development and a shared commitment to learning.
            </p>
            <div className="social-links">
              <Link href="/#contact" aria-label="Facebook"><NewsIcon name="facebook" /></Link>
              <Link href="/#contact" aria-label="WhatsApp"><NewsIcon name="whatsapp" /></Link>
              <Link href="/#contact" aria-label="Instagram"><NewsIcon name="instagram" /></Link>
              <Link href="/#contact" aria-label="YouTube"><NewsIcon name="youtube" /></Link>
            </div>
          </div>

          <div className="footer-link-column">
            <h3>Quick Links</h3>
            <Link href="/#about">About Us</Link>
            <Link href="/#academics">Academics</Link>
            <Link href="/#admissions">Admissions</Link>
            <Link href="/news-events">News &amp; Events</Link>
            <Link href="/#contact">Contact Us</Link>
          </div>

          <div className="footer-link-column">
            <h3>Useful Links</h3>
            <Link href="/#faq">FAQs</Link>
            <Link href="/#values">Our Values</Link>
            <Link href="/#testimonials">Community Reviews</Link>
            <Link href="/#admissions">Admission Enquiries</Link>
            <Link href="/news-events">School News</Link>
          </div>

          <div className="footer-connect-column">
            <div className="footer-contact-column">
              <h3>Contact Information</h3>
              <p><span><NewsIcon name="mapPin" /></span> Rukuba Road, Jos, Plateau State, Nigeria</p>
              <p><span><NewsIcon name="mail" /></span> Official email to be confirmed</p>
              <p><span><NewsIcon name="clock" /></span> Contact the academy for visiting hours</p>
            </div>
            <div className="footer-newsletter-column">
              <h3>Stay Connected</h3>
              <p>
                Follow school news and announcements on the News &amp; Events
                page.
              </p>
              <Link className="news-footer-latest-link" href="#all-stories">
                Explore the latest stories <NewsIcon name="arrowUpRight" />
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Infant Jesus Academy. All rights reserved.</span>
          <Link href="#news-top">Back to top <NewsIcon name="arrowUp" /></Link>
        </div>
      </footer>
    </main>
  );
}
