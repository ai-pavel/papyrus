import { describe, it, expect } from "vitest";
import path from "node:path";
import { createPostStore } from "../src/content.js";

const CONTENT_DIR = path.resolve(import.meta.dirname, "../content");

describe("PostStore", () => {
  it("loads all markdown files from content directory", () => {
    const store = createPostStore(CONTENT_DIR);
    store.loadAll();
    const posts = store.getAll();
    expect(posts.length).toBe(3);
  });

  it("retrieves a post by slug", () => {
    const store = createPostStore(CONTENT_DIR);
    store.loadAll();
    const post = store.getBySlug("getting-started");
    expect(post).toBeDefined();
    expect(post!.title).toBe("Getting Started with Markdown CMS");
  });

  it("filters posts by tag", () => {
    const store = createPostStore(CONTENT_DIR);
    store.loadAll();
    const posts = store.getByTag("nodejs");
    expect(posts.length).toBe(2);
  });

  it("sorts posts by date descending", () => {
    const store = createPostStore(CONTENT_DIR);
    store.loadAll();
    const posts = store.getAll();
    expect(posts[0].slug).toBe("building-apis-with-express");
    expect(posts[2].slug).toBe("getting-started");
  });

  it("handles nonexistent content directory", () => {
    const store = createPostStore("/nonexistent/dir");
    store.loadAll();
    expect(store.getAll()).toEqual([]);
  });
});
