---
title: Getting Started with Markdown CMS
date: "2026-01-15"
tags:
  - tutorial
  - getting-started
slug: getting-started
---

Welcome to **Markdown CMS**, a flat-file content management system built with TypeScript and Node.js.

## Features

- Write content in Markdown with YAML frontmatter
- Full-text search with an inverted index
- Tag-based filtering
- Live preview with file watching
- Clean, rendered HTML output

## Quick Start

1. Add `.md` files to the `content/` directory
2. Start the server with `npm run dev`
3. Visit `http://localhost:3000/posts`

Each Markdown file should include frontmatter like this:

```yaml
---
title: My Post Title
date: "2026-01-01"
tags:
  - example
slug: my-post
---
```

Happy writing!
