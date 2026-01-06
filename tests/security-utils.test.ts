// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2025 Broadsage

import { SecurityUtils } from '../src/utils/security-utils';

describe('SecurityUtils', () => {
    describe('isSafeUrl', () => {
        it('should allow safe HTTPS URLs', () => {
            expect(SecurityUtils.isSafeUrl('https://hooks.slack.com/services/test')).toBe(true);
            expect(SecurityUtils.isSafeUrl('https://discord.com/api/webhooks/test')).toBe(true);
        });

        it('should reject HTTP URLs', () => {
            expect(SecurityUtils.isSafeUrl('http://example.com')).toBe(false);
        });

        it('should reject invalid URLs', () => {
            expect(SecurityUtils.isSafeUrl('not-a-url')).toBe(false);
            expect(SecurityUtils.isSafeUrl('')).toBe(false);
        });

        it('should reject localhost', () => {
            expect(SecurityUtils.isSafeUrl('https://localhost/webhook')).toBe(false);
            expect(SecurityUtils.isSafeUrl('https://127.0.0.1/webhook')).toBe(false);
            expect(SecurityUtils.isSafeUrl('https://[::1]/webhook')).toBe(false);
        });

        it('should reject private IP addresses (IPv4)', () => {
            expect(SecurityUtils.isSafeUrl('https://10.0.0.1/webhook')).toBe(false);
            expect(SecurityUtils.isSafeUrl('https://172.16.0.1/webhook')).toBe(false);
            expect(SecurityUtils.isSafeUrl('https://172.31.255.255/webhook')).toBe(false);
            expect(SecurityUtils.isSafeUrl('https://192.168.1.1/webhook')).toBe(false);
            expect(SecurityUtils.isSafeUrl('https://169.254.169.254/webhook')).toBe(false);
        });

        it('should allow public IP addresses', () => {
            expect(SecurityUtils.isSafeUrl('https://1.1.1.1/webhook')).toBe(true);
            expect(SecurityUtils.isSafeUrl('https://8.8.8.8/webhook')).toBe(true);
        });

        it('should reject private IP addresses (IPv6)', () => {
            expect(SecurityUtils.isSafeUrl('https://[fc00::1]/webhook')).toBe(false);
            expect(SecurityUtils.isSafeUrl('https://[fd00::1]/webhook')).toBe(false);
            expect(SecurityUtils.isSafeUrl('https://[fe80::1]/webhook')).toBe(false);
        });

        it('should allow public IPv6 addresses', () => {
            expect(SecurityUtils.isSafeUrl('https://[2001:4860:4860::8888]/webhook')).toBe(true);
        });
    });
});
