import * as child from 'child_process';
import * as path from 'path';
import {
    WorkspaceConfiguration,
    workspace
} from 'vscode';

export interface SiteOptions {
    name: string | null;
    upOnly: boolean;
    downOnly: boolean;
    localPath: string | null;
    remotePath: string | null;
    deleteFiles: boolean;
    flags: string;
    exclude: string[];
    include: string[];
    chmod?: string;
    shell?: string;
    executableShell?: string;
    executable: string;
    afterSync?: string[];
    preSyncUp?: string[];
    postSyncUp?: string[];
    preSyncDown?: string[];
    postSyncDown?: string[];
    options: string[][];
    args: string[];
    template?: string;
}

export interface SiteTemplate extends SiteOptions {
    isTemplate: true;
}

export class Site implements SiteOptions {
    constructor(
        public name: string | null,
        public upOnly: boolean,
        public downOnly: boolean,
        public localPath: string | null,
        public remotePath: string | null,
        public deleteFiles: boolean,
        public flags: string,
        public exclude: string[],
        public include: string[],
        public chmod?: string,
        public shell?: string,
        public executableShell?: string,
        public executable: string = 'rsync',
        public afterSync?: string[],
        public preSyncUp?: string[],
        public postSyncUp?: string[],
        public preSyncDown?: string[],
        public postSyncDown?: string[],
        public options: string[][] = [],
        public args: string[] = [],
        public template?: string
    ) {}
}

export interface ConfigOptions {
    notification: boolean;
    autoShowOutput: boolean;
    autoShowOutputOnError: boolean;
    autoHideOutput: boolean;
    onFileSave: boolean;
    onFileSaveIndividual: boolean;
    onFileLoadIndividual: boolean;
    showProgress: boolean;
    sites: Site[];
    templates: SiteTemplate[];
    cygpath?: string;
    watchGlobs: string[];
    useWSL: boolean;
}

export class Config implements ConfigOptions {
    readonly notification: boolean;
    readonly autoShowOutput: boolean;
    readonly autoShowOutputOnError: boolean;
    readonly autoHideOutput: boolean;
    readonly onFileSave: boolean;
    readonly onFileSaveIndividual: boolean;
    readonly onFileLoadIndividual: boolean;
    readonly showProgress: boolean;
    readonly sites: Site[];
    readonly templates: SiteTemplate[];
    readonly cygpath?: string;
    readonly watchGlobs: string[];
    readonly useWSL: boolean;
    readonly siteMap: Map<string, Site>;
    readonly templateMap: Map<string, SiteTemplate>;
    
    private readonly _workspaceFolder: string;
    private readonly _workspaceFolderBasename: string;

    constructor(config: WorkspaceConfiguration) {
        this.onFileSave = config.get('onSave', false);
        this.onFileSaveIndividual = config.get('onSaveIndividual', false);
        this.onFileLoadIndividual = config.get('onLoadIndividual', false);
        this.showProgress = config.get('showProgress', true);
        this.notification = config.get('notification', false);
        this.autoShowOutput = config.get('autoShowOutput', false);
        this.autoShowOutputOnError = config.get('autoShowOutputOnError', true);
        this.autoHideOutput = config.get('autoHideOutput', false);
        this.cygpath = config.get('cygpath');
        this.watchGlobs = config.get('watchGlobs', []);
        this.useWSL = config.get('useWSL', false);
        
        this._workspaceFolder = workspace.workspaceFolders?.[0]?.uri.fsPath ?? '';
        this._workspaceFolderBasename = path.basename(this._workspaceFolder);

        const site_default = new Site(
            config.get<string | null>('name', null),
            false,
            false,
            config.get<string | null>('local', null),
            config.get<string | null>('remote', null),
            config.get('delete', false),
            config.get('flags', 'rlptzv'),
            config.get('exclude', ['.git', '.vscode']),
            config.get('include', []),
            config.get('chmod'),
            config.get('shell'),
            config.get('executableShell'),
            config.get('executable', 'rsync'),
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            config.get('options', []),
            config.get('args', [])
        );

        const config_templates = config.get<SiteTemplate[]>('templates', []);
        this.templates = config_templates.map(template => ({
            ...site_default,
            ...template,
            isTemplate: true
        }));
        this.templateMap = new Map(
            this.templates.map(template => [template.name ?? '', template])
        );

        const config_sites = config.get<SiteOptions[]>('sites', []);
        this.sites = config_sites.length === 0 
            ? [site_default]
            : config_sites.map(site => {
                if (site.template && this.templateMap.has(site.template)) {
                    const template = this.templateMap.get(site.template)!;
                    return {
                        ...template,
                        ...site,
                        isTemplate: undefined
                    };
                }
                return { ...site_default, ...site };
            });

        this.siteMap = new Map(
            this.sites.map(site => [site.name ?? site.remotePath ?? '', site])
        );

        this.processSites();
    }

    private processSites(): void {
        const workspaceLocal = this._workspaceFolder;

        for (const site of this.sites) {
            if (!site.localPath || site.localPath === 'null') {
                site.localPath = workspaceLocal;
            }

            if (workspaceLocal) {
                site.localPath = this.expandVars(site.localPath);
                
                site.options = site.options.map(option => 
                    option.map(value => this.expandVars(value))
                );

                if (site.remotePath) {
                    site.remotePath = this.expandVars(site.remotePath);
                }
            }

            site.localPath = this.translatePath(site.localPath);
            site.remotePath = this.translatePath(site.remotePath);
            
            if (site.localPath && !site.localPath.endsWith('/')) {
                site.localPath += '/';
            }
            if (site.remotePath && !site.remotePath.endsWith('/')) {
                site.remotePath += '/';
            }
        }
    }

    private expandVars(path: string): string {
        return path
            .replace('${workspaceRoot}', this._workspaceFolder)
            .replace('${workspaceFolder}', this._workspaceFolder)
            .replace('${workspaceFolderBasename}', this._workspaceFolderBasename);
    }

    private translatePath(path: string | null): string | null {
        if (!path) return null;
        if (path.startsWith('/')) return path;

        if (this.cygpath) {
            const result = child.spawnSync(this.cygpath, [path]);
            if (result.status !== 0) {
                throw new Error(`Path Translate Issue: ${result.stderr.toString()}`);
            }
            if (result.error) {
                throw result.error;
            }
            return result.stdout.toString().trim();
        }

        if (this.useWSL) {
            const wslPath = path.replace(/\\/g, '\\\\');
            const result = child.spawnSync('wsl', ['wslpath', wslPath]);
            if (result.status !== 0) {
                throw new Error(`Path Translate Issue: ${result.stderr.toString()}`);
            }
            if (result.error) {
                throw result.error;
            }
            return result.stdout.toString().trim();
        }

        return path;
    }
}
