"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GooeyTextProps {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  className?: string;
  textClassName?: string;
  /** Optional image (e.g. the company logo) appended as a frame in the morph
   *  cycle. It fades cleanly instead of going through the gooey threshold
   *  filter, so a detailed/colour logo stays crisp while the words still melt. */
  logo?: string;
  logoClassName?: string;
  logoAlt?: string;
}

export function GooeyText({
  texts,
  morphTime = 1,
  cooldownTime = 0.25,
  className,
  textClassName,
  logo,
  logoClassName,
  logoAlt = "",
}: GooeyTextProps) {
  const text1Ref = React.useRef<HTMLSpanElement>(null);
  const text2Ref = React.useRef<HTMLSpanElement>(null);
  const logoRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    // The morph cycles through these frames. A `null` frame is the logo, which
    // fades cleanly (it lives outside the threshold filter) while words melt.
    // The logo goes first so it's the very first thing shown.
    const frames: (string | null)[] = logo ? [null, ...texts] : [...texts];
    const n = frames.length;

    // Keep the blur low and ramp it gently so the morph stays tight and
    // legible instead of melting into blobs mid-transition.
    const maxBlur = 8;

    // Drive a single frame to "visibility" v (1 = sharp & solid, 0 = gone).
    // Text frames melt via blur + the alpha threshold; the logo just fades.
    const setText = (el: HTMLSpanElement | null, v: number) => {
      if (!el) return;
      const f = Math.max(v, 0.0001);
      el.style.filter = `blur(${Math.min(6 / f - 6, maxBlur)}px)`;
      el.style.opacity = `${Math.pow(f, 0.4) * 100}%`;
    };
    const setLogo = (v: number) => {
      const el = logoRef.current;
      if (!el) return;
      el.style.filter = `blur(${(1 - Math.max(v, 0)) * 4}px)`;
      el.style.opacity = `${Math.pow(Math.max(v, 0), 0.6) * 100}%`;
    };

    let index = n - 1; // current "from" frame; first cooldown reveals frame 0
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;
    // Once a frame has fully settled we stop re-applying styles every tick —
    // otherwise the SVG threshold filter re-rasterizes on every cooldown frame
    // for no visible change, which is a needless main-thread cost.
    let settled = false;
    let active = { from: frames[index], to: frames[(index + 1) % n] };

    // Assign content to the slots for the transition frames[index] -> next,
    // hide everything first so stale frames don't bleed through.
    const prepare = () => {
      if (text1Ref.current) text1Ref.current.style.opacity = "0%";
      if (text2Ref.current) text2Ref.current.style.opacity = "0%";
      setLogo(0);

      const from = frames[index];
      const to = frames[(index + 1) % n];
      if (from !== null && text1Ref.current) text1Ref.current.textContent = from;
      if (to !== null && text2Ref.current) text2Ref.current.textContent = to;
      active = { from, to };
    };

    // fraction 0 -> 1: the "from" frame fades out, the "to" frame fades in.
    const renderFraction = (fraction: number) => {
      const outV = 1 - fraction;
      const inV = fraction;
      if (active.from === null) setLogo(outV);
      else setText(text1Ref.current, outV);
      if (active.to === null) setLogo(inV);
      else setText(text2Ref.current, inV);
    };

    const doCooldown = () => {
      morph = 0;
      if (!settled) {
        renderFraction(1); // settle fully on the current "to" frame, once
        settled = true;
      }
    };

    const doMorph = () => {
      settled = false;
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;

      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }

      renderFraction(fraction);
    };

    prepare();

    let rafId = 0;
    function animate() {
      rafId = requestAnimationFrame(animate);
      const newTime = new Date();
      const shouldAdvance = cooldown > 0;
      let dt = (newTime.getTime() - time.getTime()) / 1000;
      // Clamp large deltas (e.g. after the tab was backgrounded and rAF paused)
      // so the morph resumes smoothly instead of lurching forward.
      if (dt > 0.1) dt = 0.1;
      time = newTime;

      cooldown -= dt;

      if (cooldown <= 0) {
        if (shouldAdvance) {
          index = (index + 1) % n;
          prepare();
        }
        doMorph();
      } else {
        doCooldown();
      }
    }

    animate();

    return () => cancelAnimationFrame(rafId);
  }, [texts, morphTime, cooldownTime, logo]);

  return (
    <div className={cn("relative", className)}>
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>

      {/* Gooey text layer */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ filter: "url(#threshold)" }}
      >
        <span
          ref={text1Ref}
          className={cn(
            "absolute left-1/2 top-1/2 inline-block -translate-x-1/2 -translate-y-1/2 select-none text-center text-6xl md:text-[60pt]",
            "text-foreground",
            textClassName
          )}
        />
        <span
          ref={text2Ref}
          className={cn(
            "absolute left-1/2 top-1/2 inline-block -translate-x-1/2 -translate-y-1/2 select-none text-center text-6xl md:text-[60pt]",
            "text-foreground",
            textClassName
          )}
        />
      </div>

      {/* Clean logo layer — outside the threshold filter so it stays crisp */}
      {logo && (
        <img
          ref={logoRef}
          src={logo}
          alt={logoAlt}
          aria-hidden={logoAlt ? undefined : true}
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none object-contain opacity-0",
            "h-[150%] w-auto max-w-none",
            logoClassName
          )}
        />
      )}
    </div>
  );
}
