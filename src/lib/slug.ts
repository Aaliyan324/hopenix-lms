/**
 * Converts text (e.g. title or company name) into a clean, URL-safe slug.
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Returns the URL-safe slug for a company/publisher name.
 * Defaults to 'hopenix' if companyName is absent or empty.
 */
export function getCompanySlug(companyName?: string | null): string {
  if (!companyName || !companyName.trim()) return 'hopenix';
  const slug = slugify(companyName);
  return slug || 'hopenix';
}
