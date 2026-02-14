import * as fs from "fs";
import * as path from "path";

describe("Dependency Security Audit", () => {
  let packageJson: {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };

  beforeAll(() => {
    const packageJsonPath = path.resolve(__dirname, "../../../package.json");
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  });

  describe("Critical Version Checks", () => {
    const parseVersion = (versionStr: string): number[] => {
      return versionStr
        .replace(/^[\^~>=<]+/, "")
        .split(".")
        .map(Number);
    };

    const isVersionAtLeast = (
      current: string,
      minimum: string
    ): boolean => {
      const cur = parseVersion(current);
      const min = parseVersion(minimum);
      for (let i = 0; i < Math.max(cur.length, min.length); i++) {
        const c = cur[i] || 0;
        const m = min[i] || 0;
        if (c > m) return true;
        if (c < m) return false;
      }
      return true;
    };

    it("should use react >= 19.1.2 (CVE-2025-55182 fix)", () => {
      const reactVersion = packageJson.dependencies["react"];
      expect(reactVersion).toBeDefined();
      expect(isVersionAtLeast(reactVersion, "19.1.2")).toBe(true);
    });

    it("should use react-dom >= 19.1.2 (CVE-2025-55182 fix)", () => {
      const reactDomVersion = packageJson.dependencies["react-dom"];
      expect(reactDomVersion).toBeDefined();
      expect(isVersionAtLeast(reactDomVersion, "19.1.2")).toBe(true);
    });

    it("should use next >= 15.2.6 (security patches)", () => {
      const nextVersion = packageJson.dependencies["next"];
      expect(nextVersion).toBeDefined();
      expect(isVersionAtLeast(nextVersion, "15.2.6")).toBe(true);
    });
  });

  describe("Blocked Packages", () => {
    const blockedPackages = [
      "event-stream",
      "flatmap-stream",
      "ua-parser-js-old",
      "colors-old",
      "faker-old",
    ];

    it("should not contain known malicious packages", () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      for (const pkg of blockedPackages) {
        expect(allDeps).not.toHaveProperty(pkg);
      }
    });
  });

  describe("Hardcoded Secrets Scan", () => {
    const scanDirectory = (dir: string, patterns: RegExp[]): string[] => {
      const findings: string[] = [];
      if (!fs.existsSync(dir)) return findings;

      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (["node_modules", ".next", ".git", "coverage"].includes(entry.name))
            continue;
          findings.push(...scanDirectory(fullPath, patterns));
        } else if (
          entry.isFile() &&
          /\.(ts|tsx|js|jsx)$/.test(entry.name)
        ) {
          const content = fs.readFileSync(fullPath, "utf-8");
          for (const pattern of patterns) {
            if (pattern.test(content)) {
              findings.push(`${fullPath}: matches ${pattern.source}`);
            }
          }
        }
      }
      return findings;
    };

    it("should not have hardcoded API keys or secrets in source code", () => {
      const srcDir = path.resolve(__dirname, "../../../src");
      const secretPatterns = [
        /(?:api[_-]?key|apikey)\s*[:=]\s*['"][A-Za-z0-9]{20,}['"]/i,
        /(?:secret|password|token)\s*[:=]\s*['"][A-Za-z0-9!@#$%^&*]{16,}['"]/i,
        /(?:aws_access_key_id|aws_secret_access_key)\s*[:=]\s*['"][A-Za-z0-9/+=]{16,}['"]/i,
        /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
      ];
      const findings = scanDirectory(srcDir, secretPatterns);
      expect(findings).toEqual([]);
    });
  });
});
