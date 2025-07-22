// no "use client" here ─ this is a Server Component
import "./globals.css";
import Providers from "./Providers";
import ClientLayout from "./ClientLayout";

export const metadata = {
  title: "TarkovTasks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex h-screen bg-gray-900 text-gray-100">
        {/* Wrap everything under Providers, then hand off to the client wrapper */}
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
