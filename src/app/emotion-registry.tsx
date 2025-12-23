"use client";

import * as React from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";

function createEmotionCache() {
  const cache = createCache({ key: "css", prepend: true });

  // Helps libraries expecting the legacy Emotion behavior.
  // Chakra + Emotion SSR examples commonly set this.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (cache as any).compat = true;

  let inserted: string[] = [];
  const prevInsert = cache.insert;

  cache.insert = (...args) => {
    const serialized = args[1];
    if (cache.inserted[serialized.name] === undefined) {
      inserted.push(serialized.name);
    }
    return prevInsert(...args);
  };

  const flush = () => {
    const prevInserted = inserted;
    inserted = [];
    return prevInserted;
  };

  return { cache, flush };
}

export default function EmotionRegistry(props: { children: React.ReactNode }) {
  const [{ cache, flush }] = React.useState(() => createEmotionCache());

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;

    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{props.children}</CacheProvider>;
}
