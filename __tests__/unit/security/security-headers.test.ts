import * as fs from "fs";
import * as path from "path";

describe("Security Headers Configuration", () => {
  describe("Next.js Config Security Headers", () => {
    let nextConfigContent: string;

    beforeAll(() => {
      const configPath = path.resolve(__dirname, "../../../next.config.ts");
      nextConfigContent = fs.readFileSync(configPath, "utf-8");
    });

    it("should disable X-Powered-By header", () => {
      expect(nextConfigContent).toContain("poweredByHeader: false");
    });

    it("should disable production browser source maps", () => {
      expect(nextConfigContent).toContain(
        "productionBrowserSourceMaps: false"
      );
    });

    it("should have X-Frame-Options set to DENY", () => {
      expect(nextConfigContent).toContain("X-Frame-Options");
      expect(nextConfigContent).toContain("DENY");
    });

    it("should have X-Content-Type-Options set to nosniff", () => {
      expect(nextConfigContent).toContain("X-Content-Type-Options");
      expect(nextConfigContent).toContain("nosniff");
    });

    it("should have Strict-Transport-Security header", () => {
      expect(nextConfigContent).toContain("Strict-Transport-Security");
      expect(nextConfigContent).toContain("includeSubDomains");
    });

    it("should have Referrer-Policy header", () => {
      expect(nextConfigContent).toContain("Referrer-Policy");
      expect(nextConfigContent).toContain("strict-origin-when-cross-origin");
    });

    it("should have Content-Security-Policy header", () => {
      expect(nextConfigContent).toContain("Content-Security-Policy");
      expect(nextConfigContent).toContain("object-src 'none'");
      expect(nextConfigContent).toContain("frame-ancestors 'none'");
    });

    it("should have Permissions-Policy header", () => {
      expect(nextConfigContent).toContain("Permissions-Policy");
    });
  });

  describe("Dockerfile Security Hardening", () => {
    let dockerfileContent: string;

    beforeAll(() => {
      const dockerfilePath = path.resolve(__dirname, "../../../Dockerfile");
      dockerfileContent = fs.readFileSync(dockerfilePath, "utf-8");
    });

    it("should run as non-root user", () => {
      expect(dockerfileContent).toContain("USER nextjs");
    });

    it("should use nologin shell for nextjs user", () => {
      expect(dockerfileContent).toContain("/sbin/nologin");
    });

    it("should remove wget and curl", () => {
      expect(dockerfileContent).toMatch(/rm.*wget/);
      expect(dockerfileContent).toMatch(/rm.*curl/);
    });

    it("should remove package manager (apk)", () => {
      expect(dockerfileContent).toMatch(/apk del|rm.*apk/);
    });

    it("should remove bundled Node package managers from the runtime image", () => {
      expect(dockerfileContent).toContain(
        "/usr/local/lib/node_modules/npm"
      );
      expect(dockerfileContent).toContain(
        "/usr/local/lib/node_modules/corepack"
      );
      expect(dockerfileContent).toContain("/usr/local/bin/npm");
      expect(dockerfileContent).toContain("/usr/local/bin/npx");
      expect(dockerfileContent).toContain("/opt/yarn-v*");
    });

    it("should remove source maps", () => {
      expect(dockerfileContent).toContain("*.map");
      expect(dockerfileContent).toContain("-delete");
    });

    it("should set read-only file permissions", () => {
      expect(dockerfileContent).toContain("chmod 444");
      expect(dockerfileContent).toContain("chmod 555");
    });

    it("should use node-based healthcheck (not wget)", () => {
      expect(dockerfileContent).toMatch(/HEALTHCHECK[\s\S]*?CMD\s+node/);
      expect(dockerfileContent).not.toMatch(/HEALTHCHECK[\s\S]*?CMD\s+wget/);
    });

    it("should remove os-release files", () => {
      expect(dockerfileContent).toContain("os-release");
    });
  });

  describe("Middleware Security", () => {
    let middlewareContent: string;

    beforeAll(() => {
      const middlewarePath = path.resolve(
        __dirname,
        "../../../src/middleware.ts"
      );
      middlewareContent = fs.readFileSync(middlewarePath, "utf-8");
    });

    it("should check for cg_auth cookie", () => {
      expect(middlewareContent).toContain("cg_auth");
    });

    it("should redirect unauthenticated users to signin", () => {
      expect(middlewareContent).toContain("/signin");
    });

    it("should have public routes defined", () => {
      expect(middlewareContent).toContain("publicRoutes");
    });

    it("should exclude API routes from middleware", () => {
      expect(middlewareContent).toContain("api");
      expect(middlewareContent).toContain("matcher");
    });
  });
});
