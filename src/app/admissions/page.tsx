
"use client";

import Link from "next/link";
import { useState } from "react";
import SchoolLogo from "@/components/SchoolLogo";
import {
  getSchoolTelLink,
  getSchoolWhatsAppUrl,
} from "@/lib/school-contact";
import "./admissions.css";

const programmes = [
  {
    number: "01",
    title: "Nursery Education",
    description:
      "A warm, nurturing foundation for curiosity, confidence and essential early-learning skills.",
    image: "/images/nursery.jpg",
    ageEligibility: "Ages 3–5 years",
  },
  {
    number: "02",
    title: "Primary Education",
    description:
      "Building foundations in literacy, numeracy, creativity and critical thinking.",
    image: "/images/primary.jpg",
    ageEligibility: "Ages 6–11 years",
  },
  {
    number: "03",
    title: "Secondary Education",
    description:
      "Supporting academic progression, independent thinking and responsible leadership.",
    image: "/images/secondary.jpg",
    ageEligibility: "Ages 12–17 years",
  },
];

const admissionSteps = [
  {
    number: "01",
    title: "Make an enquiry",
    description:
      "Contact the school office to discuss your child's age, educational background and the appropriate programme.",
  },
  {
    number: "02",
    title: "Confirm requirements",
    description:
      "Ask the school which documents, assessments and other requirements apply to your child's intended entry level.",
  },
  {
    number: "03",
    title: "Complete the application",
    description:
      "Obtain the official application form and provide the requested student and parent or guardian information.",
  },
  {
    number: "04",
    title: "Receive guidance",
    description:
      "Follow the school's instructions on assessment, application review and the next steps towards enrolment.",
  },
];

const faqs = [
  {
    question: "Which programmes can I enquire about?",
    answer:
      "You can enquire about Nursery Education, Primary Education and Secondary Education. Contact the school to confirm the specific classes currently available.",
  },
  {
    question: "What documents should I prepare?",
    answer:
      "Please ask the school office for the current document checklist. Requirements may vary according to the applicant's age, previous school and intended class.",
  },
  {
    question: "How do I obtain an application form?",
    answer:
      "Contact the school office to confirm the official application process, availability of forms and any applicable fees.",
  },
  {
    question: "Does submitting an enquiry guarantee admission?",
    answer:
      "No. An enquiry is an initial request for information. Admission depends on the school's requirements, review process and confirmation from the school.",
  },
];

