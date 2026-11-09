
"use client";

import Link from "next/link";

export default function WhatsAppAccessButton() {
  return (
    <Link
      href="/community"
      className="whatsapp-access-button"
      aria-label="Parent and teacher community access"
      title="Parent & Teacher Access"
    >
      <svg
        viewBox="0 0 24 24"
        width="27"
        height="27"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.5-4.7A8.5 8.5 0 1 1 20.5 11.7Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 8.2c.2-.5.4-.5.7-.5h.5c.2 0 .3.1.4.4l.7 1.7c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.4 0 .6.5.9 1.3 1.6 2.2 2.1.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.2.3.4 0 .4-.2 1.1-.7 1.5-.5.4-1.1.6-1.8.4-1-.2-2.2-.8-3.4-1.9-1.1-1-1.8-2.2-2-3.2-.2-1 .1-1.8.4-2.5Z"
          fill="currentColor"
        />
      </svg>
    </Link>
  );
}
