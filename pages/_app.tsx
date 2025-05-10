// pages/_app.tsx
import "@/styles/globals.css";
import 'leaflet/dist/leaflet.css';  // Importa el CSS de Leaflet
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
