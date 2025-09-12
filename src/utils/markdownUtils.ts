/**
 * Parse markdown-style bold text (**text**) and convert to HTML strong tags
 */
export function parseMarkdown(text: string): string {
  if (!text) return '';
  
  // Replace **text** with <strong>text</strong>
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

/**
 * React component prop helper for rendering markdown text
 */
export function getMarkdownHTML(text: string) {
  return { __html: parseMarkdown(text) };
}