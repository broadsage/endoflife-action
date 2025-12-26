import { ActionResults } from './types';
/**
 * GitHub integration for creating issues and PRs
 */
export declare class GitHubIntegration {
    private octokit;
    private context;
    constructor(token: string);
    /**
     * Create an issue for EOL detection
     */
    createEolIssue(results: ActionResults, labels: string[]): Promise<number | null>;
    /**
     * Add labels to an issue
     */
    addLabels(issueNumber: number, labels: string[]): Promise<void>;
    /**
     * Close an issue
     */
    closeIssue(issueNumber: number, comment?: string): Promise<void>;
}
