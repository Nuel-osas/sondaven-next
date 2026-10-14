"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
export default function Experience({ children, language, route }) {
  const ref = useRef(null);
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    let cleanup;
    document.documentElement.lang = language;
    import("@/lib/experience").then(({ mountExperience }) => {
      if (!cancelled)
        cleanup = mountExperience(ref.current, (url) => router.push(url));
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [language, route, router]);
  return (
    <div ref={ref} data-experience={route} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
