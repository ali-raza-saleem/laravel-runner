import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { Config } from "./Config";

export class PathUtils {
    private static instance: PathUtils | null = null;
    private config: Config;

    private constructor(config: Config) {
        this.config = config;
    }

    /**
     * Initializes the PathUtils singleton with a Config instance.
     * Must be called once in `activate()`.
     * @param config Config instance
     */
    public static init(config: Config): void {
        if (!this.instance) {
            this.instance = new PathUtils(config);
        }
    }

    /**
     * Gets the singleton instance of PathUtils.
     * Ensures `init()` has been called before access.
     * @returns PathUtils instance
     * @throws Error if `init()` has not been called.
     */
    public static getInstance(): PathUtils {
        if (!this.instance) {
            throw new Error("PathUtils has not been initialized. Call PathUtils.init(config) first.");
        }
        return this.instance;
    }

    /**
     * Checks if the given folder is a Laravel project root directory.
     * @param workspaceRootFolder The path of the workspace root folder.
     * @returns boolean
     */
    public isLaravelProjectDir(workspaceRootFolder: string): boolean { 
        const artisanPath = path.join(workspaceRootFolder, "artisan");
        return fs.existsSync(artisanPath);
    }

    /**
     * Checks if the given file is inside the configured Tinker playground directory.
     * @param workspaceRootFolder The path of the workspace root folder.
     * @param fileUri The URI of the file.
     * @returns boolean
     */
    public fileIsInsideTinkerPlayground(workspaceRootFolder: string, fileUri: vscode.Uri): boolean {
        const workspaceRoot = this.getWorkspaceRoot(fileUri);
        if (!workspaceRoot || !this.isLaravelProjectDir(workspaceRoot)) {
            return false; // Not inside a Laravel project
        }
        
        const playgroundFolder = this.config.get<string>("playgroundFolder");
        const tinkerPlaygroundPath = path.join(workspaceRootFolder, playgroundFolder);
        
        return fileUri.fsPath.startsWith(tinkerPlaygroundPath + path.sep);
    }

    /**
     * Gets the workspace root for a given file URI.
     * @param fileUri The URI of the file.
     * @returns The root path of the workspace if found, otherwise null.
     */
    public getWorkspaceRoot(fileUri: vscode.Uri): string | null {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return null;
        }

        const workspace = workspaceFolders.find(folder => fileUri.fsPath.startsWith(folder.uri.fsPath));
        return workspace ? workspace.uri.fsPath : null;
    }
}
