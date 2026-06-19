import * as fs from "fs";
import { execFileSync } from "child_process";
import * as vscode from "vscode";

export interface ResolvedPhpExecutable {
  command: string;
  isWindowsBatchFile: boolean;
  source: "setting" | "auto" | "fallback";
}

export class PhpExecutableResolver {
  public static resolve(): ResolvedPhpExecutable {
    const configuredPath = vscode.workspace
      .getConfiguration("laravelRunner")
      .get<string>("phpPath", "")
      .trim()
      .replace(/^["']|["']$/g, "");

    if (configuredPath.length > 0) {
      return {
        command: configuredPath,
        isWindowsBatchFile: this.isWindowsBatchFile(configuredPath),
        source: "setting",
      };
    }

    if (process.platform === "win32") {
      return this.resolveWindowsPhp();
    }

    return this.resolveUnixPhp();
  }

  private static resolveWindowsPhp(): ResolvedPhpExecutable {
    try {
      const output = execFileSync("where", ["php"], {
        encoding: "utf8",
        windowsHide: true,
      });

      const candidates = output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      const exeCandidate = candidates.find((candidate) =>
        candidate.toLowerCase().endsWith(".exe"),
      );

      if (exeCandidate) {
        return {
          command: exeCandidate,
          isWindowsBatchFile: false,
          source: "auto",
        };
      }

      const firstCandidate = candidates[0];

      if (firstCandidate) {
        return {
          command: firstCandidate,
          isWindowsBatchFile: this.isWindowsBatchFile(firstCandidate),
          source: "auto",
        };
      }
    } catch {
      //
    }

    return {
      command: "php",
      isWindowsBatchFile: false,
      source: "fallback",
    };
  }

  private static resolveUnixPhp(): ResolvedPhpExecutable {
    try {
      const output = execFileSync("which", ["php"], {
        encoding: "utf8",
      }).trim();

      if (output && fs.existsSync(output)) {
        return {
          command: output,
          isWindowsBatchFile: false,
          source: "auto",
        };
      }
    } catch {
      //
    }

    return {
      command: "php",
      isWindowsBatchFile: false,
      source: "fallback",
    };
  }

  private static isWindowsBatchFile(filePath: string): boolean {
    const normalized = filePath.toLowerCase();
    return normalized.endsWith(".bat") || normalized.endsWith(".cmd");
  }
}