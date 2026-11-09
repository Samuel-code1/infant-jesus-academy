
"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import SchoolLogo from "@/components/SchoolLogo";

type IconName =
  | "school"
  | "groups"
  | "award"
  | "smile"
  | "child"
  | "book"
  | "graduationCap"
  | "star"
  | "lightbulb"
  | "sports"
  | "heart"
  | "calendar"
  | "palette"
  | "sparkles"
  | "target"
  | "eye"
  | "arrowUpRight"
  | "arrowDown"
  | "arrowLeft"
  | "arrowRight"
  | "arrowUp"
  | "mapPin"
  | "mail"
  | "clock"
  | "facebook"
  | "whatsapp"
  | "instagram"
  | "youtube"
  | "plus"
  | "minus";

const schoolPrograms: Array<{
  number: string;
  title: string;
  description: string;
  image: string;
  icon: IconName;
}> = [
  {
    number: "01",
    title: "Nursery Education",
    description:
      "A warm, playful and nurturing foundation where young learners develop curiosity, confidence and essential early-learning skills.",
    image: "/images/nursery.jpg",
    icon: "book",
  },
  {
    number: "02",
    title: "Primary Education",
    description:
      "Building strong foundations in literacy, numeracy, creativity, critical thinking and the values that help children flourish.",
    image: "/images/primary.jpg",
    icon: "school",
  },
  {
    number: "03",
    title: "Secondary Education",
    description:
      "Preparing students for academic progression, independent thinking, responsible leadership and a confident future.",
    image: "/images/secondary.jpg",
    icon: "graduationCap",
  },
];

const schoolFeatures: Array<{
  icon: IconName;
  title: string;
  description: string;
  image: string;
}> = [
  {
    icon: "star",
    title: "Academic Excellence",
    description:
      "A learning culture that encourages curiosity, understanding and continuous improvement.",
    image: "/images/learning.jpg",
  },
  {
    icon: "lightbulb",
    title: "Creative Learning",
    description:
      "Opportunities for learners to explore ideas, solve problems and express their creativity.",
    image: "/images/creative-learning.jpg",
  },
  {
    icon: "sports",
    title: "Activities & Sports",
    description:
      "Experiences that encourage teamwork, physical development and school spirit.",
    image: "/images/activities-sports.jpg",
  },
  {
    icon: "heart",
    title: "Values & Character",
    description:
      "Supporting kindness, integrity, respect, responsibility and good character.",
    image: "/images/teamwork.jpg",
  },
];

const testimonials = [
  {
    quote:
      "What matters most to our family is seeing our child grow in confidence, develop good habits and enjoy the learning process.",
    name: "Parent of a Learner",
    role: "Parent perspective",
    initials: "P",
  },
  {
    quote:
      "A positive school experience should build more than academic knowledge. It should also encourage curiosity, kindness and responsibility.",
    name: "Academy Community Member",
    role: "School community",
    initials: "A",
  },
  {
    quote:
      "We believe children thrive when school and home work together to support their learning, development and wellbeing.",
    name: "Parent Community",
    role: "Family perspective",
    initials: "F",
  },
  {
    quote:
      "Education creates lasting opportunities when students are encouraged to think independently and keep working towards their goals.",
    name: "Former Learner",
    role: "Alumni perspective",
    initials: "L",
  },
  {
    quote:
      "Every learner deserves encouragement, meaningful learning experiences and the opportunity to discover their strengths.",
    name: "School Community Member",
    role: "Community perspective",
    initials: "S",
  },
];

const faqs = [
  {
    question: "Which levels of education does the academy offer?",
    answer:
      "This website is structured to present nursery, primary and secondary education. Please contact the academy to confirm the currently available classes and year groups.",
  },
  {
    question: "How can I apply for admission?",
    answer:
      "Parents and guardians can contact the academy to enquire about available places, application requirements, assessment procedures and admission dates.",
  },
  {
    question: "Where is Infant Jesus Academy located?",
    answer:
      "The academy's supplied location is Rukuba Road, Jos, Plateau State, Nigeria.",
  },
  {
    question: "Can parents arrange a school visit?",
    answer:
      "Please contact the academy to ask about visiting arrangements and suitable times to meet the school team.",
  },
  {
    question: "How can I learn about school events?",
    answer:
      "Visit the News & Events page for school announcements and activities. Event dates and details should be confirmed by the academy.",
  },
];

