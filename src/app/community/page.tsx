
import Link from "next/link";
import { getSchoolWhatsAppUrl } from "@/lib/school-contact";
import "./community.css";

export default function CommunityPage() {
  const parentMessage =
    "Hello Infant Jesus Academy. I am a parent or guardian and would like to request access to the private parent community. Please guide me through verification.";

  const teacherMessage =
    "Hello Infant Jesus Academy. I am a teacher or staff member and would like to request access to the private staff community. Please guide me through verification.";

  const parentUrl = getSchoolWhatsAppUrl(parentMessage);
  const teacherUrl = getSchoolWhatsAppUrl(teacherMessage);

  return (
    <main className="community-page">
      <section className="community-content">
        <p className="community-eyebrow">
          INFANT JESUS ACADEMY
        </p>

        <h1>
          Our school community.
        </h1>

        <p className="community-intro">
          A dedicated space for communication between
          our school, parents and staff.
        </p>

        <div className="community-notice">
          <strong>Private community access</strong>
          <p>
            This community is reserved for verified
            parents and guardians of enrolled pupils,
            and authorised school staff. The school
            office must confirm your eligibility before
            providing an invitation.
          </p>
        </div>

        <div className="community-options">
          <article className="community-option">
            <h2>Parent or guardian?</h2>
            <p>
              Contact the school office to confirm
              your child&apos;s enrolment and request access.
            </p>

            {parentUrl ? (
              <a
                className="community-button"
                href={parentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Request parent access
              </a>
            ) : (
              <p className="community-setup-warning">
                The school WhatsApp number has not been
                configured yet.
              </p>
            )}
          </article>

          <article className="community-option">
            <h2>Teacher or staff member?</h2>
            <p>
              Contact the school office to confirm your
              role and request access to the appropriate
              staff community.
            </p>

            {teacherUrl ? (
              <a
                className="community-button community-button-outline"
                href={teacherUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Request staff access
              </a>
            ) : (
              <p className="community-setup-warning">
                The school WhatsApp number has not been
                configured yet.
              </p>
            )}
          </article>
        </div>

        <p className="community-reminder">
          Sending a request does not automatically
          grant access. Please do not send passwords
          or sensitive student documents through this page.
        </p>

        <Link href="/" className="community-back">
          ← Return to homepage
        </Link>
      </section>
    </main>
  );
}
