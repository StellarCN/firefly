/// <reference types="node" />
export declare const getMasterKeyFromSeed: (seed: string) => {
    key: Buffer;
    chainCode: Buffer;
};
export declare const getPublicKey: (privateKey: Buffer, withZeroByte?: boolean) => Buffer;
export declare const isValidPath: (path: string) => boolean;
export declare const derivePath: (path: string, seed: string) => {
    key: Buffer;
    chainCode: Buffer;
};
