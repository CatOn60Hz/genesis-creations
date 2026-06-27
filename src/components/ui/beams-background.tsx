"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useIsTouch } from "@/components/hooks/use-is-touch";

interface BeamsBackgroundProps {
    className?: string;
    children?: React.ReactNode;
    intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
    x: number;
    y: number;
    width: number;
    length: number;
    angle: number;
    speed: number;
    opacity: number;
    hue: number;
    pulse: number;
    pulseSpeed: number;
}

// Genesis Creations crimson range (≈ #cb2957) instead of the original cyan/blue.
const HUE_BASE = 330;
const HUE_SPREAD = 24;

function createBeam(width: number, height: number): Beam {
    // Randomise the lean direction so beams sweep from both the left and the
    // right instead of all tilting the same way (which pooled light on one side).
    const sign = Math.random() < 0.5 ? -1 : 1;
    const angle = sign * (25 + Math.random() * 10);
    return {
        x: Math.random() * width * 1.5 - width * 0.25,
        y: Math.random() * height * 1.5 - height * 0.25,
        width: 30 + Math.random() * 60,
        length: height * 2.5,
        angle: angle,
        speed: 0.6 + Math.random() * 1.2,
        opacity: 0.12 + Math.random() * 0.16,
        hue: HUE_BASE + Math.random() * HUE_SPREAD,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
    };
}

export function BeamsBackground({
    className,
    children,
    intensity = "subtle",
}: BeamsBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const beamsRef = useRef<Beam[]>([]);
    const animationFrameRef = useRef<number>(0);
    const MINIMUM_BEAMS = 12;
    // Per-frame canvas blur is the single biggest mobile perf cost on the site.
    // On touch devices we drop the animation entirely and paint a cheap static
    // crimson wash instead.
    const isTouch = useIsTouch();

    const opacityMap = {
        subtle: 0.7,
        medium: 0.85,
        strong: 1,
    };

    useEffect(() => {
        if (isTouch) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const updateCanvasSize = () => {
            // The canvas is heavily blurred, so rendering above 1x is wasted
            // pixels — cap the DPR to keep the per-frame cost low.
            const dpr = 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);

            const totalBeams = MINIMUM_BEAMS * 1.5;
            beamsRef.current = Array.from({ length: totalBeams }, () =>
                createBeam(canvas.width, canvas.height)
            );
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        function resetBeam(beam: Beam, index: number, totalBeams: number) {
            if (!canvas) return beam;

            const column = index % 3;
            const spacing = canvas.width / 3;

            beam.y = canvas.height + 100;
            beam.x =
                column * spacing +
                spacing / 2 +
                (Math.random() - 0.5) * spacing * 0.5;
            beam.width = 100 + Math.random() * 100;
            beam.speed = 0.5 + Math.random() * 0.4;
            beam.hue = HUE_BASE + (index * HUE_SPREAD) / totalBeams;
            beam.opacity = 0.2 + Math.random() * 0.1;
            return beam;
        }

        function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
            ctx.save();
            ctx.translate(beam.x, beam.y);
            ctx.rotate((beam.angle * Math.PI) / 180);

            // Calculate pulsing opacity
            const pulsingOpacity =
                beam.opacity *
                (0.8 + Math.sin(beam.pulse) * 0.2) *
                opacityMap[intensity];

            const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

            // Crimson gradient with multiple color stops
            gradient.addColorStop(0, `hsla(${beam.hue}, 75%, 58%, 0)`);
            gradient.addColorStop(
                0.1,
                `hsla(${beam.hue}, 75%, 58%, ${pulsingOpacity * 0.5})`
            );
            gradient.addColorStop(
                0.4,
                `hsla(${beam.hue}, 75%, 58%, ${pulsingOpacity})`
            );
            gradient.addColorStop(
                0.6,
                `hsla(${beam.hue}, 75%, 58%, ${pulsingOpacity})`
            );
            gradient.addColorStop(
                0.9,
                `hsla(${beam.hue}, 75%, 58%, ${pulsingOpacity * 0.5})`
            );
            gradient.addColorStop(1, `hsla(${beam.hue}, 75%, 58%, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
            ctx.restore();
        }

        function animate() {
            if (!canvas || !ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // No per-frame `ctx.filter = blur()` here — a canvas blur filter is
            // CPU-bound and was the dominant main-thread cost. The beams already
            // have soft gradient edges, and the canvas ELEMENT carries a cheap
            // GPU-composited CSS blur instead (see the style below).

            const totalBeams = beamsRef.current.length;
            beamsRef.current.forEach((beam, index) => {
                beam.y -= beam.speed;
                beam.pulse += beam.pulseSpeed;

                // Reset beam when it goes off screen
                if (beam.y + beam.length < -100) {
                    resetBeam(beam, index, totalBeams);
                }

                drawBeam(ctx, beam);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [intensity, isTouch]);

    return (
        <div
            className={cn(
                "relative h-full w-full overflow-hidden bg-[#050505]",
                className
            )}
        >
            {isTouch ? (
                // Static crimson wash — same look, none of the per-frame cost.
                <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(203,41,87,0.22),transparent_70%),radial-gradient(45%_40%_at_82%_62%,rgba(203,41,87,0.14),transparent_70%)]" />
            ) : (
                // The CSS `blur` here is GPU-composited (one cheap pass), unlike
                // the old per-frame canvas filter + animated backdrop-blur.
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0"
                    style={{ filter: "blur(40px)" }}
                />
            )}

            {children && <div className="relative z-10 h-full w-full">{children}</div>}
        </div>
    );
}
