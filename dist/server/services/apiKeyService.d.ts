import { PrismaClientType } from '../db/prisma.js';
export interface ApiKeyRecord {
    id: string;
    key: string;
    label: string | null;
    tenantId: string;
    isActive: boolean;
    rateLimitPerMinute: number | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare function setPrismaClient(client: PrismaClientType): void;
export declare function getApiKeyByValue(keyValue: string): Promise<ApiKeyRecord | null>;
export interface CreateApiKeyParams {
    tenantId: string;
    label?: string;
    rateLimitPerMinute?: number;
}
export declare function createApiKey(params: CreateApiKeyParams): Promise<ApiKeyRecord>;
export declare function listApiKeys(): Promise<ApiKeyRecord[]>;
export declare function deactivateApiKey(id: string): Promise<void>;
export declare function rotateApiKey(id: string): Promise<ApiKeyRecord>;
//# sourceMappingURL=apiKeyService.d.ts.map