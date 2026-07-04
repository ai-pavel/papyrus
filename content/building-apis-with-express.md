---
title: Building REST APIs with Express
date: "2026-03-05"
tags:
  - nodejs
  - express
  - api
slug: building-apis-with-express
---

Express remains one of the most popular frameworks for building HTTP APIs in Node.js. Let's explore some best practices.

## Route Organization

Keep your routes modular. Group related endpoints and use the Express Router:

```typescript
import { Router } from "express";

const router = Router();
router.get("/", listItems);
router.get("/:id", getItem);
router.post("/", createItem);

export default router;
```

## Error Handling

Always add a global error handler middleware:

```typescript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});
```

## Response Types

Express can serve both JSON and HTML. Use `res.type()` to set the content type explicitly:

```typescript
res.type("html").send("<h1>Hello</h1>");
res.type("json").json({ message: "hello" });
```

## Testing

Use `supertest` to test your Express routes without starting a real server. It pairs well with vitest for fast, reliable tests.
