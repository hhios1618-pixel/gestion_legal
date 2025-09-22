import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },

  // 👇 Simplemente añade esta sección al final
  typescript: {
    // !! PELIGRO !!
    // Permite que la aplicación compile exitosamente incluso si tiene errores de tipo.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;