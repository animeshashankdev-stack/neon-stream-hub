import { useState, useEffect, useRef, ImgHTMLAttributes } from "react";
import { cleanImageUrl, PLACEHOLDER_POSTER } from "@/lib/imageUrl";

interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  fallbacks?: (string | null | undefined)[];
  /** Final placeholder used only when every candidate (incl. fallbacks) has failed. */
  placeholder?: string;
  /** Show a small debug overlay with original/cleaned/final URLs (?debug=images). */
  debugLabel?: string;
}

function isDebugMode(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debug") === "images";
}

/**
 * Image with per-source retry: cleans the URL, walks fallbacks on error,
 * and only renders the global placeholder after every candidate fails.
 */
export function SmartImage({
  src,
  fallbacks = [],
  placeholder = PLACEHOLDER_POSTER,
  debugLabel,
  alt = "",
  ...rest
}: SmartImageProps) {
  const candidates = (() => {
    const list: string[] = [];
    const push = (u?: string | null) => {
      const c = cleanImageUrl(u);
      if (c && !list.includes(c)) list.push(c);
    };
    push(src);
    fallbacks.forEach(push);
    list.push(placeholder);
    return list;
  })();

  const [idx, setIdx] = useState(0);
  const triedRef = useRef(new Set<number>());
  const debug = isDebugMode();

  useEffect(() => {
    setIdx(0);
    triedRef.current = new Set();
  }, [src]);

  const current = candidates[idx] || placeholder;

  return (
    <>
      <img
        {...rest}
        src={current}
        alt={alt}
        onError={(e) => {
          if (triedRef.current.has(idx)) return;
          triedRef.current.add(idx);
          if (idx < candidates.length - 1) {
            setIdx((i) => i + 1);
          }
          rest.onError?.(e);
        }}
      />
      {debug && (
        <div
          style={{
            position: "absolute",
            inset: "auto 0 0 0",
            background: "rgba(0,0,0,0.75)",
            color: "#0ff",
            fontSize: 9,
            lineHeight: 1.3,
            padding: "4px 6px",
            fontFamily: "monospace",
            pointerEvents: "none",
            zIndex: 50,
            wordBreak: "break-all",
          }}
        >
          <div>{debugLabel}</div>
          <div>orig: {String(src ?? "—").slice(0, 80)}</div>
          <div>clean: {String(cleanImageUrl(src) ?? "—").slice(0, 80)}</div>
          <div>final: {current.slice(0, 80)}</div>
        </div>
      )}
    </>
  );
}

export default SmartImage;