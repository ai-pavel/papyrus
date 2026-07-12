import type { Post } from "./content.js";

export interface FeedOptions {
  title: string;
  baseUrl: string;
  description?: string;
  limit?: number;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(0).toUTCString();
  }
  return parsed.toUTCString();
}

function summarize(content: string, maxLength = 200): string {
  const plain = content
    .replace(/[#*_`>!]|\[|\]|\(|\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxLength) {
    return plain;
  }
  const cut = plain.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

export function buildFeed(posts: Post[], options: FeedOptions): string {
  const limit = options.limit ?? 20;
  if (limit < 1) {
    throw new Error("feed limit must be at least 1");
  }
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const newestFirst = [...posts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);

  const items = newestFirst
    .map((post) => {
      const url = `${baseUrl}/posts/${encodeURIComponent(post.slug)}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${toRfc822(post.date)}</pubDate>
      <description>${escapeXml(summarize(post.content))}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(options.title)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(options.description ?? options.title)}</description>
${items}
  </channel>
</rss>
`;
}
