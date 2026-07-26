type RenderDocumentInput = {
  title: string;
  styles: string;
  bodyHtml: string;
  script: string;
};

const BASE_STYLES = `
:root {
  --background: #eef6ec;
  --surface: #ffffff;
  --surface-muted: #e2f0dd;
  --foreground: #16301f;
  --muted: #4c6152;
  --primary: #2f855a;
  --on-primary: #ffffff;
  --border: #cfe6ca;
  --correct: #2f855a;
  --correct-foreground: #ffffff;
  --present: #b7791f;
  --present-foreground: #ffffff;
  --absent: #6b7d72;
  --absent-foreground: #ffffff;
  color-scheme: light;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px 16px;
  background: var(--background);
  color: var(--foreground);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
h1 { font-size: 1.5rem; }
.subtitle { color: var(--muted); font-size: 0.9rem; text-align: center; }
`;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function serializeData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function renderDocument({
  title,
  styles,
  bodyHtml,
  script,
}: RenderDocumentInput): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${BASE_STYLES}${styles}</style>
</head>
<body>
${bodyHtml}
<script>${script}</script>
</body>
</html>`;
}
