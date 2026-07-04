---
title: TypeScript Tips for Node.js Developers
date: "2026-02-10"
tags:
  - typescript
  - nodejs
  - tutorial
slug: typescript-tips
---

TypeScript brings type safety and better tooling to Node.js development. Here are some practical tips.

## Use Strict Mode

Always enable `strict: true` in your `tsconfig.json`. It catches many common bugs at compile time.

## Prefer Interfaces for Object Shapes

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}
```

Interfaces are more extensible and produce better error messages than type aliases for object shapes.

## Use `satisfies` for Type Checking

The `satisfies` operator lets you validate a value matches a type without widening it:

```typescript
const config = {
  port: 3000,
  host: "localhost",
} satisfies Record<string, string | number>;
```

## ESM in Node.js

Set `"type": "module"` in your `package.json` and use `"module": "Node16"` in tsconfig for proper ESM support. Remember to use `.js` extensions in your import paths.
