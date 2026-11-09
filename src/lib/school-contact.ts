
export const SCHOOL_PHONE_NUMBER = "+2348149774655";
export const SCHOOL_WHATSAPP_NUMBER = "2348149774655";

export function getSchoolTelLink() {
  return `tel:${SCHOOL_PHONE_NUMBER}`;
}

export function getSchoolWhatsAppUrl(message: string) {
  const number = SCHOOL_WHATSAPP_NUMBER.replace(/\D/g, "");

  if (!number || number.includes("X")) {
    return null;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
