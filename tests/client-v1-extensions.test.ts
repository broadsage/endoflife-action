// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2025 Broadsage

import { EndOfLifeClient } from '../src/client';
import { EndOfLifeApiError } from '../src/types';
import nock from 'nock';

describe('EndOfLifeClient - v1 API Extensions', () => {
    let client: EndOfLifeClient;
    const baseUrl = 'https://endoflife.date';

    beforeEach(() => {
        client = new EndOfLifeClient(`${baseUrl}/api/v1`, 3600);
        nock.cleanAll();
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe('getProductsFullData', () => {
        it('should fetch full data for all products', async () => {
            const mockFullData = [
                {
                    name: 'python',
                    label: 'Python',
                    category: 'lang',
                    releases: [
                        {
                            cycle: '3.12',
                            releaseDate: '2023-10-02',
                            eol: '2028-10-02',
                            latest: '3.12.1',
                            lts: false,
                        },
                    ],
                },
                {
                    name: 'nodejs',
                    label: 'Node.js',
                    category: 'server-app',
                    releases: [
                        {
                            cycle: '20',
                            releaseDate: '2023-04-18',
                            eol: '2026-04-30',
                            latest: '20.10.0',
                        },
                    ],
                },
            ];

            nock(baseUrl)
                .get('/api/v1/products/full')
                .reply(200, mockFullData);

            const products = await client.getProductsFullData();

            expect(products).toHaveLength(2);
            expect(products[0].name).toBe('python');
            expect(products[0].releases).toHaveLength(1);
            expect(products[1].name).toBe('nodejs');
        });

        it('should handle errors', async () => {
            nock(baseUrl)
                .get('/api/v1/products/full')
                .reply(500, 'Server Error');

            await expect(client.getProductsFullData()).rejects.toThrow(
                EndOfLifeApiError
            );
        });
    });

    describe('getLatestRelease', () => {
        it('should fetch latest release for a product', async () => {
            const mockLatest = {
                cycle: '3.12',
                releaseDate: '2023-10-02',
                eol: '2028-10-02',
                latest: '3.12.1',
                lts: false,
            };

            nock(baseUrl)
                .get('/api/v1/products/python/releases/latest')
                .reply(200, mockLatest);

            const latest = await client.getLatestRelease('python');

            expect(latest.cycle).toBe('3.12');
            expect(latest.latest).toBe('3.12.1');
        });

        it('should include product in error', async () => {
            nock(baseUrl)
                .get('/api/v1/products/unknown/releases/latest')
                .reply(404, 'Not Found');

            try {
                await client.getLatestRelease('unknown');
                fail('Should have thrown error');
            } catch (error) {
                expect(error).toBeInstanceOf(EndOfLifeApiError);
                expect((error as EndOfLifeApiError).product).toBe('unknown');
            }
        });
    });

    describe('getCategories', () => {
        it('should fetch all categories', async () => {
            const mockCategories = ['lang', 'os', 'server-app', 'framework'];

            nock(baseUrl)
                .get('/api/v1/categories')
                .reply(200, mockCategories);

            const categories = await client.getCategories();

            expect(categories).toEqual(mockCategories);
            expect(categories).toHaveLength(4);
        });

        it('should handle errors', async () => {
            nock(baseUrl)
                .get('/api/v1/categories')
                .reply(500, 'Server Error');

            await expect(client.getCategories()).rejects.toThrow(
                EndOfLifeApiError
            );
        });
    });

    describe('getProductsByCategory', () => {
        it('should fetch products in a category', async () => {
            const mockProducts = [
                { name: 'python', label: 'Python', category: 'lang' },
                { name: 'nodejs', label: 'Node.js', category: 'lang' },
                { name: 'go', label: 'Go', category: 'lang' },
            ];

            nock(baseUrl)
                .get('/api/v1/categories/lang')
                .reply(200, mockProducts);

            const products = await client.getProductsByCategory('lang');

            expect(products).toHaveLength(3);
            expect(products[0].name).toBe('python');
            expect(products[0].category).toBe('lang');
        });

        it('should handle 404 for unknown category', async () => {
            nock(baseUrl)
                .get('/api/v1/categories/unknown')
                .reply(404, 'Not Found');

            await expect(
                client.getProductsByCategory('unknown')
            ).rejects.toThrow(EndOfLifeApiError);
        });
    });

    describe('getTags', () => {
        it('should fetch all tags', async () => {
            const mockTags = ['database', 'web-server', 'container', 'cloud'];

            nock(baseUrl).get('/api/v1/tags').reply(200, mockTags);

            const tags = await client.getTags();

            expect(tags).toEqual(mockTags);
            expect(tags).toHaveLength(4);
        });

        it('should handle errors', async () => {
            nock(baseUrl).get('/api/v1/tags').reply(500, 'Server Error');

            await expect(client.getTags()).rejects.toThrow(EndOfLifeApiError);
        });
    });

    describe('getProductsByTag', () => {
        it('should fetch products with a tag', async () => {
            const mockProducts = [
                { name: 'postgresql', label: 'PostgreSQL', category: 'db' },
                { name: 'mysql', label: 'MySQL', category: 'db' },
                { name: 'mongodb', label: 'MongoDB', category: 'db' },
            ];

            nock(baseUrl)
                .get('/api/v1/tags/database')
                .reply(200, mockProducts);

            const products = await client.getProductsByTag('database');

            expect(products).toHaveLength(3);
            expect(products[0].name).toBe('postgresql');
        });

        it('should handle 404 for unknown tag', async () => {
            nock(baseUrl)
                .get('/api/v1/tags/unknown')
                .reply(404, 'Not Found');

            await expect(client.getProductsByTag('unknown')).rejects.toThrow(
                EndOfLifeApiError
            );
        });
    });

    describe('getIdentifierTypes', () => {
        it('should fetch all identifier types', async () => {
            const mockTypes = ['purl', 'cpe'];

            nock(baseUrl).get('/api/v1/identifiers').reply(200, mockTypes);

            const types = await client.getIdentifierTypes();

            expect(types).toEqual(mockTypes);
            expect(types).toHaveLength(2);
        });

        it('should handle errors', async () => {
            nock(baseUrl)
                .get('/api/v1/identifiers')
                .reply(500, 'Server Error');

            await expect(client.getIdentifierTypes()).rejects.toThrow(
                EndOfLifeApiError
            );
        });
    });

    describe('caching', () => {
        it('should cache new endpoint responses', async () => {
            const mockCategories = ['lang', 'os'];

            nock(baseUrl)
                .get('/api/v1/categories')
                .once()
                .reply(200, mockCategories);

            // First request
            const categories1 = await client.getCategories();
            expect(categories1).toEqual(mockCategories);

            // Second request should use cache
            const categories2 = await client.getCategories();
            expect(categories2).toEqual(mockCategories);

            // Verify cache stats
            const stats = client.getCacheStats();
            expect(stats.size).toBeGreaterThan(0);
        });
    });
});
