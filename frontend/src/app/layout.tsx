import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "./components/global_components/NavBar";
import "./globals.css";
import dynamic from "next/dynamic";
import Footer from "./components/global_components/Footer";
import { StyledEngineProvider } from "@mui/material/styles";
import { AuthProvider } from "./hooks/useAuth";
import { CookiesProvider } from "next-client-cookies/server";

const ThemeProvider = dynamic(
  () => import("./components/global_components/ThemeProvider"),
  { ssr: !!false }
);

const NavBarBackground = dynamic(
  () => import("./components/global_components/NavBarBackground"),
  { ssr: !!false }
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Game Hub",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <CookiesProvider>
      <StyledEngineProvider>
        <AuthProvider>
          <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
              <ThemeProvider>
                <NavBarBackground>
                  <NavBar />
                </NavBarBackground>
                <div id="main">{children}</div>
                <Footer />
              </ThemeProvider>
            </body>
          </html>
        </AuthProvider>
      </StyledEngineProvider>
    </CookiesProvider>
  );
};

export default RootLayout;
