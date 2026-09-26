export const SITE = {
  title: "Phoneme Wordle",
  subtitle: "Phoneme Activity Builder",
  assessment: "CSE3CWA — Assessment 2",
  author: "Curtis Bowman",
  studentNumber: "20962451",
  repoUrl: "https://github.com/Curtis-School/phoneme-wordle",
  demos: {
    assessment1: {
      url: "https://latrobe.zoom.us/rec/share/2l4gzKB4A9G88Aeli_aN6VdWdanGJvFJU0Kpjo_EXoMNQdmDrPC6ao6XhFWbegbY.3xcVJZcbhdCcOLI6?startTime=1786237421000",
      passcode: "3P2H2S2",
    },
    assessment2: {
      url: "https://latrobe.zoom.us/rec/share/p-PJAbJvhv7wTDyit_l4ULW6CIwAZgUY8SQtBg6kVIGzk28Z-Xkj-HWtOl3sKoSg.1MZhEB8QU53NEySl",
      passcode: "=^Sath0!",
    },
  },
} as const;

export type NavLink = {
  href: string;
  label: string;
};

export const PRIMARY_LINKS: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/wordle", label: "Wordle" },
  { href: "/word-search", label: "Word Search" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/library", label: "Library" },
] as const;

export const SECONDARY_LINKS: readonly NavLink[] = [
  { href: "/about", label: "About" },
  { href: "/settings", label: "Settings" },
] as const;

export const ALL_LINKS: readonly NavLink[] = [
  ...PRIMARY_LINKS,
  ...SECONDARY_LINKS,
] as const;
