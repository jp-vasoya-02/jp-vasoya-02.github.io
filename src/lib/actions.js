import { profile } from "../data/portfolio";

export function toast(message) {
  window.dispatchEvent(new CustomEvent("app:toast", { detail: message }));
}

export async function copyEmail() {
  try {
    await navigator.clipboard.writeText(profile.email);
    toast(`Copied ${profile.email}`);
  } catch {
    window.location.href = `mailto:${profile.email}`;
  }
}

export function openResume() {
  window.open(profile.resume, "_blank", "noopener");
}

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent("app:palette"));
}

export const navSections = [
  { id: "agent", label: "Ask my agent" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];
