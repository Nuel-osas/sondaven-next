import type { Metadata } from "next";
import "@/styles/source.css";
import "swiper/css/bundle";
import "lenis/dist/lenis.css";
import "@/styles/local.css";
export const metadata: Metadata = {
  title: "Son Daven — Resort Design Hotel",
  description:
    "A local recreation of Son Daven, the resort design hotel in Yaremche.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className="w-mod-js w-mod-ix">
      <body>{children}</body>
    </html>
  );
}
