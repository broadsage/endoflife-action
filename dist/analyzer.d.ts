import { Cycle, ProductVersionInfo, ActionResults, ProductCycles } from './types';
import { EndOfLifeClient } from './client';
/**
 * Analyzer for EOL status and version information
 */
export declare class EolAnalyzer {
    private client;
    private eolThresholdDays;
    constructor(client: EndOfLifeClient, eolThresholdDays: number);
    /**
     * Parse EOL date from various formats
     */
    private parseEolDate;
    /**
     * Parse support date from various formats
     */
    private parseSupportDate;
    /**
     * Determine EOL status for a cycle
     */
    private determineEolStatus;
    /**
     * Calculate days until EOL
     */
    private calculateDaysUntilEol;
    /**
     * Check if cycle is LTS
     */
    private isLts;
    /**
     * Analyze a single product cycle
     */
    analyzeProductCycle(product: string, cycle: Cycle): ProductVersionInfo;
    /**
     * Analyze all cycles for a product
     */
    analyzeProduct(product: string, specificCycles?: string[]): Promise<ProductVersionInfo[]>;
    /**
     * Analyze multiple products
     */
    analyzeProducts(products: string[], cyclesMap?: ProductCycles, versionMap?: Map<string, string>, semanticFallback?: boolean): Promise<ActionResults>;
    /**
     * Generate human-readable summary
     */
    private generateSummary;
}
