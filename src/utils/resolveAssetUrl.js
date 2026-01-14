export function resolveAssetUrl(path) {
  if (!path) return null;

  const raw = String(path).trim();
  if (!raw) return null;

  // Already absolute (http/https/data/blob)
  if (/^(https?:)?\/\//i.test(raw) || /^(data|blob):/i.test(raw)) return raw;

  const base = (import.meta.env.VITE_API_URL || "http://localhost:3000/").trim();
  const baseNoSlash = base.endsWith("/") ? base.slice(0, -1) : base;
  const pathWithSlash = raw.startsWith("/") ? raw : `/${raw}`;

  return `${baseNoSlash}${pathWithSlash}`;
}

