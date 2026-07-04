import type { Post } from "./content.js";

export interface SearchIndex {
  rebuild(posts: Post[]): void;
  search(query: string): Post[];
}

export function createSearchIndex(): SearchIndex {
  // Inverted index: token -> Set of slugs
  const index = new Map<string, Set<string>>();
  let postsBySlug = new Map<string, Post>();

  function tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1);
  }

  function rebuild(posts: Post[]): void {
    index.clear();
    postsBySlug = new Map(posts.map((p) => [p.slug, p]));

    for (const post of posts) {
      const text = `${post.title} ${post.tags.join(" ")} ${post.content}`;
      const tokens = tokenize(text);

      for (const token of tokens) {
        if (!index.has(token)) {
          index.set(token, new Set());
        }
        index.get(token)!.add(post.slug);
      }
    }
  }

  function search(query: string): Post[] {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    // Score each post by number of matching query tokens
    const scores = new Map<string, number>();

    for (const token of queryTokens) {
      // Support prefix matching
      for (const [indexedToken, slugs] of index) {
        if (indexedToken.startsWith(token) || token.startsWith(indexedToken)) {
          for (const slug of slugs) {
            scores.set(slug, (scores.get(slug) ?? 0) + 1);
          }
        }
      }
    }

    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([slug]) => postsBySlug.get(slug))
      .filter((p): p is Post => p !== undefined);
  }

  return { rebuild, search };
}
