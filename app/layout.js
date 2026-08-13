import "./globals.css";

export const metadata = {
  title: "Enat Kitchen | Menu",
  description: "Explore the Enat Kitchen menu—Ethiopian favorites, breakfast, burgers, pizza, fresh juices and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
