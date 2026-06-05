import type { NextConfig } from "next";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const getGitVersion = (): string => {
  try {
    return execSync("git describe --tags --always").toString().trim();
  } catch (error) {
    try {
      const pkgPath = path.resolve(process.cwd(), "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      return `v${pkg.version}-fallback`;
    } catch {
      return "v0.1.0-unknown";
    }
  }
};

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: getGitVersion(),
  },
};

export default nextConfig;
