import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "./components/global_components/NavBar";
import "./globals.css";
import Footer from "./components/global_components/Footer";
import { AuthProvider } from "./hooks/useAuth";
import { CookiesProvider } from "next-client-cookies/server";
import ThemeProvider from "./components/global_components/ThemeProvider";
import NavBarBackground from "./components/global_components/NavBarBackground";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { cookies } from "next/headers";

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

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;
  return (
    <CookiesProvider>
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <AuthProvider>
          <html lang="en" className={theme === "dark" ? "dark" : ""}>
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
      </AppRouterCacheProvider>
    </CookiesProvider>
  );
};

export default RootLayout;
