import { Playfair_Display, Caveat, EB_Garamond } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "./components/AudioProvider";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "900"],
  style: ["normal", "italic"],
});

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const garamond = EB_Garamond({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "The Semester",
  description: "A love letter, told one envelope at a time.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${caveat.variable} ${garamond.variable}`}
    >
      <body>
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  );
}
