// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2025 Broadsage

import { SBOMParser, SBOMFormat } from '../src/sbom-parser';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('SBOMParser', () => {
    let tempDir: string;

    let parser: SBOMParser;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sbom-test-'));
        parser = new SBOMParser();
    });

    afterEach(() => {
        // Clean up temp directory
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    describe('CycloneDX parsing', () => {
        it('should parse CycloneDX SBOM successfully', async () => {
            const sbom = {
                bomFormat: 'CycloneDX',
                specVersion: '1.4',
                components: [
                    {
                        name: 'python',
                        version: '3.11.0',
                        type: 'library',
                    },
                    {
                        name: 'nodejs',
                        version: '18.12.0',
                        type: 'library',
                    },
                ],
            };

            const filePath = path.join(tempDir, 'cyclonedx.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const result = await parser.parseFile(filePath, SBOMFormat.CYCLONEDX);

            expect(result.size).toBe(2);
            expect(result.get('python')).toBe('3.11.0');
            expect(result.get('nodejs')).toBe('18.12.0');
        });

        it('should parse nested components', async () => {
            const sbom = {
                bomFormat: 'CycloneDX',
                specVersion: '1.4',
                components: [
                    {
                        name: 'python',
                        version: '3.11.0',
                        components: [
                            {
                                name: 'django',
                                version: '4.2.0',
                            },
                        ],
                    },
                ],
            };

            const filePath = path.join(tempDir, 'nested.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const result = await parser.parseFile(filePath);

            expect(result.size).toBe(2);
            expect(result.get('python')).toBe('3.11.0');
            expect(result.get('django')).toBe('4.2.0');
        });

        it('should handle components with PURL', () => {
            const sbom = {
                bomFormat: 'CycloneDX',
                specVersion: '1.4',
                components: [
                    {
                        name: 'express',
                        version: '4.18.2',
                        purl: 'pkg:npm/express@4.18.2',
                    },
                ],
            };

            const filePath = path.join(tempDir, 'purl.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const components = parser.parseComponents(filePath);

            expect(components).toHaveLength(1);
            expect(components[0].name).toBe('express');
            expect(components[0].version).toBe('4.18.2');
            expect(components[0].purl).toBe('pkg:npm/express@4.18.2');
        });

        it('should skip components without version', async () => {
            const sbom = {
                bomFormat: 'CycloneDX',
                specVersion: '1.4',
                components: [
                    {
                        name: 'python',
                        version: '3.11.0',
                    },
                    {
                        name: 'no-version-component',
                        // Missing version
                    },
                ],
            };

            const filePath = path.join(tempDir, 'missing-version.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const result = await parser.parseFile(filePath);

            expect(result.size).toBe(1);
            expect(result.get('python')).toBe('3.11.0');
        });
    });

    describe('SPDX parsing', () => {
        it('should parse SPDX SBOM successfully', async () => {
            const sbom = {
                spdxVersion: 'SPDX-2.3',
                packages: [
                    {
                        name: 'python',
                        versionInfo: '3.11.0',
                    },
                    {
                        name: 'nodejs',
                        versionInfo: '18.12.0',
                    },
                ],
            };

            const filePath = path.join(tempDir, 'spdx.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const result = await parser.parseFile(filePath, SBOMFormat.SPDX);

            expect(result.size).toBe(2);
            expect(result.get('python')).toBe('3.11.0');
            expect(result.get('nodejs')).toBe('18.12.0');
        });

        it('should handle packages with external refs', () => {
            const sbom = {
                spdxVersion: 'SPDX-2.3',
                packages: [
                    {
                        name: 'express',
                        versionInfo: '4.18.2',
                        externalRefs: [
                            {
                                referenceCategory: 'PACKAGE-MANAGER',
                                referenceType: 'purl',
                                referenceLocator: 'pkg:npm/express@4.18.2',
                            },
                        ],
                    },
                ],
            };

            const filePath = path.join(tempDir, 'spdx-refs.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const components = parser.parseComponents(filePath, SBOMFormat.SPDX);

            expect(components).toHaveLength(1);
            expect(components[0].purl).toBe('pkg:npm/express@4.18.2');
        });

        it('should skip packages without version', async () => {
            const sbom = {
                spdxVersion: 'SPDX-2.3',
                packages: [
                    {
                        name: 'python',
                        versionInfo: '3.11.0',
                    },
                    {
                        name: 'no-version-package',
                        // Missing versionInfo
                    },
                ],
            };

            const filePath = path.join(tempDir, 'spdx-missing-version.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const result = await parser.parseFile(filePath, SBOMFormat.SPDX);

            expect(result.size).toBe(1);
            expect(result.get('python')).toBe('3.11.0');
        });
    });

    describe('Format detection', () => {
        it('should auto-detect CycloneDX format', async () => {
            const sbom = {
                bomFormat: 'CycloneDX',
                specVersion: '1.4',
                components: [
                    {
                        name: 'python',
                        version: '3.11.0',
                    },
                ],
            };

            const filePath = path.join(tempDir, 'auto-cyclonedx.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const result = await parser.parseFile(filePath, SBOMFormat.AUTO);

            expect(result.size).toBe(1);
            expect(result.get('python')).toBe('3.11.0');
        });

        it('should auto-detect SPDX format', async () => {
            const sbom = {
                spdxVersion: 'SPDX-2.3',
                packages: [
                    {
                        name: 'nodejs',
                        versionInfo: '18.12.0',
                    },
                ],
            };

            const filePath = path.join(tempDir, 'auto-spdx.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const result = await parser.parseFile(filePath, SBOMFormat.AUTO);

            expect(result.size).toBe(1);
            expect(result.get('nodejs')).toBe('18.12.0');
        });

        it('should throw error for unknown format', async () => {
            const sbom = {
                unknownField: 'value',
            };

            const filePath = path.join(tempDir, 'unknown.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            await expect(parser.parseFile(filePath, SBOMFormat.AUTO)).rejects.toThrow('Unable to detect SBOM format');
        });
    });

    describe('Component mapping', () => {
        it('should map python3 to python', async () => {
            const sbom = {
                bomFormat: 'CycloneDX',
                specVersion: '1.4',
                components: [
                    {
                        name: 'python3',
                        version: '3.11.0',
                    },
                ],
            };

            const filePath = path.join(tempDir, 'python3.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const result = await parser.parseFile(filePath);

            expect(result.get('python')).toBe('3.11.0');
        });

        it('should map node to nodejs', async () => {
            const sbom = {
                bomFormat: 'CycloneDX',
                specVersion: '1.4',
                components: [
                    {
                        name: 'node',
                        version: '18.12.0',
                    },
                ],
            };

            const filePath = path.join(tempDir, 'node.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const result = await parser.parseFile(filePath);

            expect(result.get('nodejs')).toBe('18.12.0');
        });

        it('should map postgres to postgresql', async () => {
            const sbom = {
                bomFormat: 'CycloneDX',
                specVersion: '1.4',
                components: [
                    {
                        name: 'postgres',
                        version: '15.2',
                    },
                ],
            };

            const filePath = path.join(tempDir, 'postgres.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const result = await parser.parseFile(filePath);

            expect(result.get('postgresql')).toBe('15.2');
        });

        it('should handle case-insensitive mapping', async () => {
            const sbom = {
                bomFormat: 'CycloneDX',
                specVersion: '1.4',
                components: [
                    {
                        name: 'Python',
                        version: '3.11.0',
                    },
                    {
                        name: 'NodeJS',
                        version: '18.12.0',
                    },
                ],
            };

            const filePath = path.join(tempDir, 'case-insensitive.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const result = await parser.parseFile(filePath);

            expect(result.get('python')).toBe('3.11.0');
            expect(result.get('nodejs')).toBe('18.12.0');
        });

        it('should use custom mapping if provided', async () => {
            const sbom = {
                bomFormat: 'CycloneDX',
                specVersion: '1.4',
                components: [
                    {
                        name: 'my-custom-python',
                        version: '3.11.0',
                    },
                ],
            };

            const filePath = path.join(tempDir, 'custom-mapping.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const customMapping = {
                'my-custom-python': 'python',
            };

            const result = await parser.parseFile(
                filePath,
                SBOMFormat.CYCLONEDX,
                customMapping
            );

            expect(result.get('python')).toBe('3.11.0');
        });

        it('should resolve product using identifier resolution', async () => {
            const mockClient = {
                resolveProductFromIdentifier: jest.fn().mockResolvedValue('resolved-product'),
            } as any;
            const parserWithClient = new SBOMParser(mockClient);

            const sbom = {
                bomFormat: 'CycloneDX',
                specVersion: '1.4',
                components: [
                    {
                        name: 'unknown-name',
                        version: '1.2.3',
                        purl: 'pkg:generic/unknown@1.2.3',
                    },
                ],
            };

            const filePath = path.join(tempDir, 'resolution.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const result = await parserWithClient.parseFile(filePath);

            expect(mockClient.resolveProductFromIdentifier).toHaveBeenCalledWith('pkg:generic/unknown@1.2.3');
            expect(result.get('resolved-product')).toBe('1.2.3');
        });
    });

    describe('Statistics', () => {
        it('should return correct statistics', async () => {
            const sbom = {
                bomFormat: 'CycloneDX',
                specVersion: '1.4',
                components: [
                    {
                        name: 'python',
                        version: '3.11.0',
                    },
                    {
                        name: 'nodejs',
                        version: '18.12.0',
                    },
                    {
                        name: 'unmapped-component',
                        version: '1.0.0',
                    },
                ],
            };

            const filePath = path.join(tempDir, 'stats.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const stats = await parser.getStatistics(filePath);

            expect(stats.format).toBe('cyclonedx');
            expect(stats.totalComponents).toBe(3);
            expect(stats.mappedComponents).toBe(2);
            expect(stats.unmappedComponents).toContain('unmapped-component');
        });
    });

    describe('Error handling', () => {
        it('should throw error for non-existent file', async () => {
            await expect(parser.parseFile('/non/existent/file.json')).rejects.toThrow('Failed to parse SBOM file');
        });

        it('should throw error for invalid JSON', async () => {
            const filePath = path.join(tempDir, 'invalid.json');
            fs.writeFileSync(filePath, 'invalid json');

            await expect(parser.parseFile(filePath)).rejects.toThrow('Failed to parse SBOM file');
        });

        it('should handle empty components array', async () => {
            const sbom = {
                bomFormat: 'CycloneDX',
                specVersion: '1.4',
                components: [],
            };

            const filePath = path.join(tempDir, 'empty.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const result = await parser.parseFile(filePath);

            expect(result.size).toBe(0);
        });

        it('should handle missing components field', async () => {
            const sbom = {
                bomFormat: 'CycloneDX',
                specVersion: '1.4',
            };

            const filePath = path.join(tempDir, 'no-components.json');
            fs.writeFileSync(filePath, JSON.stringify(sbom));

            const result = await parser.parseFile(filePath);

            expect(result.size).toBe(0);
        });
    });
});