const newsItems: Array<{
  category: string;
  date: string;
  title: string;
  description: string;
  image: string;
  icon: IconName;
}> = [
  {
    category: "School Community",
    date: "School announcement",
    title: "Celebrating Learning and School Community",
    description:
      "Discover the activities and experiences that bring learners, families and the school community together.",
    image: "/images/hero-students.png",
    icon: "calendar",
  },
  {
    category: "Learning",
    date: "Academic activities",
    title: "A Journey of Discovery and Creativity",
    description:
      "Explore how classroom learning can encourage questions, creative thinking and a lifelong love of discovery.",
    image: "/images/creative-learning.jpg",
    icon: "palette",
  },
  {
    category: "Activities",
    date: "School life",
    title: "Growing Through Activities and Teamwork",
    description:
      "Learn about the role of collaboration, participation and shared experiences in a well-rounded education.",
    image: "/images/teamwork.jpg",
    icon: "sports",
  },
];

function Icon({ name }: { name: IconName }) {
  const icons: Record<IconName, ReactNode> = {
    school: <><path d="m3 10 9-6 9 6M5 10v9m4-9v9m6-9v9m4-9v9M3 21h18M2 10h20" /></>,
    groups: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c.3-3.5 2.3-5.5 6-5.5s5.7 2 6 5.5H3Zm12.3-5.2c3.5-.2 5.5 1.6 5.7 5.2h-4.3" /></>,
    award: <><circle cx="12" cy="9" r="6" /><path d="m8 14-1 8 5-2 5 2-1-8" /><path d="m12 6 1 2 2 .3-1.5 1.5.4 2.2-1.9-1-1.9 1 .4-2.2L8 8.3l2-.3 2-2Z" /></>,
    smile: <><circle cx="12" cy="12" r="9" /><path d="M8 14.5s1.3 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></>,
    child: <><circle cx="12" cy="6" r="3" /><path d="M7 21v-2a5 5 0 0 1 10 0v2M9 13l3 2 3-2M12 15v6" /></>,
    book: <><path d="M12 7v14m0-14C9.8 5.2 6.8 5 3 6v13c3.8-1 6.8-.8 9 1m0-13c2.2-1.8 5.2-2 9-1v13c-3.8-1-6.8-.8-9 1" /><path d="M6 9h3m-3 4h3m9-4h-2m2 4h-2" /></>,
    graduationCap: <><path d="m2 9 10-5 10 5-10 5L2 9Z" /><path d="M6 11v5c3.5 2.7 8.5 2.7 12 0v-5M22 9v6" /></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
    lightbulb: <><path d="M9 18h6m-5 3h4m-2-19a7 7 0 0 0-4 12.7c.7.5 1 1.2 1 2.3h6c0-1.1.3-1.8 1-2.3A7 7 0 0 0 12 2Z" /><path d="M10 10c.5.7 1.2 1 2 1s1.5-.3 2-1" /></>,
    sports: <><circle cx="12" cy="12" r="9" /><path d="m12 7 3 2-1 4h-4L9 9l3-2Zm-3 2-3-.5m3 4.5-2.5 3m7.5-3 3 3m-6 0-.5 3.5m5-11 2.5-1.5" /></>,
    heart: <path d="M20.8 8.8c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.8 2.8Z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18m-13 4h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" /></>,
    palette: <><path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.4-3.4 1.7 1.7 0 0 1 1.2-2.9H18a3 3 0 0 0 3-3c0-4.8-4-8.7-9-8.7Z" /><path d="M7.5 11h.01M10 7.5h.01M15 8h.01M17 11h.01" /></>,
    sparkles: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15ZM5 3l.7 1.8L7.5 5.5l-1.8.7L5 8l-.7-1.8-1.8-.7 1.8-.7L5 3Z" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /><path d="m13 11 7-7m-4 0h4v4" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="3" /></>,
    arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
    arrowDown: <path d="M12 4v16m-7-5 7 5 7-5" />,
    arrowLeft: <path d="M19 12H5m6 7-7-7 7-7" />,
    arrowRight: <path d="M5 12h14m-6-7 7 7-7 7" />,
    arrowUp: <path d="M12 20V4m-7 5 7-5 7 5" />,
    mapPin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    facebook: <path d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.3v2.1H7.5V13h2.7v8h3.2Z" fill="currentColor" stroke="none" />,
    whatsapp: <><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4.1Z" /><path d="M8.5 8.3c.2-.5.5-.5.8-.5h.5l1 2.2c.1.3 0 .5-.2.7l-.6.7c.7 1.3 1.7 2.3 3 2.9l.7-.8c.2-.2.4-.3.7-.2l2.1 1c.3.1.4.3.4.6-.1 1-.9 1.8-1.9 1.9-1.6.1-3.6-1-5.3-2.6-1.6-1.6-2.6-3.4-2.4-4.8.1-.5.5-.9 1.2-1.1Z" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none" /></>,
    youtube: <><path d="M21 8.2a2.8 2.8 0 0 0-2-2C17.3 5.7 12 5.7 12 5.7s-5.3 0-7 .5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.5 12a29 29 0 0 0 .5 3.8 2.8 2.8 0 0 0 2 2c1.7.5 7 .5 7 .5s5.3 0 7-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 21.5 12a29 29 0 0 0-.5-3.8Z" /><path d="m10 15 5-3-5-3v6Z" fill="currentColor" stroke="none" /></>,
    plus: <path d="M12 5v14m-7-7h14" />,
    minus: <path d="M5 12h14" />,
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
      {icons[name]}
    </svg>
  );
}

