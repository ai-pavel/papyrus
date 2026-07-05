import chokidar, { type FSWatcher } from "chokidar";
import type { PostStore } from "./content.js";
import type { SearchIndex } from "./search.js";

export interface Watcher {
  start(): void;
  close(): Promise<void>;
}

export function createWatcher(
  contentDir: string,
  store: PostStore,
  searchIndex: SearchIndex,
  onChange?: () => void
): Watcher {
  let watcher: FSWatcher | null = null;

  function rebuildIndex(): void {
    searchIndex.rebuild(store.getAll());
    onChange?.();
  }

  function start(): void {
    watcher = chokidar.watch(`${contentDir}/**/*.md`, {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
    });

    watcher.on("add", (filePath: string) => {
      console.log(`[watcher] added: ${filePath}`);
      if (!store.loadFile(filePath)) {
        console.warn(`[watcher] failed to load added file: ${filePath}`);
      }
      rebuildIndex();
    });

    watcher.on("change", (filePath: string) => {
      console.log(`[watcher] changed: ${filePath}`);
      if (!store.loadFile(filePath)) {
        console.warn(`[watcher] failed to load changed file: ${filePath}`);
      }
      rebuildIndex();
    });

    watcher.on("unlink", (filePath: string) => {
      console.log(`[watcher] removed: ${filePath}`);
      store.removeFile(filePath);
      rebuildIndex();
    });
  }

  async function close(): Promise<void> {
    if (watcher) {
      await watcher.close();
      watcher = null;
    }
  }

  return { start, close };
}
