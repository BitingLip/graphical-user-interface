import { defineConfig } from "vite";
import type { ViteDevServer } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";

type NextFunction = (err?: any) => void;

function canonicalRedirectPlugin(primaryHost: string) {
  return {
    name: "canonical-redirect",
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: NextFunction) => {
        const { host } = req.headers;
        // Allow localhost for local development
        if (host && host.includes("localhost")) {
          next();
          return;
        }
        const forwardedProto = req.headers["x-forwarded-proto"];
        const isSecure = forwardedProto ? forwardedProto === "https" : Boolean((req.socket as any).encrypted);
        if ((host && host !== primaryHost) || !isSecure) {
          const url = `https://${primaryHost}${req.url}`;
          res.writeHead(301, { Location: url });
          res.end();
          return;
        }
        next();
      });
    },
  };
}

function addCharsetHeader() {
  return {
    name: "charset-header",
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        // Only set the header for HTML responses.
        if (req.url === "/" || req.url?.endsWith(".html")) {
          res.setHeader("Content-Type", "text/html; charset=UTF-8");
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    // Uncomment the plugin below to activate the redirection in production.
    // canonicalRedirectPlugin("bitinglip.com"),
    addCharsetHeader(),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ["info", "subinfo"].includes(tag),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
