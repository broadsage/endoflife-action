// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2025 Broadsage

import { TeamsChannel } from '../../../src/notifications/channels/teams';
import { NotificationChannelType, NotificationMessage, NotificationSeverity } from '../../../src/notifications/types';

describe('TeamsChannel', () => {
    let channel: TeamsChannel;

    beforeEach(() => {
        channel = new TeamsChannel('https://outlook.office.com/webhook/123/IncomingWebhook/456');
    });

    describe('properties', () => {
        it('should have correct name and type', () => {
            expect(channel.name).toBe('Microsoft Teams');
            expect(channel.type).toBe(NotificationChannelType.TEAMS);
        });
    });

    describe('buildPayload', () => {
        it('should build basic message card', () => {
            const message: NotificationMessage = {
                title: 'Test Title',
                summary: 'Test Summary',
                severity: NotificationSeverity.INFO,
                fields: [],
                timestamp: new Date('2025-01-01T00:00:00Z'),
                color: '#00FF00',
            };

            const payload = channel['buildPayload'](message);

            expect(payload['@type']).toBe('MessageCard');
            expect(payload['@context']).toBe('https://schema.org/extensions');
            expect(payload.title).toBe('Test Title');
            expect(payload.summary).toBe('Test Title');
        });

        it('should convert hex color correctly', () => {
            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.ERROR,
                fields: [],
                timestamp: new Date(),
                color: '#FF0000',
            };

            const payload = channel['buildPayload'](message);

            expect(payload.themeColor).toBe('FF0000'); // Without # prefix
        });

        it('should include repository as activity subtitle', () => {
            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.INFO,
                fields: [],
                timestamp: new Date(),
                repository: 'test/repo',
            };

            const payload = channel['buildPayload'](message);

            expect(payload.sections[0].activitySubtitle).toBe('test/repo');
        });

        it('should use default subtitle when no repository', () => {
            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.INFO,
                fields: [],
                timestamp: new Date(),
            };

            const payload = channel['buildPayload'](message);

            expect(payload.sections[0].activitySubtitle).toBe('EOL Check');
        });

        it('should include fields as facts', () => {
            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.INFO,
                fields: [
                    { name: 'Field 1', value: 'Value 1', inline: true },
                    { name: 'Field 2', value: 'Value 2', inline: false },
                ],
                timestamp: new Date(),
            };

            const payload = channel['buildPayload'](message);

            expect(payload.sections).toHaveLength(2);
            expect(payload.sections[1].facts).toHaveLength(2);
            expect(payload.sections[1].facts![0].title).toBe('Field 1');
            expect(payload.sections[1].facts![0].value).toBe('Value 1');
        });

        it('should limit facts to 10', () => {
            const fields = Array.from({ length: 15 }, (_, i) => ({
                name: `Field ${i}`,
                value: `Value ${i}`,
                inline: true,
            }));

            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.INFO,
                fields,
                timestamp: new Date(),
            };

            const payload = channel['buildPayload'](message);

            expect(payload.sections[1].facts).toHaveLength(10);
        });

        it('should include summary in first section', () => {
            const message: NotificationMessage = {
                title: 'Test Title',
                summary: 'Test Summary Content',
                severity: NotificationSeverity.INFO,
                fields: [],
                timestamp: new Date(),
            };

            const payload = channel['buildPayload'](message);

            expect(payload.sections[0].text).toBe('Test Summary Content');
        });

        it('should include action button with run URL', () => {
            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.INFO,
                fields: [],
                timestamp: new Date(),
                runUrl: 'https://github.com/test/repo/actions/runs/123',
            };

            const payload = channel['buildPayload'](message);

            expect(payload.potentialAction).toBeDefined();
            expect(payload.potentialAction).toHaveLength(1);
            expect(payload.potentialAction![0].type).toBe('OpenUri');
            expect(payload.potentialAction![0].title).toBe('View Workflow Run');
            expect(payload.potentialAction![0].url).toBe('https://github.com/test/repo/actions/runs/123');
        });

        it('should not include action button when no run URL', () => {
            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.INFO,
                fields: [],
                timestamp: new Date(),
            };

            const payload = channel['buildPayload'](message);

            expect(payload.potentialAction).toBeUndefined();
        });

        it('should handle default color', () => {
            const message: NotificationMessage = {
                title: 'Test',
                summary: 'Test',
                severity: NotificationSeverity.INFO,
                fields: [],
                timestamp: new Date(),
            };

            const payload = channel['buildPayload'](message);

            expect(payload.themeColor).toBe('808080'); // Default gray
        });
    });

    describe('validate', () => {
        it('should validate correct Teams webhook URL', () => {
            const validChannel = new TeamsChannel('https://outlook.office.com/webhook/123/IncomingWebhook/456');
            expect(validChannel.validate()).toBe(true);
        });

        it('should reject invalid URL', () => {
            const invalidChannel = new TeamsChannel('not-a-url');
            expect(invalidChannel.validate()).toBe(false);
        });
    });
});
