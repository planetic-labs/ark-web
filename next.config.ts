import type { NextConfig } from "next";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const getGitVersion = (): string => {
  const isDev = process.env.NODE_ENV !== "production";
  try {
    if (isDev) {
      const commitTime = execSync('git log -1 --format=%cd --date=format:"%d.%m.%Y %H:%M"').toString().trim();
      return `dev: ${commitTime}`;
    } else {
      return execSync("git describe --tags --abbrev=0").toString().trim();
    }
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
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || getGitVersion(),
  },
};

export default nextConfig;
