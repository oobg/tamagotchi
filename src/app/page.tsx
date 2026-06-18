"use client";

import { Inter } from "next/font/google";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

const AppWithoutSSR = dynamic(() => import("@/App"), { ssr: false });

export default function Home() {
    return (
        <main className={`h-screen w-screen overflow-hidden bg-zinc-950 ${inter.className}`}>
            <AppWithoutSSR />
        </main>
    );
}
