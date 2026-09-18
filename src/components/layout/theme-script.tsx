/**
 * Applies the stored theme before first paint. Without this the page renders
 * light, then flips — a flash every dark-mode user notices.
 *
 * Kept as a raw string: it must run before React hydrates.
 */
const script = `(function(){try{var t=localStorage.getItem("lingosaas-theme")||"SYSTEM";var d=t==="DARK"||(t==="SYSTEM"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} suppressHydrationWarning />;
}
