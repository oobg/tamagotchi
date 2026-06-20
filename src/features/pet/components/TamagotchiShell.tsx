"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PhaserGame, type IRefPhaserGame } from "@/PhaserGame";
import { usePetStore } from "@/stores/pet-store";
import { stageProgress } from "@/features/pet/logic/growth";
import type { PetStage } from "@/features/pet/types";

const TICK_INTERVAL_MS = 1000;

const STAGE_LABEL: Record<PetStage, string> = {
    egg: "알",
    baby: "베이비",
    child: "차일드",
    teen: "틴",
    adult: "어덜트",
};

const STAT_ROWS = [
    { key: "hunger" as const, icon: "🍖" },
    { key: "happiness" as const, icon: "♥" },
    { key: "energy" as const, icon: "⚡" },
    { key: "hygiene" as const, icon: "🛁" },
    { key: "health" as const, icon: "✚" },
];

type MenuKey = "feed" | "play" | "sleep" | "clean" | "heal" | "toilet" | "reset";

interface MenuItem {
    key: MenuKey;
    icon: string;
    label: string;
}

const MENU: MenuItem[] = [
    { key: "feed", icon: "🍖", label: "밥" },
    { key: "play", icon: "🎾", label: "놀기" },
    { key: "sleep", icon: "😴", label: "재우기" },
    { key: "clean", icon: "🧼", label: "씻기기" },
    { key: "heal", icon: "💊", label: "치료" },
    { key: "toilet", icon: "🚽", label: "변기" },
    { key: "reset", icon: "♻️", label: "리셋" },
];

function runMenuAction(key: MenuKey) {
    const s = usePetStore.getState();
    const sleeping = s.pet.isSleeping;
    switch (key) {
        case "feed":
            if (!sleeping) s.feed();
            break;
        case "play":
            if (!sleeping) s.play();
            break;
        case "sleep":
            if (sleeping) s.wake();
            else s.sleep();
            break;
        case "clean":
            s.clean();
            break;
        case "heal":
            s.heal();
            break;
        case "toilet":
            s.toilet();
            break;
        case "reset":
            s.resetPet();
            break;
    }
}

