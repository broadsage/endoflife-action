// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2025 Broadsage

import { WebhookChannel } from '../../../src/notifications/channels/webhook';
import { NotificationChannelType, NotificationMessage, NotificationSeverity } from '../../../src/notifications/types';
import { HttpClient } from '@actions/http-client';

// Mock HttpClient
jest.mock('@actions/http-client');

describe('WebhookChannel', () => {
    let channel: WebhookChannel;
    let mockHttpClient: jest.Mocked<HttpClient>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mock
        mockHttpClient = {
            postJson: jest.fn(),
        } as any;

        (HttpClient as jest.MockedClass<typeof HttpClient>).mockImplementation(() => mockHttpClient);

        channel = new WebhookChannel('https://example.com/webhook');
    });

    describe('properties', () => {
        it('should have correct name and type', () => {
            expect(channel.name).toBe('Generic Webhook');
            expect(channel.type).toBe(NotificationChannelType.WEBHOOK);
        });
    });

    describe('constructor', () => {
        it('should accept custom headers', () => {
            const customChannel = new WebhookChannel(
                'https://example.com/webhook',
                { 'X-Custom-Header': 'value' }
            );

            expect(customChannel).toBeDefined();
        });

        it('should accept retry configuration', () => {
            const customChannel = new WebhookChannel(
                'https://example.com/webhook',
                {},
                5,
                2000
            );

            expect(customChannel).toBeDefined();
        });
    });

    describe('buildPayload', () => {
        it('should build standardized webhook payload', () => {
            const message: NotificationMessage = {
                title: 'Test Title',
                summary: 'Test Summary',
                severity: NotificationSeverity.INFO,
                fields: [
                    { name: 'Field 1', value: 'Value 1', inline: true },
                ],
                timestamp: new Date('2025-01-01T00:00:00Z'),
                repository: 'test/repo',
                runUrl: 'https://github.com/test/repo/actions/runs/123',
            };

            const payload = channel['buildPayload'](message);

            expect(payload.event).toBe('eol_check_completed');
            expect(payload.timestamp).toBe('2025-01-01T00:00:00.000Z');
            expect(payload.repository).toBe('test/repo');
            expect(payload.severity).toBe(NotificationSeverity.INFO);
            expect(payload.title).toBe('Test Title');
            expect(payload.summary).toBe('Test Summary');
            expect(payload.fields).toHaveLength(1);
            expect(payload.runUrl).toBe('https://github.com/test/repo/actions/runs/123');
            expect(payload.metadata.action).toBe('broadsage-eol-action');
            expect(payload.metadata.version).toBe('3.0.0');
        });

        it('should handle missing optional fields', () => {
            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.INFO,
                fields: [],
                timestamp: new Date('2025-01-01T00:00:00Z'),
            };

            const payload = channel['buildPayload'](message);

            expect(payload.repository).toBe('unknown');
            expect(payload.runUrl).toBeUndefined();
        });

        it('should include all fields', () => {
            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.WARNING,
                fields: [
                    { name: 'Field 1', value: 'Value 1', inline: true },
                    { name: 'Field 2', value: 'Value 2', inline: false },
                ],
                timestamp: new Date(),
            };

            const payload = channel['buildPayload'](message);

            expect(payload.fields).toHaveLength(2);
            expect(payload.fields[0].name).toBe('Field 1');
            expect(payload.fields[0].value).toBe('Value 1');
            expect(payload.fields[0].inline).toBe(true);
        });
    });

    describe('sendRequest', () => {
        it('should send request with default headers', async () => {
            mockHttpClient.postJson.mockResolvedValue({
                statusCode: 200,
                result: null,
                headers: {},
            });

            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.INFO,
                fields: [],
                timestamp: new Date(),
            };

            await channel.send(message);

            expect(mockHttpClient.postJson).toHaveBeenCalledWith(
                'https://example.com/webhook',
                expect.any(Object),
                expect.objectContaining({
                    'Content-Type': 'application/json',
                })
            );
        });

        it('should send request with custom headers', async () => {
            const customChannel = new WebhookChannel(
                'https://example.com/webhook',
                { 'X-Custom-Header': 'custom-value', 'Authorization': 'Bearer token' }
            );

            mockHttpClient.postJson.mockResolvedValue({
                statusCode: 200,
                result: null,
                headers: {},
            });

            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.INFO,
                fields: [],
                timestamp: new Date(),
            };

            await customChannel.send(message);

            expect(mockHttpClient.postJson).toHaveBeenCalledWith(
                'https://example.com/webhook',
                expect.any(Object),
                expect.objectContaining({
                    'Content-Type': 'application/json',
                    'X-Custom-Header': 'custom-value',
                    'Authorization': 'Bearer token',
                })
            );
        });

        it('should throw error on non-2xx status code', async () => {
            mockHttpClient.postJson.mockResolvedValue({
                statusCode: 400,
                result: null,
                headers: {},
            });

            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.INFO,
                fields: [],
                timestamp: new Date(),
            };

            await expect(channel.send(message)).rejects.toThrow('HTTP 400: Request failed');
        });

        it('should throw error when status code is missing', async () => {
            mockHttpClient.postJson.mockResolvedValue({
                statusCode: undefined,
                result: null,
                headers: {},
            } as any);

            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.INFO,
                fields: [],
                timestamp: new Date(),
            };

            await expect(channel.send(message)).rejects.toThrow('HTTP unknown: Request failed');
        });

        it('should throw error on network failure', async () => {
            mockHttpClient.postJson.mockRejectedValue(new Error('Network error'));

            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.INFO,
                fields: [],
                timestamp: new Date(),
            };

            await expect(channel.send(message)).rejects.toThrow('Webhook request failed: Network error');
        });

        it('should handle non-Error exceptions', async () => {
            mockHttpClient.postJson.mockRejectedValue('String error');

            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.INFO,
                fields: [],
                timestamp: new Date(),
            };

            await expect(channel.send(message)).rejects.toThrow('Webhook request failed: String error');
        });
    });

    describe('validate', () => {
        it('should validate correct webhook URL', () => {
            const validChannel = new WebhookChannel('https://example.com/webhook');
            expect(validChannel.validate()).toBe(true);
        });

        it('should reject invalid URL', () => {
            const invalidChannel = new WebhookChannel('not-a-url');
            expect(invalidChannel.validate()).toBe(false);
        });
    });
});
