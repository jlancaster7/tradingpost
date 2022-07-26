<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
export declare const execAsync: (cmd: string, options?: {
    env?: NodeJS.ProcessEnv;
}) => Promise<any>;
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
/// <reference types="node" />
export declare const execAsync: (cmd: string, options?: {
    env?: NodeJS.ProcessEnv | undefined;
} | undefined) => Promise<any>;
>>>>>>> Stashed changes
