import type { Post } from "./content.js";

export interface SearchIndex {
  rebuild(posts: Post[]): void;
  search(query: string): Post[];
}

export function createSearchIndex(): SearchIndex {
  // Inverted index: token -> Set of slugs
  const index = new Map<string, Set<string>>();
  // Sorted list of all indexed tokens, used for O(log n) prefix range queries
  // instead of scanning the whole vocabulary on every search.
  let sortedTokens: string[] = [];
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

    sortedTokens = Array.from(index.keys()).sort();
  }

  // Index of the first element in `sortedTokens` that is >= `target`.
  function lowerBound(target: string): number {
    let lo = 0;
    let hi = sortedTokens.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (sortedTokens[mid] < target) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }

  function addMatches(slugs: Set<string>, scores: Map<string, number>): void {
    for (const slug of slugs) {
      scores.set(slug, (scores.get(slug) ?? 0) + 1);
    }
  }

  function search(query: string): Post[] {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    // Score each post by number of matching query tokens.
    const scores = new Map<string, number>();

    for (const token of queryTokens) {
      const matched = new Set<string>();

      // 1. Forward prefix match: indexed tokens that start with `token`.
      //    Walk the sorted vocabulary only from the lower bound, stopping as
      //    soon as the prefix no longer matches (a bounded range, not a full
      //    scan). Exact matches are included here (token === indexed token).
      for (let i = lowerBound(token); i < sortedTokens.length; i++) {
        const indexedToken = sortedTokens[i];
        if (!indexedToken.startsWith(token)) break;
        for (const slug of index.get(indexedToken)!) matched.add(slug);
      }

      // 2. Reverse prefix match: indexed tokens that are a prefix of `token`
      //    (e.g. query "designing" should match indexed "design"). Only the
      //    query token's own prefixes need a direct O(1) lookup each.
      for (let len = 2; len < token.length; len++) {
        const prefix = token.slice(0, len);
        const slugs = index.get(prefix);
        if (slugs) for (const slug of slugs) matched.add(slug);
      }

      addMatches(matched, scores);
    }

    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([slug]) => postsBySlug.get(slug))
      .filter((p): p is Post => p !== undefined);
  }

  return { rebuild, search };
}
