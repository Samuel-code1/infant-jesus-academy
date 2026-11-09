"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import "./apply.css";

type ApplicationData = {
  applicationType: string;
  applicantName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  stateOfOrigin: string;
  currentAddress: string;
  parentName: string;
  parentPhone: string;
  previousSchool: string;
  reasonForLeaving: string;
  programme: string;
  passportPhoto: string;
  ninDocument: string;
  birthCertificate: string;
  consent: boolean;
  privacyNoticeVersion: string;
  privacyAcknowledged: boolean;
};

type SubmissionStage =
  | "idle"
  | "preparing"
  | "uploading"
  | "submitting"
  | "success";

type UploadAuthorization = {
  path: string;
  token: string;
};

const PRIVACY_NOTICE_VERSION = "2026-10-30";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_PASSPORT_MIMES = ["image/jpeg", "image/png"];
const ALLOWED_DOCUMENT_MIMES = ["image/jpeg", "image/png", "application/pdf"];

function resolveMimeType(file: File): string {
  const rawType = file.type.trim().toLowerCase();
  if (rawType === "image/jpeg" || rawType === "image/jpg" || rawType === "image/pjpeg") {
    return "image/jpeg";
  }
  if (rawType === "image/png") {
    return "image/png";
  }
  if (rawType === "application/pdf") {
    return "application/pdf";
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") {
    return "image/jpeg";
  }
  if (extension === "png") {
    return "image/png";
  }
  if (extension === "pdf") {
    return "application/pdf";
  }

  return rawType;
}

function validateFile(
  file: File,
  allowedMimes: string[],
  label: string,
): string | null {
  if (file.size === 0) {
    return `${label} appears to be empty.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${label} exceeds the 5 MB file size limit.`;
  }
  const mime = resolveMimeType(file);
  if (!allowedMimes.includes(mime)) {
    if (allowedMimes.includes("application/pdf")) {
      return `${label} must be a JPEG, PNG, or PDF file.`;
    }
    return `${label} must be a JPEG or PNG image.`;
  }
  return null;
}

function isValidUploadAuthorization(
  value: unknown,
  expectedPrefix: string,
): value is UploadAuthorization {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.path === "string" &&
    candidate.path.startsWith(`${expectedPrefix}/`) &&
    typeof candidate.token === "string" &&
    candidate.token.trim().length > 0
  );
}

const initialData: ApplicationData = {
  applicationType: "",
  applicantName: "",
  gender: "",
  dateOfBirth: "",
  nationality: "",
  stateOfOrigin: "",
  currentAddress: "",
  parentName: "",
  parentPhone: "",
  previousSchool: "",
  reasonForLeaving: "",
  programme: "",
  passportPhoto: "",
  ninDocument: "",
  birthCertificate: "",
  consent: false,
  privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
  privacyAcknowledged: false,
};

