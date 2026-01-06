// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2025 Broadsage

import { URL } from 'url';
import { isIP } from 'net';

/**
 * Utility for SSRF prevention and URL validation
 */
export class SecurityUtils {
  /**
   * Validate if a URL is safe for webhook notification
   * @param urlString - The URL to validate
   * @returns true if safe, false otherwise
   */
  static isSafeUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);

      // Enforce HTTPS
      if (url.protocol !== 'https:') {
        return false;
      }

      let host = url.hostname;

      // Strip brackets for IPv6
      if (host.startsWith('[') && host.endsWith(']')) {
        host = host.substring(1, host.length - 1);
      }

      const ipType = isIP(host);

      // Check if host is an IP address
      if (ipType) {
        return !this.isPrivateIP(host);
      }

      // Check if host is localhost
      if (host.toLowerCase() === 'localhost') {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if an IP address is private/internal
   */
  private static isPrivateIP(ip: string): boolean {
    // 127.0.0.1/8
    if (ip.startsWith('127.')) return true;

    // 10.0.0.0/8
    if (ip.startsWith('10.')) return true;

    // 172.16.0.0/12
    if (ip.startsWith('172.')) {
      const secondOctet = parseInt(ip.split('.')[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) return true;
    }

    // 192.168.0.0/16
    if (ip.startsWith('192.168.')) return true;

    // 169.254.0.0/16 (Link-local)
    if (ip.startsWith('169.254.')) return true;

    // IPv6 Loopback
    if (ip === '::1') return true;

    // IPv6 Private (Unique Local Address) fc00::/7
    if (
      ip.toLowerCase().startsWith('fc00:') ||
      ip.toLowerCase().startsWith('fd00:')
    )
      return true;

    // IPv6 Link-local fe80::/10
    if (ip.toLowerCase().startsWith('fe80:')) return true;

    return false;
  }
}
