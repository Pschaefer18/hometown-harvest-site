import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hometown Harvest",
  description: "CSA Market Garden in Dexter, MI",
  openGraph: {
    title: "Hometown Harvest",
    description: "CSA Market Garden in Dexter, MI",
    url: "https://www.hometownharvestllc.com/", // Your deployed URL
    images: [
      {
        url: "/Users/paulschaefer/Documents/hometown-harvest-site/public/Hometown Harvest Logo.png", // Absolute URL to image
        width: 1200,
        height: 630,
        alt: "logo",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
