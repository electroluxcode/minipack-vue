import Table from './index.vue';
import type { App } from 'vue';
type EventShim = {
    new (...args: any[]): {
        $props: {
            onClick?: (...args: any[]) => void;
        };
    };
};
type WithInstall<T> = T & {
    install(app: App): void;
} & EventShim;
export declare const tableMy: WithInstall<typeof Table>;
export {};
