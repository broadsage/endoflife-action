import { ActionInputs, ProductCycles } from './types';
/**
 * Get and validate action inputs
 */
export declare function getInputs(): ActionInputs;
/**
 * Parse products input
 */
export declare function parseProducts(productsInput: string): string[];
/**
 * Parse cycles input
 */
export declare function parseCycles(cyclesInput: string): ProductCycles;
/**
 * Validate inputs
 */
export declare function validateInputs(inputs: ActionInputs): void;
