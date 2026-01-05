// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2025 Broadsage

/**
 * Shared test fixtures and mock data for unit tests
 * This eliminates code duplication across test files
 */

import { ProductVersionInfo, ActionResults, EolStatus, Cycle } from '../../src/types';

/**
 * Default mock product for testing
 */
export const mockProductDefaults: ProductVersionInfo = {
    product: 'python',
    cycle: '3.7',
    status: EolStatus.END_OF_LIFE,
    eolDate: '2023-06-27',
    daysUntilEol: -500,
    releaseDate: '2018-06-27',
    latestVersion: '3.7.17',
    isLts: false,
    supportDate: null,
    link: 'https://endoflife.date/python',
    discontinuedDate: null,
    isDiscontinued: false,
    extendedSupportDate: null,
    hasExtendedSupport: false,
    latestReleaseDate: null,
    daysSinceLatestRelease: null,
    rawData: {
        cycle: '3.7',
        eol: '2023-06-27',
        latest: '3.7.17',
        releaseDate: '2018-06-27',
    },
};

/**
 * Creates a mock ProductVersionInfo with optional overrides
 * @param overrides - Partial product info to override defaults
 * @returns Complete ProductVersionInfo object
 * @example
 * const activeProduct = createMockProduct({ status: EolStatus.ACTIVE, cycle: '3.12' });
 */
export function createMockProduct(
    overrides: Partial<ProductVersionInfo> = {}
): ProductVersionInfo {
    return {
        ...mockProductDefaults,
        ...overrides,
        rawData: {
            ...mockProductDefaults.rawData,
            ...(overrides.rawData || {}),
        },
    };
}

/**
 * Creates a mock ActionResults with optional overrides
 * @param overrides - Partial results to override defaults
 * @returns Complete ActionResults object
 * @example
 * const cleanResults = createMockResults({ eolDetected: false, eolProducts: [] });
 */
export function createMockResults(
    overrides: Partial<ActionResults> = {}
): ActionResults {
    const defaults: ActionResults = {
        eolDetected: true,
        approachingEol: false,
        staleDetected: false,
        discontinuedDetected: false,
        totalProductsChecked: 1,
        totalCyclesChecked: 1,
        products: [mockProductDefaults],
        eolProducts: [mockProductDefaults],
        approachingEolProducts: [],
        staleProducts: [],
        discontinuedProducts: [],
        extendedSupportProducts: [],
        latestVersions: { python: '3.12.0' },
        summary: 'EOL detected',
    };
    return { ...defaults, ...overrides };
}

/**
 * Creates a mock Cycle with optional overrides
 * @param overrides - Partial cycle info to override defaults
 * @returns Complete Cycle object
 */
export function createMockCycle(overrides: Partial<Cycle> = {}): Cycle {
    const defaults: Cycle = {
        cycle: '3.7',
        releaseDate: '2018-06-27',
        eol: '2023-06-27',
        latest: '3.7.17',
        link: 'https://endoflife.date/python',
        lts: false,
        support: null,
        discontinued: null,
        extendedSupport: null,
        latestReleaseDate: null,
    };
    return { ...defaults, ...overrides };
}

/**
 * Common test products for various scenarios
 */
export const testProducts = {
    /** End-of-life product */
    eol: createMockProduct({
        product: 'python',
        cycle: '2.7',
        status: EolStatus.END_OF_LIFE,
        eolDate: '2020-01-01',
        daysUntilEol: -1800,
    }),

    /** Active product */
    active: createMockProduct({
        product: 'python',
        cycle: '3.12',
        status: EolStatus.ACTIVE,
        eolDate: '2028-10-02',
        daysUntilEol: 1400,
        isLts: true,
    }),

    /** Approaching EOL product */
    approaching: createMockProduct({
        product: 'nodejs',
        cycle: '18',
        status: EolStatus.APPROACHING_EOL,
        eolDate: '2025-04-30',
        daysUntilEol: 45,
        isLts: true,
    }),

    /** Discontinued hardware */
    discontinued: createMockProduct({
        product: 'iphone',
        cycle: '6s',
        status: EolStatus.END_OF_LIFE,
        eolDate: '2022-09-12',
        daysUntilEol: -800,
        discontinuedDate: '2018-09-12',
        isDiscontinued: true,
    }),

    /** Product with extended support */
    extendedSupport: createMockProduct({
        product: 'ubuntu',
        cycle: '18.04',
        status: EolStatus.ACTIVE,
        eolDate: '2023-05-31',
        extendedSupportDate: '2028-04-30',
        hasExtendedSupport: true,
    }),

    /** Stale product (no recent releases) */
    stale: createMockProduct({
        product: 'python',
        cycle: '3.9',
        status: EolStatus.ACTIVE,
        eolDate: '2025-10-05',
        latestReleaseDate: '2022-01-01',
        daysSinceLatestRelease: 800,
    }),
};

/**
 * Common test results for various scenarios
 */
export const testResults = {
    /** No issues detected */
    clean: createMockResults({
        eolDetected: false,
        approachingEol: false,
        staleDetected: false,
        discontinuedDetected: false,
        products: [testProducts.active],
        eolProducts: [],
        approachingEolProducts: [],
        staleProducts: [],
        discontinuedProducts: [],
        summary: 'All products are actively supported',
    }),

    /** EOL detected */
    eolDetected: createMockResults({
        eolDetected: true,
        products: [testProducts.eol],
        eolProducts: [testProducts.eol],
        summary: 'EOL detected for 1 product',
    }),

    /** Multiple issues */
    multipleIssues: createMockResults({
        eolDetected: true,
        approachingEol: true,
        staleDetected: true,
        discontinuedDetected: true,
        totalProductsChecked: 4,
        totalCyclesChecked: 4,
        products: [
            testProducts.eol,
            testProducts.approaching,
            testProducts.stale,
            testProducts.discontinued,
        ],
        eolProducts: [testProducts.eol],
        approachingEolProducts: [testProducts.approaching],
        staleProducts: [testProducts.stale],
        discontinuedProducts: [testProducts.discontinued],
        summary: 'Multiple issues detected',
    }),
};
