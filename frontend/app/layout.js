import "./globals.css";

export const metadata = {
  title: "PropLead CRM",
  description: "Real estate lead management dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