export default function AdmissionsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const enquiryUrl = getSchoolWhatsAppUrl(
    "Hello Infant Jesus Academy. I would like to enquire about admission for my child. Please share the available programmes, current class options, admission requirements and official application process."
  );
  const schoolPhoneLink = getSchoolTelLink();

  return (
    <main className="admissions-page">
      <header className="admissions-header site-header">
        <Link
          href="/"
          className="school-brand admissions-brand"
          aria-label="Infant Jesus Academy homepage"
        >
          <span className="school-crest" aria-hidden="true">
            <SchoolLogo />
          </span>
          <span className="brand-copy admissions-brand-copy">
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
          aria-controls="admissions-main-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`main-navigation admissions-navigation ${menuOpen ? "navigation-open" : ""}`}
          id="admissions-main-navigation"
          aria-label="Admissions navigation"
        >
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/#academics" onClick={() => setMenuOpen(false)}>Academics</Link>
          <Link href="/news-events" onClick={() => setMenuOpen(false)}>News &amp; Events</Link>
          <Link href="/community" onClick={() => setMenuOpen(false)}>Community</Link>
          <Link href="#admissions-contact" className="nav-apply-button" onClick={() => setMenuOpen(false)}>
            Enquire Now <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </header>

      <section className="admissions-hero">
        <div className="admissions-hero-content">
          <p className="admissions-eyebrow">
            ADMISSIONS · INFANT JESUS ACADEMY
          </p>

          <h1>
            A promising future
            <br />
            <span>starts with a first step.</span>
          </h1>

          <p className="admissions-hero-description">
            Discover an educational journey designed to nurture curiosity,
            build strong foundations and help every learner move forward
            with confidence.
          </p>

          <div className="admissions-hero-actions">
            <Link href="#programmes" className="button button-primary">
              Explore our programmes <span aria-hidden="true">↓</span>
            </Link>

            <Link href="/admissions/apply" className="button button-outline-dark admissions-plain-link">
              Start an application <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <p className="admissions-location">
            Rukuba Road, Jos, Plateau State, Nigeria
          </p>
        </div>
      </section>

      <section className="admissions-intro">
        <div>
          <p className="admissions-eyebrow">YOUR CHILD&apos;S JOURNEY</p>
          <h2>
            The right next step
            <br />
            <span>begins with a conversation.</span>
          </h2>
        </div>

        <p>
          Every learner&apos;s journey is different. Our admissions enquiry process
          helps parents and guardians understand the programmes available,
          the requirements for entry and how to proceed with an application.
        </p>
      </section>

      <section className="admissions-programmes" id="programmes">
        <div className="admissions-section-heading">
          <div>
            <p className="admissions-eyebrow">OUR ACADEMIC PROGRAMMES</p>
            <h2>Find the right starting point.</h2>
          </div>
          <p>
            Explore our three educational programmes and contact the school
            to confirm the available entry classes.
          </p>
        </div>

        <div className="admissions-programme-grid">
          {programmes.map((programme) => (
            <article className="admissions-programme-card" key={programme.number}>
              <div className="admissions-programme-image">
                <img src={programme.image} alt={`${programme.title} learning environment`} loading="lazy" />
                <span className="admissions-programme-number">{programme.number}</span>
                <span className="admissions-programme-icon" aria-hidden="true">
                  {programme.number === "01" ? "N" : programme.number === "02" ? "P" : "S"}
                </span>
              </div>

              <div className="admissions-programme-copy">
                <p className="admissions-programme-kicker">LEARN · DISCOVER · GROW</p>
                <h3>{programme.title}</h3>
                <p>{programme.description}</p>
                <p className="admissions-age-eligibility">Age eligibility: {programme.ageEligibility}</p>
                <Link href="/admissions/apply" className="admissions-card-link">
                  Start an application <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admissions-process" id="admission-process">
        <div className="admissions-process-heading">
          <p className="admissions-eyebrow">HOW TO GET STARTED</p>
          <h2>A clear path to admission.</h2>
          <p>
            Begin by speaking with the school office. The school will confirm
            the current requirements and guide you through the official process.
          </p>
        </div>

        <div className="admissions-step-list">
          {admissionSteps.map((step) => (
            <article className="admissions-step" key={step.number}>
              <span className="admissions-step-number">{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              <span className="admissions-step-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
          ))}
        </div>

        <div className="admissions-cta-row">
          <a className="admissions-call-cta" href={schoolPhoneLink}>
            <span className="admissions-call-icon" aria-hidden="true">
              ☎
            </span>
            Call for a complete guide
          </a>
        </div>
      </section>

      <section className="admissions-requirements">
        <div className="admissions-requirements-copy">
          <p className="admissions-eyebrow">BEFORE YOU APPLY</p>
          <h2>Prepare with confidence.</h2>
          <p>
            The exact requirements should be confirmed with the school before
            an application is submitted. As a starting point, you can ask the
            school office about the following:
          </p>

          <ul>
            <li>Documents required for the intended programme and class.</li>
            <li>Previous school records, where applicable.</li>
            <li>Any required assessment or admission meeting.</li>
            <li>Application deadlines, fees and payment procedures.</li>
            <li>How the school communicates application decisions.</li>
          </ul>
        </div>

        <aside className="admissions-requirements-note">
          <span className="admissions-note-mark" aria-hidden="true">i</span>
          <h3>One important step</h3>
          <p>
            Please obtain the official checklist directly from Infant Jesus
            Academy. This website does not assume specific document,
            assessment or payment requirements that the school has not confirmed.
          </p>
          <Link href="#admissions-contact" className="admissions-text-link">
            Contact the school <span aria-hidden="true">↗</span>
          </Link>
        </aside>
      </section>

      <section className="admissions-faq">
        <div className="admissions-faq-heading">
          <p className="admissions-eyebrow">GOOD TO KNOW</p>
          <h2>Questions parents ask.</h2>
          <p>
            Need clarification? Contact the school office for the most
            up-to-date admission information.
          </p>
        </div>

        <div className="admissions-faq-list">
          {faqs.map((faq, index) => (
            <details className="admissions-faq-item" key={faq.question}>
              <summary>
                <span className="admissions-faq-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{faq.question}</span>
                <span className="admissions-faq-toggle" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section
        className="admissions-contact"
        id="admissions-contact"
      >
        <div className="admissions-contact-copy">
          <p className="admissions-eyebrow">YOUR NEXT STEP STARTS HERE</p>
          <h2>
            Let&apos;s talk about
            <br />
            <span>your child&apos;s future.</span>
          </h2>
          <p>
            Contact Infant Jesus Academy to discuss the available programmes,
            current entry classes and official application requirements.
          </p>
        </div>

        <div className="admissions-contact-actions">
          {enquiryUrl ? (
            <a
              className="button button-primary"
              href={enquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Enquire via WhatsApp <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <p>
              Please contact the school office for admission information.
            </p>
          )}

          <Link href="/" className="admissions-contact-back">
            Return to homepage <span aria-hidden="true">←</span>
          </Link>
        </div>
      </section>

      <footer className="site-footer admissions-footer">
        <div className="footer-main">
          <Link href="/" className="school-brand footer-brand admissions-footer-brand" aria-label="Infant Jesus Academy homepage">
            <span className="school-crest" aria-hidden="true">
              <SchoolLogo />
            </span>
            <span className="brand-copy">
              <strong>INFANT JESUS</strong>
              <strong>ACADEMY</strong>
              <small>KNOWLEDGE · CHARACTER · EXCELLENCE</small>
            </span>
          </Link>
          <p>Rukuba Road, Jos, Plateau State, Nigeria</p>
          <Link href="/">Back to the main website ↑</Link>
        </div>
      </footer>
    </main>
  );
}
