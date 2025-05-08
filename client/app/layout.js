import "./globals.css";
import "./styles.css";
import { AuthProvider } from "./context/AuthContext";

export const metadata = {
  title: "FitFusion",
  description: "Your ultimate fitness companion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
