import { Cycle, AllProducts } from './types';
/**
 * Client for interacting with the EndOfLife.date API
 */
export declare class EndOfLifeClient {
    private httpClient;
    private baseUrl;
    private cache;
    private cacheTtl;
    constructor(baseUrl?: string, cacheTtl?: number);
    /**
     * Get cached data if available and not expired
     */
    private getCached;
    /**
     * Set cache data
     */
    private setCache;
    /**
     * Make HTTP request with error handling
     */
    private request;
    /**
     * Get all available products
     */
    getAllProducts(): Promise<AllProducts>;
    /**
     * Get all cycles for a product
     */
    getProductCycles(product: string): Promise<Cycle[]>;
    /**
     * Get a specific cycle for a product
     */
    getProductCycle(product: string, cycle: string): Promise<Cycle>;
    /**
     * Get cycle info with semantic version fallback
     * Tries version patterns: 1.2.3 → 1.2 → 1
     */
    getCycleInfoWithFallback(product: string, version: string, enableFallback: boolean): Promise<Cycle | null>;
    /**
     * Clear the cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        keys: string[];
    };
}
