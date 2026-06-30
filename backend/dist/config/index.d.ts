export declare const config: {
    readonly env: string;
    readonly port: number;
    readonly apiBaseUrl: string;
    readonly mongodbUri: string;
    readonly jwt: {
        readonly secret: string;
        readonly expiresIn: string;
        readonly refreshExpiresIn: string;
    };
    readonly license: {
        readonly privateKeyPath: string;
        readonly publicKeyPath: string;
        readonly checkIntervalDays: number;
    };
    readonly corsOrigin: string;
    readonly rateLimit: {
        readonly windowMs: number;
        readonly max: number;
    };
    readonly seed: {
        readonly adminEmail: string;
        readonly adminPassword: string;
    };
};
export default config;
//# sourceMappingURL=index.d.ts.map