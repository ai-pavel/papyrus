import { describe, it, expect } from "vitest";
import { renderMarkdown, renderPost } from "../src/renderer.js";
import type { Post } from "../src/content.js";

describe("renderMarkdown", () => {
  it("converts markdown to HTML", () => {
    const html = renderMarkdown("# Hello\n\nA paragraph.");
    expect(html).toContain("<h1>Hello</h1>");
    expect(html).toContain("<p>A paragraph.</p>");
  });

  it("renders code blocks", () => {
    const html = renderMarkdown("```js\nconsole.log('hi');\n```");
    expect(html).toContain("<code");
    expect(html).toContain("console.log");
  });
});

describe("renderPost", () => {
  it("produces a full HTML page with title and content", () => {
    const post: Post = {
      title: "Test Title",
      date: "2026-01-01",
      tags: ["alpha", "beta"],
      slug: "test-title",
      content: "Some **bold** text.",
      filePath: "/tmp/test.md",
    };
    const html = renderPost(post);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Test Title");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("alpha");
    expect(html).toContain("beta");
  });
});
