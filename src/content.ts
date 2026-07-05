import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface Post {
  title: string;
  date: string;
  tags: string[];
  slug: string;
  content: string;
  filePath: string;
}

export interface PostStore {
  posts: Map<string, Post>;
  loadAll(): void;
  loadFile(filePath: string): Post | null;
  removeFile(filePath: string): void;
  getAll(): Post[];
  getBySlug(slug: string): Post | undefined;
  getByTag(tag: string): Post[];
}

export function createPostStore(contentDir: string): PostStore {
  const posts = new Map<string, Post>();

  function loadFile(filePath: string): Post | null {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);

      const post: Post = {
        title: (data.title as string) ?? path.basename(filePath, ".md"),
        date: (data.date as string) ?? new Date().toISOString(),
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
        slug:
          (data.slug as string) ??
          path.basename(filePath, ".md").toLowerCase().replace(/\s+/g, "-"),
        content,
        filePath,
      };

      posts.set(filePath, post);
      return post;
    } catch (err) {
      // Do not silently drop content: surface the file and reason so an
      // operator can see why a post disappeared (e.g. a YAML typo).
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[content] failed to load ${filePath}: ${message}`);
      return null;
    }
  }

  function removeFile(filePath: string): void {
    posts.delete(filePath);
  }

  function loadAll(): void {
    posts.clear();
    if (!fs.existsSync(contentDir)) return;

    const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      loadFile(path.join(contentDir, file));
    }
  }

  function getAll(): Post[] {
    return Array.from(posts.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  function getBySlug(slug: string): Post | undefined {
    return Array.from(posts.values()).find((p) => p.slug === slug);
  }

  function getByTag(tag: string): Post[] {
    return getAll().filter((p) =>
      p.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
    );
  }

  return { posts, loadAll, loadFile, removeFile, getAll, getBySlug, getByTag };
}
