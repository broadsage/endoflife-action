import { ActionResults } from './types';
/**
 * Format results as JSON
 */
export declare function formatAsJson(results: ActionResults): string;
/**
 * Format results as Markdown
 */
export declare function formatAsMarkdown(results: ActionResults): string;
/**
 * Write results to GitHub Step Summary
 */
export declare function writeToStepSummary(results: ActionResults): Promise<void>;
/**
 * Write results to file
 */
export declare function writeToFile(filePath: string, content: string): Promise<void>;
/**
 * Set action outputs
 */
export declare function setOutputs(results: ActionResults): void;
/**
 * Create issue body for EOL detection
 */
export declare function createIssueBody(results: ActionResults): string;
