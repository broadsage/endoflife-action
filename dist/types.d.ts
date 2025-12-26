import { z } from 'zod';
/**
 * Schema for a single release cycle from the EndOfLife.date API
 */
export declare const CycleSchema: z.ZodObject<{
    cycle: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    releaseDate: z.ZodOptional<z.ZodString>;
    eol: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean]>>;
    latest: z.ZodOptional<z.ZodString>;
    link: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lts: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean]>>;
    support: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean]>>;
    discontinued: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean]>>;
    latestReleaseDate: z.ZodOptional<z.ZodString>;
    extendedSupport: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean]>>;
}, "strip", z.ZodTypeAny, {
    cycle: string | number;
    releaseDate?: string | undefined;
    eol?: string | boolean | undefined;
    latest?: string | undefined;
    link?: string | null | undefined;
    lts?: string | boolean | undefined;
    support?: string | boolean | undefined;
    discontinued?: string | boolean | undefined;
    latestReleaseDate?: string | undefined;
    extendedSupport?: string | boolean | undefined;
}, {
    cycle: string | number;
    releaseDate?: string | undefined;
    eol?: string | boolean | undefined;
    latest?: string | undefined;
    link?: string | null | undefined;
    lts?: string | boolean | undefined;
    support?: string | boolean | undefined;
    discontinued?: string | boolean | undefined;
    latestReleaseDate?: string | undefined;
    extendedSupport?: string | boolean | undefined;
}>;
export type Cycle = z.infer<typeof CycleSchema>;
/**
 * Schema for the list of all products
 */
export declare const AllProductsSchema: z.ZodArray<z.ZodString, "many">;
export type AllProducts = z.infer<typeof AllProductsSchema>;
/**
 * Schema for product cycles mapping
 */
export declare const ProductCyclesSchema: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>;
export type ProductCycles = z.infer<typeof ProductCyclesSchema>;
/**
 * Schema for action inputs
 */
export declare const ActionInputsSchema: z.ZodObject<{
    products: z.ZodString;
    cycles: z.ZodString;
    checkEol: z.ZodBoolean;
    eolThresholdDays: z.ZodNumber;
    failOnEol: z.ZodBoolean;
    failOnApproachingEol: z.ZodBoolean;
    outputFormat: z.ZodEnum<["json", "markdown", "summary"]>;
    outputFile: z.ZodString;
    cacheTtl: z.ZodNumber;
    githubToken: z.ZodString;
    createIssueOnEol: z.ZodBoolean;
    issueLabels: z.ZodString;
    includeLatestVersion: z.ZodBoolean;
    includeSupportInfo: z.ZodBoolean;
    customApiUrl: z.ZodString;
    filePath: z.ZodString;
    fileKey: z.ZodString;
    fileFormat: z.ZodEnum<["yaml", "json", "text"]>;
    versionRegex: z.ZodString;
    version: z.ZodString;
    semanticVersionFallback: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    products: string;
    cycles: string;
    checkEol: boolean;
    eolThresholdDays: number;
    failOnEol: boolean;
    failOnApproachingEol: boolean;
    outputFormat: "json" | "markdown" | "summary";
    outputFile: string;
    cacheTtl: number;
    githubToken: string;
    createIssueOnEol: boolean;
    issueLabels: string;
    includeLatestVersion: boolean;
    includeSupportInfo: boolean;
    customApiUrl: string;
    filePath: string;
    fileKey: string;
    fileFormat: "json" | "yaml" | "text";
    versionRegex: string;
    version: string;
    semanticVersionFallback: boolean;
}, {
    products: string;
    cycles: string;
    checkEol: boolean;
    eolThresholdDays: number;
    failOnEol: boolean;
    failOnApproachingEol: boolean;
    outputFormat: "json" | "markdown" | "summary";
    outputFile: string;
    cacheTtl: number;
    githubToken: string;
    createIssueOnEol: boolean;
    issueLabels: string;
    includeLatestVersion: boolean;
    includeSupportInfo: boolean;
    customApiUrl: string;
    filePath: string;
    fileKey: string;
    fileFormat: "json" | "yaml" | "text";
    versionRegex: string;
    version: string;
    semanticVersionFallback: boolean;
}>;
export type ActionInputs = z.infer<typeof ActionInputsSchema>;
/**
 * EOL Status enumeration
 */
export declare enum EolStatus {
    ACTIVE = "active",
    APPROACHING_EOL = "approaching_eol",
    END_OF_LIFE = "end_of_life",
    UNKNOWN = "unknown"
}
/**
 * Product version information
 */
export interface ProductVersionInfo {
    product: string;
    cycle: string;
    status: EolStatus;
    eolDate: string | null;
    daysUntilEol: number | null;
    releaseDate: string | null;
    latestVersion: string | null;
    isLts: boolean;
    supportDate: string | null;
    link: string | null;
    rawData: Cycle;
}
/**
 * Action results
 */
export interface ActionResults {
    eolDetected: boolean;
    approachingEol: boolean;
    totalProductsChecked: number;
    totalCyclesChecked: number;
    products: ProductVersionInfo[];
    eolProducts: ProductVersionInfo[];
    approachingEolProducts: ProductVersionInfo[];
    latestVersions: Record<string, string>;
    summary: string;
}
/**
 * API Error
 */
export declare class EndOfLifeApiError extends Error {
    statusCode?: number | undefined;
    product?: string | undefined;
    cycle?: string | undefined;
    constructor(message: string, statusCode?: number | undefined, product?: string | undefined, cycle?: string | undefined);
}
/**
 * Validation Error
 */
export declare class ValidationError extends Error {
    errors?: z.ZodError | undefined;
    constructor(message: string, errors?: z.ZodError | undefined);
}
