/**
 * Utility functions for version string manipulation
 */
/**
 * Clean version string (remove 'v' prefix, whitespace, etc.)
 */
export declare function cleanVersion(version: string): string;
/**
 * Generate semantic version fallback options
 * Example: "1.2.3" → ["1.2.3", "1.2", "1"]
 */
export declare function getSemanticFallbacks(version: string): string[];
/**
 * Check if version follows semantic versioning pattern
 */
export declare function isSemanticVersion(version: string): boolean;
/**
 * Parse version string to components
 */
export interface VersionComponents {
    major: number;
    minor?: number;
    patch?: number;
    prerelease?: string;
    build?: string;
}
/**
 * Parse semantic version into components
 */
export declare function parseSemanticVersion(version: string): VersionComponents | null;
//# sourceMappingURL=version-utils.d.ts.map