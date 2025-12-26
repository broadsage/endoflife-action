/**
 * Supported file formats for version extraction
 */
export declare enum FileFormat {
    YAML = "yaml",
    JSON = "json",
    TEXT = "text"
}
/**
 * Result of version extraction
 */
export interface VersionExtractionResult {
    version: string;
    source: 'file' | 'manual';
    filePath?: string;
    extractionMethod?: 'yaml' | 'json' | 'regex';
}
/**
 * Version extractor with semantic version support
 */
export declare class VersionExtractor {
    private strategies;
    constructor();
    /**
     * Extract version from a file
     */
    extractFromFile(filePath: string, fileFormat: FileFormat, fileKey?: string, versionRegex?: string): VersionExtractionResult;
    /**
     * Clean version string (delegated to shared utility)
     */
    cleanVersion(version: string): string;
    /**
     * Generate semantic version fallback options (delegated to shared utility)
     */
    getSemanticFallbacks(version: string): string[];
    /**
     * Check if version is semantic (delegated to shared utility)
     */
    isSemanticVersion(version: string): boolean;
}
