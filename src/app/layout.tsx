import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    title: "Phaser Nextjs Template",
    description:
        "A Phaser 3 Next.js project template that demonstrates Next.js with React communication and uses Vite for bundling.",
    icons: { icon: "/favicon.png" },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
