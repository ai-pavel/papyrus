import { describe, it, expect } from "vitest";
import { createSearchIndex } from "../src/search.js";
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

describe("SearchIndex", () => {
  it("finds posts by title keyword", () => {
    const index = createSearchIndex();
    const posts = [
      makePost({ title: "TypeScript Guide", slug: "ts-guide" }),
      makePost({ title: "Python Basics", slug: "py-basics" }),
    ];
    index.rebuild(posts);
    const results = index.search("typescript");
    expect(results.length).toBe(1);
    expect(results[0].slug).toBe("ts-guide");
  });

  it("finds posts by content keyword", () => {
    const index = createSearchIndex();
    const posts = [
      makePost({ content: "Learn about Express routing", slug: "express" }),
      makePost({ content: "Database design patterns", slug: "db" }),
    ];
    index.rebuild(posts);
    const results = index.search("routing");
    expect(results.length).toBe(1);
    expect(results[0].slug).toBe("express");
  });

  it("finds posts by tag", () => {
    const index = createSearchIndex();
    const posts = [
      makePost({ tags: ["javascript", "web"], slug: "js" }),
      makePost({ tags: ["python"], slug: "py" }),
    ];
    index.rebuild(posts);
    const results = index.search("javascript");
    expect(results.length).toBe(1);
    expect(results[0].slug).toBe("js");
  });

  it("returns empty array for empty query", () => {
    const index = createSearchIndex();
    index.rebuild([makePost()]);
    expect(index.search("")).toEqual([]);
    expect(index.search("   ")).toEqual([]);
  });
});