export function TamagotchiShell() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const pet = usePetStore((s) => s.pet);
    const [idx, setIdx] = useState(0);
    // 키보드 핸들러는 mount 시 한 번만 등록되므로 최신 idx를 ref로 따라가야
    // Enter 입력 시 현재 선택된 메뉴를 정확히 집어 든다.
    const idxRef = useRef(idx);
    useEffect(() => {
        idxRef.current = idx;
    }, [idx]);

    useEffect(() => {
        const { syncTime, tick } = usePetStore.getState();
        syncTime();
        const id = window.setInterval(tick, TICK_INTERVAL_MS);
        const onVis = () => {
            if (!document.hidden) syncTime();
        };
        document.addEventListener("visibilitychange", onVis);
        return () => {
            window.clearInterval(id);
            document.removeEventListener("visibilitychange", onVis);
        };
    }, []);

    const prev = () => setIdx((i) => (i - 1 + MENU.length) % MENU.length);
    const next = () => setIdx((i) => (i + 1) % MENU.length);
    const confirm = () => runMenuAction(MENU[idxRef.current].key);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") prev();
            else if (e.key === "ArrowRight") next();
            else if (e.key === "Enter" || e.key === " ")
                runMenuAction(MENU[idxRef.current].key);
            else return;
            e.preventDefault();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const ageMinutes = (pet.lastUpdatedAt - pet.bornAt) / 60_000;
    const progress = Math.round(stageProgress(ageMinutes, pet.stage) * 100);

    const sleepingMenu = MENU.map((m) =>
        m.key === "sleep" && pet.isSleeping ? { ...m, icon: "🌞", label: "깨우기" } : m,
    );

    return (
        <div
            className="flex w-full items-center justify-center overflow-hidden bg-zinc-950"
            style={{ minHeight: "100dvh" }}
        >
            <div
                className="relative"
                style={{ width: SHELL_W, height: SHELL_H }}
            >
                <div
                    className="absolute left-1/2 z-10 -translate-x-1/2"
                    style={{ top: 0 }}
                >
                    <LeafTop />
                </div>

                <div className="absolute" style={SHELL_STYLE} />

                <div className="absolute" style={LCD_FRAME_STYLE}>
                    <div className="relative h-full w-full overflow-hidden" style={LCD_SCREEN_STYLE}>
                        <div className="absolute inset-0">
                            <PhaserGame ref={phaserRef} />
                        </div>

                        <div className="pointer-events-none absolute inset-0">
                            <div
                                className="absolute left-0 right-0 top-0 flex items-center justify-between px-2 py-1 font-mono"
                                style={{ color: "#1f2c14", fontSize: 10, letterSpacing: 0.4 }}
                            >
                                <span>
                                    {STAGE_LABEL[pet.stage]} · {progress}%
                                </span>
                                <span style={{ fontWeight: 600 }}>{pet.name}</span>
                                <span>놓침 {pet.careMissCount}</span>
                            </div>

                            <div
                                className="absolute right-1 flex flex-col gap-[3px] font-mono"
                                style={{ color: "#1f2c14", fontSize: 9, top: 24 }}
                            >
                                {STAT_ROWS.map((s) => (
                                    <div key={s.key} className="flex items-center gap-1">
                                        <span style={{ width: 10, textAlign: "center" }}>
                                            {s.icon}
                                        </span>
                                        <div
                                            className="overflow-hidden rounded-sm"
                                            style={{
                                                width: 36,
                                                height: 5,
                                                background: "rgba(31,44,20,0.25)",
                                                border: "1px solid #1f2c14",
                                            }}
                                        >
                                            <div
                                                className="h-full"
                                                style={{
                                                    width: `${Math.round(pet[s.key])}%`,
                                                    background: "#1f2c14",
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div
                                className="absolute left-1 flex flex-col gap-0.5 font-mono"
                                style={{ color: "#1f2c14", fontSize: 9, top: 24 }}
                            >
                                {pet.isSleeping ? <span>💤 자는 중</span> : null}
                                {pet.isSick ? <span>🤒 아파요</span> : null}
                                {pet.poopCount > 0 ? <span>💩 × {pet.poopCount}</span> : null}
                            </div>

                            <div
                                className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-1 pb-1"
                                style={{ color: "#1f2c14" }}
                            >
                                {sleepingMenu.map((m, i) => (
                                    <div
                                        key={m.key}
                                        className="flex flex-col items-center"
                                        style={{ width: 32 }}
                                    >
                                        <span
                                            style={{
                                                display: "inline-block",
                                                width: 24,
                                                height: 24,
                                                lineHeight: "24px",
                                                textAlign: "center",
                                                fontSize: 14,
                                                borderRadius: 5,
                                                background:
                                                    i === idx
                                                        ? "#1f2c14"
                                                        : "rgba(31,44,20,0.08)",
                                                boxShadow:
                                                    i === idx
                                                        ? "0 0 0 2px #c2d491, 0 0 0 3px #1f2c14"
                                                        : "none",
                                                filter: i === idx ? "none" : "grayscale(0.4)",
                                                opacity: i === idx ? 1 : 0.85,
                                            }}
                                        >
                                            {m.icon}
                                        </span>
                                        {i === idx ? (
                                            <span
                                                className="font-mono"
                                                style={{
                                                    fontSize: 9,
                                                    marginTop: 1,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {m.label}
                                            </span>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="absolute flex items-center justify-around"
                    style={{
                        left: 56,
                        right: 56,
                        top: BUTTON_ROW_TOP,
                        height: 64,
                    }}
                >
                    <HwButton ariaLabel="이전" onClick={prev}>
                        ◀
                    </HwButton>
                    <HwButton ariaLabel="확정" onClick={confirm} primary>
                        ●
                    </HwButton>
                    <HwButton ariaLabel="다음" onClick={next}>
                        ▶
                    </HwButton>
                </div>
            </div>
        </div>
    );
}

// 디바이스 셸은 LCD를 충분히 감싸도록 LCD 폭의 약 1.45배로 잡는다.
// (화면 자체 크기는 유지하고, 셸이 화면을 여유 있게 둘러싸야 다마고치 비례.)
const SHELL_W = 372;
const SHELL_H = 532;
const SHELL_BODY_TOP = 36;
const LCD_W = 256;
const LCD_H = 224;
const LCD_LEFT = (SHELL_W - LCD_W) / 2;
const LCD_TOP = 140;
const BUTTON_ROW_TOP = LCD_TOP + LCD_H + 38;

const SHELL_STYLE: CSSProperties = {
    top: SHELL_BODY_TOP,
    left: 0,
    right: 0,
    bottom: 0,
    background:
        "radial-gradient(circle at 32% 24%, #fbf5e0 0%, #f0e6c6 45%, #d6c499 80%, #b89e6c 100%)",
    borderRadius: "50% 50% 47% 47% / 56% 56% 44% 44%",
    border: "3px solid #8a7242",
    boxShadow:
        "inset -10px -16px 28px rgba(80,55,15,0.25), inset 10px 14px 28px rgba(255,250,220,0.6), 0 24px 40px rgba(0,0,0,0.55)",
};

const LCD_FRAME_STYLE: CSSProperties = {
    top: LCD_TOP,
    left: LCD_LEFT,
    width: LCD_W,
    height: LCD_H,
    background: "#3a4a2a",
    borderRadius: 16,
    padding: 6,
    boxShadow:
        "inset 2px 2px 5px rgba(0,0,0,0.7), inset -2px -2px 4px rgba(255,255,255,0.05), 0 2px 0 rgba(255,255,255,0.35)",
    border: "2px solid #2a3a1a",
};

const LCD_SCREEN_STYLE: CSSProperties = {
    background: "linear-gradient(180deg, #c2d491 0%, #a6bf78 55%, #93ad62 100%)",
    borderRadius: 8,
    boxShadow: "inset 0 0 18px rgba(31,44,20,0.18)",
};

function HwButton({
    children,
    onClick,
    primary,
    ariaLabel,
}: {
    children: React.ReactNode;
    onClick: () => void;
    primary?: boolean;
    ariaLabel: string;
}) {
    const size = primary ? 62 : 54;
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            className="select-none transition-transform active:translate-y-[2px]"
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background:
                    "radial-gradient(circle at 32% 28%, #ffe87a 0%, #e9c34a 45%, #b48a18 80%, #7c5d10 100%)",
                border: "2px solid #6e520e",
                boxShadow:
                    "inset -2px -3px 5px rgba(60,40,0,0.4), inset 2px 2px 4px rgba(255,255,200,0.55), 0 4px 0 #6e520e, 0 6px 8px rgba(0,0,0,0.4)",
                color: "#5a4408",
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: primary ? 18 : 16,
                cursor: "pointer",
                lineHeight: 1,
            }}
        >
            {children}
        </button>
    );
}

function LeafTop() {
    return (
        <svg width="180" height="92" viewBox="0 0 170 90" fill="none" aria-hidden>
            <defs>
                <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7ab84d" />
                    <stop offset="100%" stopColor="#3b6a22" />
                </linearGradient>
                <radialGradient id="bulbGrad" cx="35%" cy="30%">
                    <stop offset="0%" stopColor="#fff2a3" />
                    <stop offset="60%" stopColor="#e9c34a" />
                    <stop offset="100%" stopColor="#a07d10" />
                </radialGradient>
            </defs>
            <path
                d="M85 90 Q50 80 38 50 Q42 22 64 16 Q72 32 82 60 Z"
                fill="url(#leafGrad)"
                stroke="#2c5320"
                strokeWidth="2"
            />
            <path
                d="M85 90 Q120 80 132 50 Q128 22 106 16 Q98 32 88 60 Z"
                fill="url(#leafGrad)"
                stroke="#2c5320"
                strokeWidth="2"
            />
            <circle cx="64" cy="16" r="10" fill="url(#bulbGrad)" stroke="#7e6112" strokeWidth="1.8" />
            <circle cx="106" cy="16" r="10" fill="url(#bulbGrad)" stroke="#7e6112" strokeWidth="1.8" />
        </svg>
    );
}
