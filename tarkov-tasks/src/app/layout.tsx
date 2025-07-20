import "./globals.css";
import Providers from "./Providers";
import { ReactNode } from "react";

export const metadata = {
  title: "TarkovTasks",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-gray-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