function StatisticCounter({
  icon,
  value,
  suffix,
  label,
}: {
  icon: IconName;
  value: number;
  suffix: string;
  label: string;
}) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const element = counterRef.current;
    if (!element) return;

    const finishCount = () => setCount(value);
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      finishCount();
      return;
    }

    let animationFrame = 0;
    let startedAt: number | null = null;
    const duration = 1400;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        observer.disconnect();
        const animateCount = (timestamp: number) => {
          if (startedAt === null) startedAt = timestamp;
          const progress = Math.min((timestamp - startedAt) / duration, 1);
          const easedProgress = 1 - (1 - progress) ** 3;
          setCount(Math.round(value * easedProgress));

          if (progress < 1) {
            animationFrame = window.requestAnimationFrame(animateCount);
          }
        };

        animationFrame = window.requestAnimationFrame(animateCount);
      },
      { threshold: 0.35 }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [value]);

  return (
    <div className="statistic-item">
      <span className="statistic-icon">
        <Icon name={icon} />
      </span>
      <div className="statistic-copy">
        <strong>
          <span ref={counterRef}>{count}</span>
          {suffix}
        </strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
}) {
  return (
    <div className="section-heading reveal">
      <p className="eyebrow">
        <span className="eyebrow-mark"><Icon name="sparkles" /></span> {eyebrow}
      </p>
      <h2>
        {title} {highlight && <em>{highlight}</em>}
      </h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleNewsletterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    alert(
      "Thank you for your interest. Newsletter subscriptions will be enabled when the school's email service is connected."
    );
    setEmail("");
  }

  return (
    <main>
      <div className="announcement-bar" aria-label="School announcement bar">
        <div className="announcement-marquee">
          <div className="announcement-marquee-track">
            <span>
              <span className="announcement-dot" />
              INFANT JESUS ACADEMY
            </span>
            <span>Rukuba Road, Jos, Plateau State, Nigeria</span>
            <span>Admission! Admission!! Admission!!!</span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <a className="school-brand" href="#home" aria-label="Infant Jesus Academy home">
          <span className="school-crest" aria-hidden="true">
            <SchoolLogo />
          </span>
          <span className="brand-copy">
            <strong>INFANT JESUS</strong>
            <strong>ACADEMY</strong>
            <small>KNOWLEDGE · CHARACTER · EXCELLENCE</small>
          </span>
        </a>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`main-navigation ${menuOpen ? "navigation-open" : ""}`}>
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#about" onClick={closeMenu}>About Us</a>
          <a href="#academics" onClick={closeMenu}>Academics</a>
          <Link href="/admissions" onClick={closeMenu}>Admissions</Link>
          <a href="/news-events" onClick={closeMenu}>News & Events</a>
          <a href="#contact" onClick={closeMenu}>Contact Us</a>
          <Link className="nav-apply-button nav-community-button" href="/community" onClick={closeMenu}>
            Parents &amp; Teachers
          </Link>
          <Link className="nav-apply-button" href="/admissions/apply" onClick={closeMenu}>
            Apply for Admission <Icon name="arrowUpRight" />
          </Link>
        </nav>
      </header>

      <section className="hero-section" id="home">
        <div className="hero-background" />
        <div className="hero-pattern" aria-hidden="true" />

        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">
            <span className="eyebrow-mark"><Icon name="sparkles" /></span> A FOUNDATION FOR THE FUTURE
          </p>
          <h1>
            More than
            <br />
            a school. <em>A place</em>
            <br /> <em>to grow.</em>
          </h1>
          <p className="hero-description">
            Nurturing young minds through meaningful learning, strong values
            and experiences that prepare every learner for a brighter future.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" href="/admissions">
              Explore Admissions <Icon name="arrowUpRight" />
            </Link>
            <a className="button button-outline" href="#about">
              Discover Our School <Icon name="arrowDown" />
            </a>
          </div>
        </div>

      </section>

      <section className="statistics-strip" aria-label="School at a glance">
        <StatisticCounter
          icon="school"
          value={10}
          suffix="+"
          label="Years of Excellence"
        />
        <StatisticCounter
          icon="groups"
          value={150}
          suffix="+"
          label="Students Enrolled"
        />
        <StatisticCounter
          icon="award"
          value={20}
          suffix="+"
          label="Qualified Teachers"
        />
        <StatisticCounter
          icon="smile"
          value={90}
          suffix="%"
          label="Parent Satisfaction"
        />
      </section>

      <section className="intro-section section-padding" id="about">
        <div className="intro-image-column reveal">
          <div className="intro-image-main">
            <img
              src="images/nursery-student.jpg"
              alt="A welcoming classroom prepared for learning"
            />
            <div className="image-corner-mark">IJA</div>
          </div>
          <div className="intro-image-small">
            <img
              src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=85"
              alt="Young children taking part in an educational activity"
            />
          </div>
          <div className="experience-note">
            <span className="experience-note-icon"><Icon name="sparkles" /></span>
            <span><strong>Learning with purpose</strong><small>Growing in knowledge and character</small></span>
          </div>
        </div>

        <div className="intro-copy reveal">
          <p className="eyebrow"><span className="eyebrow-mark"><Icon name="sparkles" /></span> WELCOME TO OUR SCHOOL</p>
          <h2>A school for the child, <em>you love.</em></h2>
          <p>
            Every child has potential waiting to be discovered. Our vision
            for education brings together academic development, creativity,
            good character and a supportive school community.
          </p>
          <p>
            From the first steps in nursery through primary and secondary
            education, we believe learning should prepare children not only
            for examinations, but also for the opportunities and
            responsibilities of life.
          </p>

          <div className="intro-principles">
            <div><span>01</span><strong>Encourage curiosity</strong></div>
            <div><span>02</span><strong>Build strong foundations</strong></div>
            <div><span>03</span><strong>Develop good character</strong></div>
          </div>

          <a className="text-link" href="#mission">
            Learn more about our school <Icon name="arrowUpRight" />
          </a>
        </div>
      </section>

      <section className="mission-section section-padding" id="mission">
        <div className="mission-card reveal">
          <div className="mission-icon"><Icon name="target" /></div>
          <p className="eyebrow">OUR MISSION</p>
          <h2>Education that makes a difference.</h2>
          <p>
            To nurture learners through purposeful education, supportive
            guidance and the development of knowledge, confidence and
            responsible character.
          </p>
          <a className="text-link" href="#academics">Discover our approach <Icon name="arrowUpRight" /></a>
        </div>

        <div className="mission-visual reveal">
          <img
            src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1100&q=85"
            alt="Students learning together in a classroom"
          />
          <div className="mission-image-label">
            <span>OUR PURPOSE</span>
            <strong>Knowledge for life. Values for the future.</strong>
          </div>
        </div>

        <div className="mission-card vision-card reveal">
          <div className="mission-icon"><Icon name="eye" /></div>
          <p className="eyebrow">OUR VISION</p>
          <h2>Helping every learner flourish.</h2>
          <p>
            To inspire a community of lifelong learners who think
            confidently, act responsibly and contribute positively to
            the world around them.
          </p>
          <a className="text-link" href="#values">The values we share <Icon name="arrowUpRight" /></a>
        </div>
      </section>

      <section className="programs-section section-padding" id="academics">
        <SectionHeading
          eyebrow="OUR ACADEMIC PROGRAMMES"
          title="Every stage,"
          highlight="a new possibility."
          description="Learning experiences designed to support children's growth from their earliest discoveries to the next chapter of their education."
        />

        <div className="programs-grid">
          {schoolPrograms.map((program) => (
            <article className="program-card reveal" key={program.title}>
              <div className="program-image">
                <img src={program.image} alt={`${program.title} learning environment`} loading="lazy" />
                <span className="program-number">{program.number}</span>
                <span className="program-icon"><Icon name={program.icon} /></span>
              </div>
              <div className="program-copy">
                <p className="program-kicker">LEARN · DISCOVER · GROW</p>
                <h3>{program.title}</h3>
                <p>{program.description}</p>
                <Link className="text-link" href="/admissions">Enquire about admission <Icon name="arrowUpRight" /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="values-section section-padding" id="values">
        <SectionHeading
          eyebrow="THE INFANT JESUS APPROACH"
          title="The foundations"
          highlight="for a brighter future."
          description="A meaningful school experience helps children grow academically, socially and personally."
        />

        <div className="values-grid">
          {schoolFeatures.map((feature) => (
            <article className="value-card reveal" key={feature.title}>
              <div className="value-image">
                <img
                  src={feature.image}
                  alt={`${feature.title} at Infant Jesus Academy`}
                  loading="lazy"
                />
              </div>
              <div className="value-copy">
                <span className="value-icon"><Icon name={feature.icon} /></span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="testimonials-section section-padding" id="testimonials">
        <div className="testimonials-top">
          <SectionHeading
            eyebrow="VOICES FROM OUR COMMUNITY"
            title="Every learning journey"
            highlight="matters."
            description="Families and learners are important partners in a child's educational journey."
          />
          <div className="testimonial-controls">
            <button
              type="button"
              aria-label="Previous review"
              onClick={() =>
                setActiveTestimonial(
                  (current) => (current - 1 + testimonials.length) % testimonials.length
                )
              }
            >
              <Icon name="arrowLeft" />
            </button>
            <button
              type="button"
              aria-label="Next review"
              onClick={() =>
                setActiveTestimonial((current) => (current + 1) % testimonials.length)
              }
            >
              <Icon name="arrowRight" />
            </button>
          </div>
        </div>

        <div className="testimonial-display" key={activeTestimonial}>
          <div className="testimonial-quote-mark">“</div>
          <div className="testimonial-stars" aria-label="Decorative review indicator">
            {Array.from({ length: 5 }, (_, index) => <Icon key={index} name="star" />)}
          </div>
          <blockquote>{testimonials[activeTestimonial].quote}</blockquote>
          <div className="testimonial-author">
            <span className="testimonial-avatar">{testimonials[activeTestimonial].initials}</span>
            <span>
              <strong>{testimonials[activeTestimonial].name}</strong>
              <small>{testimonials[activeTestimonial].role}</small>
            </span>
          </div>
          <p className="testimonial-disclaimer">
            Illustrative sample copy — replace with genuine, approved testimonials before publication.
          </p>
        </div>

        <div className="testimonial-dots" aria-label="Choose a review">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.name + index}
              type="button"
              className={index === activeTestimonial ? "active-dot" : ""}
              aria-label={`Show review ${index + 1}`}
              aria-pressed={index === activeTestimonial}
              onClick={() => setActiveTestimonial(index)}
            />
          ))}
        </div>
      </section>

      <section className="admissions-section section-padding" id="admissions">
        <div className="admissions-panel reveal">
          <div className="admissions-decoration" aria-hidden="true"><Icon name="sparkles" /></div>
          <div className="admissions-copy">
            <p className="eyebrow"><span className="eyebrow-mark"><Icon name="sparkles" /></span> TAKE THE NEXT STEP</p>
            <h2>Your child&apos;s next chapter <em>starts here.</em></h2>
            <p>
              Connect with Infant Jesus Academy to learn about admissions,
              available classes and the next steps for your family.
            </p>
            <div className="admissions-actions">
              <Link className="button button-gold" href="/admissions">Enquire About Admission <Icon name="arrowUpRight" /></Link>
              <a className="admissions-phone-link" href="tel:+2348149774655">Speak with the academy</a>
            </div>
          </div>
          <div className="admissions-image">
            <img
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=85"
              alt="Students enjoying a positive learning experience"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="faq-section section-padding" id="faq">
        <div className="faq-intro reveal">
          <p className="eyebrow"><span className="eyebrow-mark"><Icon name="sparkles" /></span> HERE TO HELP</p>
          <h2>Questions parents <em>often ask.</em></h2>
          <p>
            Find answers to common questions about our school, admissions
            and the learning journey.
          </p>
          <a className="text-link" href="#contact">Have another question? Contact us <Icon name="arrowUpRight" /></a>
        </div>

        <div className="faq-list reveal">
          {faqs.map((faq, index) => (
            <article className={`faq-item ${openFaq === index ? "faq-open" : ""}`} key={faq.question}>
              <button
                type="button"
                className="faq-question"
                aria-expanded={openFaq === index}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span>{faq.question}</span>
                <span className="faq-toggle"><Icon name={openFaq === index ? "minus" : "plus"} /></span>
              </button>
              {openFaq === index && <p className="faq-answer">{faq.answer}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="news-section section-padding" id="news">
        <div className="news-section-top">
          <SectionHeading
            eyebrow="FROM OUR SCHOOL COMMUNITY"
            title="News, stories"
            highlight="& events."
            description="A place for school updates, learning highlights and community announcements."
          />
          <a className="button button-outline-dark news-view-all" href="/news-events">
            View All News <Icon name="arrowUpRight" />
          </a>
        </div>

        <div className="news-grid">
          {newsItems.map((item) => (
            <article className="news-card reveal" key={item.title}>
              <a className="news-image" href="/news-events" aria-label={`Read more: ${item.title}`}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <span className="news-image-arrow"><Icon name="arrowUpRight" /></span>
              </a>
              <div className="news-card-content">
                <div className="news-meta">
                  <span><Icon name={item.icon} /> {item.category}</span>
                  <span>{item.date}</span>
                </div>
                <h3><a href="/news-events">{item.title}</a></h3>
                <p>{item.description}</p>
                <a className="text-link" href="/news-events">Read More <Icon name="arrowRight" /></a>
              </div>
            </article>
          ))}
        </div>
        <p className="news-editorial-note">
          News descriptions are introductory placeholders. Official school announcements and event dates should be confirmed before publication.
        </p>
      </section>

      <section className="contact-section section-padding" id="contact">
        <div className="contact-copy reveal">
          <p className="eyebrow"><span className="eyebrow-mark"><Icon name="sparkles" /></span> LET&apos;S CONNECT</p>
          <h2>We would love to <em>hear from you.</em></h2>
          <p>
            Have questions about our school or admissions? Contact the
            academy to learn more.
          </p>
          <div className="contact-detail">
            <span className="contact-detail-icon"><Icon name="mapPin" /></span>
            <span className="contact-map-content">
              <small>VISIT OUR SCHOOL</small>
              <a
                className="contact-map-link"
                href="https://www.google.com/maps/search/?api=1&query=Infant+Jesus+Academy+Rukuba+Road+Jos+Plateau+State+Nigeria"
                target="_blank"
                rel="noreferrer"
                aria-label="Open Infant Jesus Academy location on Google Maps"
              >
                <iframe
                  className="contact-map-frame"
                  title="Infant Jesus Academy location map"
                  src="https://www.google.com/maps?q=Infant%20Jesus%20Academy%2C%20Rukuba%20Road%2C%20Jos%2C%20Plateau%20State%2C%20Nigeria&z=15&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </a>
            </span>
          </div>
          <div className="contact-detail">
            <span className="contact-detail-icon"><Icon name="mail" /></span>
            <span><small>EMAIL ENQUIRIES</small><strong>infantjesusacademyjos@gmail.com</strong></span>
          </div>
          <div className="contact-detail">
            <span className="contact-detail-icon"><Icon name="whatsapp" /></span>
            <span><small>PHONE NUMBERS</small><strong>+2348149774655 | +234*********</strong></span>
          </div>
        </div>

        <div className="contact-card reveal">
          <span className="contact-card-mark">IJA</span>
          <p className="eyebrow">YOUR CHILD&apos;S FUTURE MATTERS</p>
          <h3>Let&apos;s begin a conversation.</h3>
          <p>
            Our admissions team can help you understand the school&apos;s
            programmes, application requirements and next steps.
          </p>
          <Link className="button button-primary" href="/admissions">Admissions Enquiry <Icon name="arrowUpRight" /></Link>
          <p className="contact-card-note">
            Call, email or visit the academy to make an enquiry and arrange a conversation with the school team.
          </p>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand-column">
            <a className="school-brand footer-brand" href="#home">
              <span className="school-crest" aria-hidden="true">
                <SchoolLogo />
              </span>
              <span className="brand-copy">
                <strong>INFANT JESUS</strong>
                <strong>ACADEMY</strong>
                <small>KNOWLEDGE · CHARACTER · EXCELLENCE</small>
              </span>
            </a>
            <p>
              Supporting the growth of young minds through education,
              character development and a shared commitment to learning.
            </p>
            <div className="social-links">
              <a href="#contact" aria-label="Facebook"><Icon name="facebook" /></a>
              <a href="#contact" aria-label="WhatsApp"><Icon name="whatsapp" /></a>
              <a href="#contact" aria-label="Instagram"><Icon name="instagram" /></a>
              <a href="#contact" aria-label="YouTube"><Icon name="youtube" /></a>
            </div>
          </div>

          <div className="footer-link-column">
            <h3>Quick Links</h3>
            <a href="#about">About Us</a>
            <a href="#academics">Academics</a>
            <a href="#admissions">Admissions</a>
            <a href="/news-events">News & Events</a>
            <a href="#contact">Contact Us</a>
          </div>

          <div className="footer-link-column">
            <h3>Useful Links</h3>
            <a href="#faq">FAQs</a>
            <a href="#values">Our Values</a>
            <a href="#testimonials">Community Reviews</a>
            <a href="#admissions">Admission Enquiries</a>
            <a href="/news-events">School News</a>
          </div>

          <div className="footer-connect-column">
            <div className="footer-contact-column">
              <h3>Contact Information</h3>
              <p><span><Icon name="mapPin" /></span> Infant Jesus Academy, Rukuba Road, Jos, Plateau State, Nigeria</p>
              <p><span><Icon name="mail" /></span> infantjesusacademyjos@gmail.com</p>
              <p><span><Icon name="whatsapp" /></span> +2348149774655 | +234*********</p>
            </div>

            <div className="footer-newsletter-column">
              <h3>Stay Connected</h3>
              <p>Receive school news and announcements when our newsletter service becomes available.</p>
              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <label className="sr-only" htmlFor="newsletter-email">Your email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <button type="submit" aria-label="Subscribe to newsletter"><Icon name="arrowRight" /></button>
              </form>
              <small className="newsletter-note">Newsletter registration is not yet connected to a mailing service.</small>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Infant Jesus Academy. All rights reserved.</span>
          <a href="#home">Back to top <Icon name="arrowUp" /></a>
        </div>
      </footer>
    </main>
  );
}
