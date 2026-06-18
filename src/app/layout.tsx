import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    title: "다마고치",
    description: "브라우저에서 굴러가는 다마고치 스타일 가상 펫 게임이에요.",
    icons: { icon: "/favicon.png" },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <body>{children}</body>
        </html>
    );
}
