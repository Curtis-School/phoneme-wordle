export const SITE = {
  title: "Phoneme Wordle",
  subtitle: "Phoneme Activity Builder",
  assessment: "CSE3CWA — Assessment 1",
  author: "Curtis Bowman",
  studentNumber: "20962451",
} as const;

export type NavLink = {
  href: string;
  label: string;
};

export const PRIMARY_LINKS: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/wordle", label: "Wordle" },
  { href: "/word-search", label: "Word Search" },
] as const;

export const SECONDARY_LINKS: readonly NavLink[] = [
  { href: "/about", label: "About" },
  { href: "/settings", label: "Settings" },
] as const;

export const ALL_LINKS: readonly NavLink[] = [
  ...PRIMARY_LINKS,
  ...SECONDARY_LINKS,
] as const;
