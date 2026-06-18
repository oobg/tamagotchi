"use client";

import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import styles from "@/styles/Home.module.css";

const inter = Inter({ subsets: ["latin"] });

const AppWithoutSSR = dynamic(() => import("@/App"), { ssr: false });

export default function Home() {
    return (
        <main className={`${styles.main} ${inter.className}`}>
            <AppWithoutSSR />
        </main>
    );
}
