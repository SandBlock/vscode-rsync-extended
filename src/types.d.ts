declare module 'rsync' {
    export default class Rsync {
        constructor();
        dry(): this;
        flags(flags: string): this;
        progress(show: boolean): this;
        include(patterns: string[]): this;
        exclude(patterns: string[]): this;
        shell(shell: string): this;
        delete(): this;
        chmod(chmod: string): this;
        set(...args: string[]): this;
        args(): string[];
        isSet(flag: string): boolean;
    }
}

declare module 'chokidar' {
    namespace chokidar {
        interface WatchOptions {
            ignored?: RegExp | string | ((path: string) => boolean);
            persistent?: boolean;
            ignoreInitial?: boolean;
            followSymlinks?: boolean;
            cwd?: string;
            disableGlobbing?: boolean;
            usePolling?: boolean;
            interval?: number;
            binaryInterval?: number;
            awaitWriteFinish?: boolean | {
                stabilityThreshold?: number;
                pollInterval?: number;
            };
            ignorePermissionErrors?: boolean;
            atomic?: boolean | number;
        }

        interface FSWatcher {
            add(files: string | string[]): void;
            on(event: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir', listener: (path: string) => void): this;
            on(event: 'all', listener: (eventName: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir', path: string) => void): this;
            on(event: 'error', listener: (error: Error) => void): this;
            on(event: 'ready', listener: () => void): this;
            on(event: string, listener: (...args: any[]) => void): this;
            close(): Promise<void>;
        }
    }

    function watch(paths: string | ReadonlyArray<string>, options?: chokidar.WatchOptions): chokidar.FSWatcher;

    export = watch;
} 