const steps = [
  { number: "01", label: "Applicant details" },
  { number: "02", label: "Documents & choice" },
  { number: "03", label: "Review application" },
];

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ApplicationData>(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [ninFile, setNinFile] = useState<File | null>(null);
  const [birthCertificateFile, setBirthCertificateFile] =
    useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStage, setSubmissionStage] = useState<SubmissionStage>("idle");

  function update<K extends keyof ApplicationData>(
    field: K,
    value: ApplicationData[K],
  ) {
    setData((current) => ({ ...current, [field]: value }));
    setErrors([]);
    setNotice("");
  }

  function validateCurrentStep() {
    const problems: string[] = [];

    if (step === 0) {
      if (!data.applicationType) problems.push("Select the application method.");
      if (!data.applicantName.trim()) problems.push("Enter the applicant's full name.");
      if (!data.gender) problems.push("Select the applicant's gender.");
      if (!data.dateOfBirth) problems.push("Enter the applicant's date of birth.");
      if (!data.nationality.trim()) problems.push("Enter the applicant's nationality.");
      if (!data.stateOfOrigin.trim()) problems.push("Enter the applicant's state of origin.");
      if (!data.currentAddress.trim()) problems.push("Enter the applicant's current address.");
      if (!data.parentName.trim()) problems.push("Enter the parent or guardian's name.");
      if (!data.parentPhone.trim()) {
        problems.push("Enter a parent or guardian phone number.");
      } else if (!/^[+()\d\s-]{7,20}$/.test(data.parentPhone.trim())) {
        problems.push("Enter a valid parent or guardian phone number.");
      }

      if (data.dateOfBirth) {
        const birthDate = new Date(`${data.dateOfBirth}T00:00:00`);
        if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) {
          problems.push("Enter a valid date of birth that is not in the future.");
        }
      }
    }

    if (step === 1) {
      if (!data.programme) {
        problems.push("Select the intended programme.");
      }

      if (data.applicationType === "Online application") {
        if (!passportFile) {
          problems.push("Upload the applicant's passport photo.");
        } else {
          const fileErr = validateFile(passportFile, ALLOWED_PASSPORT_MIMES, "Passport photo");
          if (fileErr) problems.push(fileErr);
        }

        if (!ninFile) {
          problems.push("Upload the NIN document.");
        } else {
          const fileErr = validateFile(ninFile, ALLOWED_DOCUMENT_MIMES, "NIN document");
          if (fileErr) problems.push(fileErr);
        }

        if (!birthCertificateFile) {
          problems.push("Upload the birth certificate.");
        } else {
          const fileErr = validateFile(birthCertificateFile, ALLOWED_DOCUMENT_MIMES, "Birth certificate");
          if (fileErr) problems.push(fileErr);
        }
      }
    }

    if (step === 2 && !data.consent) {
      problems.push("Confirm that you have reviewed the information before submitting.");
    }

    if (step === 2 && !data.privacyAcknowledged) {
      problems.push("Read and accept the admissions privacy notice before submitting.");
    }

    setErrors(problems);
    return problems.length === 0;
  }

  function continueStep() {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
    setNotice("");
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
    setErrors([]);
    setNotice("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !validateCurrentStep()) return;

    // Printing is a local browser action. It does not call the API.
    if (data.applicationType === "Download and print") {
      window.print();
      return;
    }

    if (
      data.applicationType !== "Online application" ||
      !passportFile ||
      !ninFile ||
      !birthCertificateFile
    ) {
      setNotice("Please complete the required fields and select all three documents.");
      return;
    }

    // Client-side file type and size validation before requesting authorization
    const passportError = validateFile(passportFile, ALLOWED_PASSPORT_MIMES, "Passport photo");
    const ninError = validateFile(ninFile, ALLOWED_DOCUMENT_MIMES, "NIN document");
    const birthCertError = validateFile(birthCertificateFile, ALLOWED_DOCUMENT_MIMES, "Birth certificate");

    if (passportError || ninError || birthCertError) {
      const fileErrors = [passportError, ninError, birthCertError].filter(Boolean) as string[];
      setErrors(fileErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmissionStage("preparing");
    setNotice("");
    setErrors([]);

    try {
      // Step A: Request signed upload credentials from authorization route
      const authBody = {
        passportPhoto: {
          name: passportFile.name,
          type: resolveMimeType(passportFile),
          size: passportFile.size,
        },
        ninDocument: {
          name: ninFile.name,
          type: resolveMimeType(ninFile),
          size: ninFile.size,
        },
        birthCertificate: {
          name: birthCertificateFile.name,
          type: resolveMimeType(birthCertificateFile),
          size: birthCertificateFile.size,
        },
      };

      const authResponse = await fetch("/api/admissions/uploads/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authBody),
      });

      type AuthorizeResponse = {
        success?: boolean;
        error?: string;
        applicationId?: string;
        uploads?: {
          passportPhoto?: { path?: string; token?: string };
          ninDocument?: { path?: string; token?: string };
          birthCertificate?: { path?: string; token?: string };
        };
      };

      const authData: AuthorizeResponse = await authResponse.json().catch(() => ({}));

      if (!authResponse.ok || !authData.success) {
        setNotice(
          authData.error ||
            "We could not prepare secure document uploads. Please try again later.",
        );
        setSubmissionStage("idle");
        return;
      }

      const { applicationId, uploads } = authData;

      const isValidUUID =
        typeof applicationId === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(applicationId);

      const passportUploadCandidate = uploads?.passportPhoto;
      const ninUploadCandidate = uploads?.ninDocument;
      const birthCertificateUploadCandidate = uploads?.birthCertificate;

      if (
        !isValidUUID ||
        !isValidUploadAuthorization(passportUploadCandidate, applicationId) ||
        !isValidUploadAuthorization(ninUploadCandidate, applicationId) ||
        !isValidUploadAuthorization(birthCertificateUploadCandidate, applicationId)
      ) {
        setNotice("We could not prepare secure document uploads. Please try again later.");
        setSubmissionStage("idle");
        return;
      }

      const validatedPassportUpload: UploadAuthorization = {
        path: passportUploadCandidate.path,
        token: passportUploadCandidate.token,
      };

      const validatedNinUpload: UploadAuthorization = {
        path: ninUploadCandidate.path,
        token: ninUploadCandidate.token,
      };

      const validatedBirthCertificateUpload: UploadAuthorization = {
        path: birthCertificateUploadCandidate.path,
        token: birthCertificateUploadCandidate.token,
      };

      // Step B: Upload all three files to private storage via Supabase browser client
      setSubmissionStage("uploading");

      const supabase = createSupabaseClient();

      const [passportResult, ninResult, birthCertResult] = await Promise.all([
        supabase.storage
          .from("admissions-private")
          .uploadToSignedUrl(
            validatedPassportUpload.path,
            validatedPassportUpload.token,
            passportFile,
            { contentType: resolveMimeType(passportFile) },
          ),
        supabase.storage
          .from("admissions-private")
          .uploadToSignedUrl(
            validatedNinUpload.path,
            validatedNinUpload.token,
            ninFile,
            { contentType: resolveMimeType(ninFile) },
          ),
        supabase.storage
          .from("admissions-private")
          .uploadToSignedUrl(
            validatedBirthCertificateUpload.path,
            validatedBirthCertificateUpload.token,
            birthCertificateFile,
            { contentType: resolveMimeType(birthCertificateFile) },
          ),
      ]);

      if (
        passportResult.error ||
        ninResult.error ||
        birthCertResult.error ||
        !passportResult.data ||
        !ninResult.data ||
        !birthCertResult.data
      ) {
        setNotice(
          "One or more documents could not be uploaded securely. Please check your connection and try again.",
        );
        setSubmissionStage("idle");
        return;
      }

      // Step C: Submit application details as JSON to /api/admissions
      setSubmissionStage("submitting");

      const applicationPayload = {
        applicationType: data.applicationType,
        applicantName: data.applicantName.trim(),
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        nationality: data.nationality.trim(),
        stateOfOrigin: data.stateOfOrigin.trim(),
        currentAddress: data.currentAddress.trim(),
        parentName: data.parentName.trim(),
        parentPhone: data.parentPhone.trim(),
        previousSchool: data.previousSchool.trim(),
        reasonForLeaving: data.reasonForLeaving.trim(),
        programme: data.programme,
        consent: data.consent,
        privacyNoticeVersion: data.privacyNoticeVersion,
        privacyAcknowledged: data.privacyAcknowledged,
        applicationId,
        passportPhotoPath: validatedPassportUpload.path,
        ninDocumentPath: validatedNinUpload.path,
        birthCertificatePath: validatedBirthCertificateUpload.path,
      };

      const response = await fetch("/api/admissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationPayload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        setNotice(
          result?.error ??
            "We could not submit your application. Please try again later.",
        );
        setSubmissionStage("idle");
        return;
      }

      setSubmissionStage("success");
      setNotice(
        `Your application was submitted successfully. Your reference is ${result.applicationReference}. Please keep this reference for future enquiries.`,
      );
    } catch {
      setNotice(
        "We could not reach the submission service. Please check your connection and try again.",
      );
      setSubmissionStage("idle");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="apply-page">
      <header className="apply-header">
        <Link href="/" className="apply-brand">
          <span className="apply-crest">IJA</span>
          <span>
            <strong>INFANT JESUS ACADEMY</strong>
            <small>LEARN · DISCOVER · GROW</small>
          </span>
        </Link>

        <Link href="/admissions" className="apply-back-link">
          ← Admissions information
        </Link>
      </header>

      <section className="apply-intro">
        <p className="apply-eyebrow">ADMISSIONS · APPLICATION FORM</p>
        <h1>Every journey begins <em>with a step.</em></h1>
        <p>
          Select your preferred application route, complete the required details,
          and upload the documents needed for a smooth admission review.
        </p>
      </section>

      <section className="apply-workspace">
        <aside className="apply-sidebar">
          <p className="apply-eyebrow">YOUR APPLICATION</p>
          <h2>Application<br />details.</h2>
          <p className="apply-sidebar-description">
            Select the application format you prefer, then complete the required
            fields and upload the necessary documents.
          </p>

          <ol className="apply-step-list">
            {steps.map((item, index) => (
              <li
                key={item.number}
                className={index === step ? "active" : index < step ? "complete" : ""}
              >
                <span className="apply-step-number">
                  {index < step ? "✓" : item.number}
                </span>
                <span>{item.label}</span>
              </li>
            ))}
          </ol>

          <div className="apply-sidebar-note">
            <span aria-hidden="true">i</span>
            <p>
              Online applications and documents are uploaded securely.
              Download and print applications remain local to your browser and
              are not submitted online.
            </p>
          </div>
        </aside>

        <div className="apply-form-panel">
          <form onSubmit={handleSubmit} noValidate>
            {step === 0 && (
              <section className="apply-form-step">
                <p className="apply-step-kicker">STEP 01 / 03</p>
                <h2>Applicant information</h2>
                <p className="apply-form-description">
                  Complete the required applicant and guardian details below.
                </p>

                <div className="apply-field-grid">
                  <label className="apply-field apply-field-full">
                    Application method *
                    <div className="apply-choice-row">
                      <label className="apply-choice-card">
                        <input
                          type="radio"
                          name="applicationType"
                          value="Download and print"
                          checked={data.applicationType === "Download and print"}
                          onChange={(e) => update("applicationType", e.target.value)}
                        />
                        <span>Download &amp; print</span>
                      </label>
                      <label className="apply-choice-card">
                        <input
                          type="radio"
                          name="applicationType"
                          value="Online application"
                          checked={data.applicationType === "Online application"}
                          onChange={(e) => update("applicationType", e.target.value)}
                        />
                        <span>Online application</span>
                      </label>
                    </div>
                  </label>

                  <label className="apply-field apply-field-full">
                    Applicant full name *
                    <input
                      autoComplete="name"
                      value={data.applicantName}
                      onChange={(e) => update("applicantName", e.target.value)}
                      placeholder="Applicant's full name"
                      required
                    />
                  </label>

                  <label className="apply-field">
                    Gender *
                    <select
                      value={data.gender}
                      onChange={(e) => update("gender", e.target.value)}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  <label className="apply-field">
                    Date of birth *
                    <input
                      type="date"
                      value={data.dateOfBirth}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => update("dateOfBirth", e.target.value)}
                      required
                    />
                  </label>

                  <label className="apply-field">
                    Nationality *
                    <input
                      value={data.nationality}
                      onChange={(e) => update("nationality", e.target.value)}
                      placeholder="Enter nationality"
                      required
                    />
                  </label>

                  <label className="apply-field">
                    State of origin *
                    <input
                      value={data.stateOfOrigin}
                      onChange={(e) => update("stateOfOrigin", e.target.value)}
                      placeholder="Enter state"
                      required
                    />
                  </label>

                  <label className="apply-field apply-field-full">
                    Current address *
                    <textarea
                      autoComplete="street-address"
                      rows={3}
                      value={data.currentAddress}
                      onChange={(e) => update("currentAddress", e.target.value)}
                      placeholder="Enter current residential address"
                      required
                    />
                  </label>

                  <label className="apply-field">
                    Parent or guardian name *
                    <input
                      value={data.parentName}
                      onChange={(e) => update("parentName", e.target.value)}
                      placeholder="Parent or guardian name"
                      required
                    />
                  </label>

                  <label className="apply-field">
                    Parent or guardian phone number *
                    <input
                      type="tel"
                      value={data.parentPhone}
                      onChange={(e) => update("parentPhone", e.target.value)}
                      placeholder="+234..."
                      required
                    />
                  </label>
                </div>
              </section>
            )}

            {step === 1 && (
              <section className="apply-form-step">
                <p className="apply-step-kicker">STEP 02 / 03</p>
                <h2>Programme and documents</h2>
                <p className="apply-form-description">
                  Choose the desired programme and upload all required documents.
                </p>

                <div className="apply-field-grid">
                  <label className="apply-field apply-field-full">
                    Academic programme *
                    <select
                      value={data.programme}
                      onChange={(e) => update("programme", e.target.value)}
                      required
                    >
                      <option value="">Select a programme</option>
                      <option value="Nursery Education">Nursery Education</option>
                      <option value="Primary Education">Primary Education</option>
                      <option value="Secondary Education">Secondary Education</option>
                    </select>
                  </label>

                  <label className="apply-field apply-field-full">
                    Former school attended (optional)
                    <input
                      value={data.previousSchool}
                      onChange={(e) => update("previousSchool", e.target.value)}
                      placeholder="Name of former school"
                    />
                  </label>

                  <label className="apply-field apply-field-full">
                    Reason for leaving previous school (optional)
                    <textarea
                      rows={3}
                      value={data.reasonForLeaving}
                      onChange={(e) => update("reasonForLeaving", e.target.value)}
                      placeholder="Provide a brief explanation if applicable"
                    />
                  </label>

                  {data.applicationType === "Online application" && (
                    <>
                      <label className="apply-field apply-field-full">
                        Passport photo *
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setPassportFile(file);
                            update("passportPhoto", file?.name ?? "");
                          }}
                        />
                        <small>Upload a clear image of the applicant (JPEG or PNG, up to 5 MB).</small>
                      </label>

                      <label className="apply-field apply-field-full">
                        NIN document *
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setNinFile(file);
                            update("ninDocument", file?.name ?? "");
                          }}
                        />
                        <small>Upload the NIN document (JPEG, PNG or PDF, up to 5 MB).</small>
                      </label>

                      <label className="apply-field apply-field-full">
                        Birth certificate *
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setBirthCertificateFile(file);
                            update("birthCertificate", file?.name ?? "");
                          }}
                        />
                        <small>Upload the birth certificate (JPEG, PNG or PDF, up to 5 MB).</small>
                      </label>
                    </>
                  )}
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="apply-form-step">
                <p className="apply-step-kicker">STEP 03 / 03</p>
                <h2>Review your details</h2>
                <p className="apply-form-description">
                  Check the information below before continuing.
                </p>

                <div className="apply-review-section">
                  <div className="apply-review-heading">
                    <h3>Applicant information</h3>
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      disabled={isSubmitting}
                    >
                      Edit
                    </button>
                  </div>
                  <dl className="apply-review-list">
                    <div><dt>Application type</dt><dd>{data.applicationType || "—"}</dd></div>
                    <div><dt>Full name</dt><dd>{data.applicantName || "—"}</dd></div>
                    <div><dt>Date of birth</dt><dd>{data.dateOfBirth || "—"}</dd></div>
                    <div><dt>Gender</dt><dd>{data.gender || "Not specified"}</dd></div>
                    <div><dt>Nationality</dt><dd>{data.nationality || "—"}</dd></div>
                    <div><dt>State of origin</dt><dd>{data.stateOfOrigin || "—"}</dd></div>
                    <div><dt>Current address</dt><dd>{data.currentAddress || "—"}</dd></div>
                    <div><dt>Parent/guardian</dt><dd>{data.parentName || "—"}</dd></div>
                    <div><dt>Parent phone</dt><dd>{data.parentPhone || "—"}</dd></div>
                  </dl>
                </div>

                <div className="apply-review-section">
                  <div className="apply-review-heading">
                    <h3>Programme and files</h3>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={isSubmitting}
                    >
                      Edit
                    </button>
                  </div>
                  <dl className="apply-review-list">
                    <div><dt>Programme</dt><dd>{data.programme || "—"}</dd></div>
                    <div><dt>Former school</dt><dd>{data.previousSchool || "Not provided"}</dd></div>
                    <div><dt>Reason for leaving</dt><dd>{data.reasonForLeaving || "Not provided"}</dd></div>
                    <div><dt>Passport photo</dt><dd>{data.passportPhoto || "Not uploaded"}</dd></div>
                    <div><dt>NIN document</dt><dd>{data.ninDocument || "Not uploaded"}</dd></div>
                    <div><dt>Birth certificate</dt><dd>{data.birthCertificate || "Not uploaded"}</dd></div>
                  </dl>
                </div>

                <div className="apply-privacy-notice" aria-labelledby="admissions-privacy-notice-title">
                  <h3 id="admissions-privacy-notice-title">Admissions privacy notice</h3>
                  <p>
                    Infant Jesus Academy respects the privacy of applicants and
                    their parents or guardians. This notice explains how personal
                    information submitted through our admissions application process
                    is collected, used, stored and protected.
                  </p>

                  <ol className="apply-privacy-list">
                    <li>
                      <strong>Information we collect:</strong> We may collect the
                      applicant&apos;s full name, date of birth, gender, nationality,
                      state of origin, residential address, parent or guardian
                      details, previous school information, passport photograph, NIN
                      document and birth certificate.
                    </li>
                    <li>
                      <strong>Why we collect it:</strong> We use this information to
                      process and assess admissions applications, verify identity and
                      supporting documents, determine the appropriate academic
                      programme, communicate with parents or guardians, and maintain
                      necessary admissions records.
                    </li>
                    <li>
                      <strong>Who may access your information:</strong> Access is
                      restricted to authorised school personnel who require the
                      information for admissions-related responsibilities. Where
                      necessary and lawful, information may also be shared with
                      relevant authorities or service providers supporting the
                      admissions process.
                    </li>
                    <li>
                      <strong>How we protect it:</strong> The academy takes
                      appropriate steps to protect admissions information against
                      unauthorised access, disclosure, alteration, loss or misuse.
                      Electronic documents are stored in private, access-controlled
                      systems and are not made publicly accessible.
                    </li>
                    <li>
                      <strong>Retention:</strong> Infant Jesus Academy has not yet
                      established a fixed retention period for unsuccessful
                      applications. Until a formal retention schedule is approved,
                      applicant information is retained only as long as necessary for
                      the admissions process and applicable legal requirements.
                    </li>
                    <li>
                      <strong>Your rights:</strong> Applicants and their parents or
                      guardians may have rights concerning their personal information
                      under applicable data protection laws. Requests or concerns may
                      be directed to the academy using the contact details below.
                    </li>
                    <li>
                      <strong>Contact:</strong> Infant Jesus Academy, Rukuba Road,
                      Jos, Plateau State, Nigeria. Email: infantjesusacademy@gmail.com
                    </li>
                  </ol>

                  <p className="apply-privacy-footer">
                    By continuing with the online application, you acknowledge that
                    you have read this notice.
                  </p>
                </div>

                <label className="apply-consent">
                  <input
                    type="checkbox"
                    checked={data.privacyAcknowledged}
                    disabled={isSubmitting || submissionStage === "success"}
                    onChange={(e) => update("privacyAcknowledged", e.target.checked)}
                  />
                  <span>
                    I have read and understood this Admissions Privacy Notice and
                    consent to Infant Jesus Academy collecting, using, storing and
                    protecting my personal information for the admissions process. *
                  </span>
                </label>

                <label className="apply-consent apply-consent-secondary">
                  <input
                    type="checkbox"
                    checked={data.consent}
                    disabled={isSubmitting || submissionStage === "success"}
                    onChange={(e) => update("consent", e.target.checked)}
                  />
                  <span>
                    I confirm that I have reviewed the information entered and
                    understand that the school must confirm its admission
                    requirements and next steps. *
                  </span>
                </label>

                <p className="apply-demo-notice">
                  {data.applicationType === "Download and print"
                    ? "Print this completed form and follow the school's instructions for submitting it. Your information will not be sent or stored online."
                    : "Your online application and required documents will be sent securely to the school's submission service."}
                </p>
              </section>
            )}

            {errors.length > 0 && (
              <div className="apply-errors" role="alert">
                <strong>Please check the following:</strong>
                <ul>
                  {errors.map((error) => <li key={error}>{error}</li>)}
                </ul>
              </div>
            )}

            {isSubmitting && (
              <div className="apply-notice" role="status" aria-live="polite">
                {submissionStage === "preparing" && "Preparing secure uploads..."}
                {submissionStage === "uploading" && "Uploading documents..."}
                {submissionStage === "submitting" && "Submitting application..."}
              </div>
            )}

            {!isSubmitting && notice && (
              <div className="apply-notice" role="status">
                {notice}
              </div>
            )}

            <div className="apply-form-actions">
              {step > 0 ? (
                <button
                  className="apply-secondary-button"
                  type="button"
                  onClick={goBack}
                  disabled={isSubmitting}
                >
                  ← Previous
                </button>
              ) : (
                <Link href="/admissions" className="apply-secondary-button">
                  Cancel
                </Link>
              )}

              {step < steps.length - 1 ? (
                <button
                  className="apply-primary-button"
                  type="button"
                  onClick={continueStep}
                >
                  Continue <span aria-hidden="true">→</span>
                </button>
              ) : (
                <button
                  className="apply-primary-button"
                  type="submit"
                  disabled={isSubmitting || submissionStage === "success"}
                >
                  {isSubmitting
                    ? submissionStage === "preparing"
                      ? "Preparing secure uploads..."
                      : submissionStage === "uploading"
                        ? "Uploading documents..."
                        : "Submitting application..."
                    : submissionStage === "success"
                      ? "Application submitted"
                      : data.applicationType === "Download and print"
                        ? "Print application"
                        : "Submit application"}
                  {!isSubmitting && submissionStage !== "success" && (
                    <span aria-hidden="true"> →</span>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <footer className="apply-footer">
        <span>INFANT JESUS ACADEMY</span>
        <span>Rukuba Road, Jos, Plateau State, Nigeria</span>
        <Link href="/admissions">Admissions information</Link>
      </footer>
    </main>
  );
}