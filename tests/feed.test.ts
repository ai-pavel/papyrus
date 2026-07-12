import { describe, it, expect } from "vitest";
import { buildFeed } from "../src/feed.js";
import type { Post } from "../src/content.js";

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    title: "Test Post",
    date: "2026-01-01",
    tags: ["test"],
    slug: "test-post",
    content: "This is test content.",
    filePath: "/tmp/test.md",
    ...overrides,
  };
}

describe("buildFeed", () => {
  it("produces a valid RSS 2.0 envelope", () => {
    const xml = buildFeed([makePost()], {
      title: "My Blog",
      baseUrl: "https://example.com",
    });
    expect(xml).toContain(`<?xml version="1.0" encoding="UTF-8"?>`);
    expect(xml).toContain(`<rss version="2.0">`);
    expect(xml).toContain("<title>My Blog</title>");
    expect(xml).toContain("<link>https://example.com</link>");
  });

  it("renders one item per post with link, guid, and pubDate", () => {
    const xml = buildFeed(
      [makePost({ slug: "hello-world", title: "Hello World" })],
      { title: "Blog", baseUrl: "https://example.com" }
    );
    expect(xml).toContain("<title>Hello World</title>");
    expect(xml).toContain("<link>https://example.com/posts/hello-world</link>");
    expect(xml).toContain("<guid>https://example.com/posts/hello-world</guid>");
    expect(xml).toContain("<pubDate>Thu, 01 Jan 2026 00:00:00 GMT</pubDate>");
  });

  it("falls back to the epoch for unparseable dates", () => {
    const xml = buildFeed([makePost({ date: "not-a-date" })], {
      title: "Blog",
      baseUrl: "https://example.com",
    });
    expect(xml).toContain("<pubDate>Thu, 01 Jan 1970 00:00:00 GMT</pubDate>");
  });

  it("sorts posts newest first", () => {
    const xml = buildFeed(
      [
        makePost({ slug: "old", title: "Old", date: "2025-01-01" }),
        makePost({ slug: "new", title: "New", date: "2026-06-01" }),
      ],
      { title: "Blog", baseUrl: "https://example.com" }
    );
    expect(xml.indexOf("<title>New</title>")).toBeLessThan(
      xml.indexOf("<title>Old</title>")
    );
  });

  it("respects the limit option", () => {
    const posts = [
      makePost({ slug: "a", date: "2026-01-01" }),
      makePost({ slug: "b", date: "2026-01-02" }),
      makePost({ slug: "c", date: "2026-01-03" }),
    ];
    const xml = buildFeed(posts, {
      title: "Blog",
      baseUrl: "https://example.com",
      limit: 2,
    });
    expect(xml).toContain("/posts/c");
    expect(xml).toContain("/posts/b");
    expect(xml).not.toContain("/posts/a");
  });

  it("escapes XML special characters in titles and descriptions", () => {
    const xml = buildFeed(
      [makePost({ title: `Tom & Jerry <"quoted">`, content: "a & b" })],
      { title: "Blog", baseUrl: "https://example.com" }
    );
    expect(xml).toContain(
      "<title>Tom &amp; Jerry &lt;&quot;quoted&quot;&gt;</title>"
    );
    expect(xml).toContain("<description>a &amp; b</description>");
    expect(xml).not.toContain(`<title>Tom & Jerry`);
  });

  it("strips markdown syntax from descriptions", () => {
    const xml = buildFeed(
      [makePost({ content: "# Heading\n\nSome **bold** [link](https://x.com)" })],
      { title: "Blog", baseUrl: "https://example.com" }
    );
    expect(xml).toContain(
      "<description>Heading Some bold link https://x.com</description>"
    );
  });

  it("falls back to the feed title when no description is given", () => {
    const xml = buildFeed([], {
      title: "Fallback Blog",
      baseUrl: "https://example.com",
    });
    expect(xml).toContain("<description>Fallback Blog</description>");
  });

  it("uses the explicit channel description when provided", () => {
    const xml = buildFeed([], {
      title: "Blog",
      baseUrl: "https://example.com",
      description: "A feed of everything",
    });
    expect(xml).toContain("<description>A feed of everything</description>");
  });

  it("strips trailing slashes from the base URL", () => {
    const xml = buildFeed([makePost({ slug: "p" })], {
      title: "Blog",
      baseUrl: "https://example.com///",
    });
    expect(xml).toContain("<link>https://example.com/posts/p</link>");
  });

  it("URL-encodes slugs in item links", () => {
    const xml = buildFeed([makePost({ slug: "hello world" })], {
      title: "Blog",
      baseUrl: "https://example.com",
    });
    expect(xml).toContain("/posts/hello%20world");
  });
});
