// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2025 Broadsage

import * as core from '@actions/core';
import * as fs from 'fs/promises';
import { ActionResults, EolStatus, ProductVersionInfo } from './types';
import { getErrorMessage } from './utils/error-utils';

/**
 * Helper class for generating Markdown components
 */
class MarkdownHelper {
  /**
   * Format a product version row for a table
   */
  static formatProductRow(
    p: ProductVersionInfo,
    type: 'standard' | 'dashboard' | 'stale' | 'discontinued'
  ): string {
    switch (type) {
      case 'dashboard':
        return `| **${p.product}** | \`${p.release}\` | ${p.eolDate || 'N/A'} | ${p.isLts ? '✓' : '✗'} | Update to \`${p.latestVersion || 'latest'}\` |`;
      case 'stale':
        return `| **${p.product}** | \`${p.release}\` | ${p.latestReleaseDate || 'N/A'} | \`${p.daysSinceLatestRelease}\` days stale |`;
      case 'discontinued':
        return `| **${p.product}** | \`${p.release}\` | ${p.discontinuedDate || 'N/A'} |`;
      default:
        return `| ${p.product} | ${p.release} | ${p.eolDate || 'N/A'} | ${p.latestVersion || 'N/A'} | ${p.isLts ? '✓' : '✗'} |`;
    }
  }

  /**
   * Format a task list item for review
   */
  static formatTaskItem(
    p: ProductVersionInfo,
    type: 'eol' | 'stale',
    isCompleted = false
  ): string {
    const icon = type === 'eol' ? '❌' : '⏰';
    const label = type === 'eol' ? 'Upgrade' : 'Review';
    const checkbox = isCompleted ? '[x]' : '[ ]';
    return `- ${checkbox} ${icon} **${label} ${p.product} ${p.release}** (EOL: ${p.eolDate || 'N/A'})`;
  }

  /**
   * Create a Markdown table
   */
  static createTable(headers: string[], rows: string[]): string {
    if (rows.length === 0) return '';
    const alignment = headers.map(() => '---').join(' | ');
    return [`| ${headers.join(' | ')} |`, `| ${alignment} |`, ...rows, ''].join(
      '\n'
    );
  }

  /**
   * Create a section header with optional description
   */
  static createSection(
    title: string,
    description?: string,
    level: number = 2
  ): string {
    const prefix = '#'.repeat(level);
    return description
      ? `${prefix} ${title}\n\n${description}\n`
      : `${prefix} ${title}\n`;
  }

  /**
   * Create a collapsed details section
   */
  static createDetails(summary: string, content: string): string {
    return `<details><summary>${summary}</summary>\n\n${content}\n</details>\n`;
  }
}

/**
 * Format results as JSON
 */
export function formatAsJson(results: ActionResults): string {
  return JSON.stringify(results, null, 2);
}

/**
 * Format results as Markdown
 */
/**
 * Format results as Markdown for GitHub Step Summary
 */
export function formatAsMarkdown(results: ActionResults): string {
  const lines: string[] = [];

  lines.push('# 📊 Software Lifecycle Analysis Report\n');

  const eolCount = results.eolProducts.length;
  const approachingCount = results.approachingEolProducts.length;
  const staleCount = results.staleProducts.length;
  const discontinuedCount = results.discontinuedProducts.length;
  const activeProducts = results.products.filter(
    (p) => p.status === EolStatus.ACTIVE
  );

  // Overview Section
  lines.push('### 📓 Summary of Findings');
  const summaryLine = [
    eolCount > 0 ? `❌ **${eolCount}** EOL` : null,
    approachingCount > 0 ? `⚠️ **${approachingCount}** Warning` : null,
    staleCount > 0 ? `⏰ **${staleCount}** Stale` : null,
    `✅ **${activeProducts.length}** Healthy`,
  ]
    .filter(Boolean)
    .join(' &nbsp;•&nbsp; ');

  lines.push(`> ${summaryLine}\n`);
  lines.push(
    `*Analyzed **${results.totalReleasesChecked}** releases across **${results.totalProductsChecked}** products.*\n`
  );

  // Analysis Details with Collapsible Sections
  if (eolCount > 0) {
    const table = MarkdownHelper.createTable(
      ['Product', 'Release', 'EOL Date', 'Latest Version', 'LTS'],
      results.eolProducts.map((p) =>
        MarkdownHelper.formatProductRow(p, 'standard')
      )
    );
    lines.push(
      MarkdownHelper.createDetails(
        `❌ CRITICAL: ${eolCount} End-of-Life versions detected`,
        `**Description:** The following software versions have reached their End-of-Life (EOL) date. They no longer receive security updates or bug fixes and should be upgraded immediately to the latest supported versions.\n\n${table}`
      )
    );
  }

  if (approachingCount > 0) {
    const table = MarkdownHelper.createTable(
      [
        'Product',
        'Release',
        'Days Until EOL',
        'EOL Date',
        'Latest Version',
        'LTS',
      ],
      results.approachingEolProducts.map(
        (p) =>
          `| ${p.product} | ${p.release} | ${p.daysUntilEol || 'N/A'} | ${p.eolDate || 'N/A'} | ${p.latestVersion || 'N/A'} | ${p.isLts ? '✓' : '✗'} |`
      )
    );
    lines.push(
      MarkdownHelper.createDetails(
        `⚠️ WARNING: ${approachingCount} versions approaching End-of-Life`,
        `**Description:** These versions are nearing their maintenance cutoff. Planning upgrades now will ensure a smooth transition before support ends.\n\n${table}`
      )
    );
  }

  if (staleCount > 0) {
    const table = MarkdownHelper.createTable(
      ['Product', 'Release', 'Last Release Date', 'Days Since Latest'],
      results.staleProducts.map((p) =>
        MarkdownHelper.formatProductRow(p, 'stale')
      )
    );
    lines.push(
      MarkdownHelper.createDetails(
        `⏰ STALE: ${staleCount} stale versions detected`,
        `**Description:** These products haven't seen an update in over a year (or your configured threshold). While they may still be supported, they might be missing recent stability or performance improvements.\n\n${table}`
      )
    );
  }

  if (discontinuedCount > 0) {
    const table = MarkdownHelper.createTable(
      ['Product', 'Release', 'Discontinued Date'],
      results.discontinuedProducts.map((p) =>
        MarkdownHelper.formatProductRow(p, 'discontinued')
      )
    );
    lines.push(
      MarkdownHelper.createDetails(
        `🚫 **${discontinuedCount}** discontinued products`,
        `**Description:** These products have been discontinued by their maintainers. It is recommended to look for alternative solutions.\n\n${table}`
      )
    );
  }

  if (activeProducts.length > 0) {
    const table = MarkdownHelper.createTable(
      ['Product', 'Release', 'EOL Date', 'Latest Version', 'LTS'],
      activeProducts.map((p) => MarkdownHelper.formatProductRow(p, 'standard'))
    );
    lines.push(
      MarkdownHelper.createDetails(
        `✅ HEALTHY: ${activeProducts.length} versions with active support`,
        `**Description:** These versions are fully supported and up to date.\n\n${table}`
      )
    );
  }

  if (eolCount === 0 && approachingCount === 0) {
    lines.push('\n### ✅ All Clear!');
    lines.push('All tracked versions are actively supported and secure.\n');
  }

  lines.push('\n---\n');
  lines.push(
    `*Report generated by [Software Lifecycle Tracker](https://github.com/broadsage/lifecycle-action)*`
  );

  return lines.join('\n');
}

/**
 * Write results to GitHub Step Summary
 */
export async function writeToStepSummary(
  results: ActionResults
): Promise<void> {
  const markdown = formatAsMarkdown(results);
  await core.summary.addRaw(markdown).write();
}

/**
 * Write results to file
 */
export async function writeToFile(
  filePath: string,
  content: string
): Promise<void> {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    core.info(`Results written to ${filePath}`);
  } catch (error) {
    core.error(
      `Failed to write to file ${filePath}: ${getErrorMessage(error)}`
    );
    throw error;
  }
}

/**
 * Generate simple matrix output for GitHub Actions
 */
export function generateMatrix(
  results: ActionResults,
  excludeEol = true,
  excludeApproachingEol = false
): { versions: string[] } {
  let products = results.products;
  if (excludeEol)
    products = products.filter((p) => p.status !== EolStatus.END_OF_LIFE);
  if (excludeApproachingEol)
    products = products.filter((p) => p.status !== EolStatus.APPROACHING_EOL);
  return { versions: products.map((p) => p.release) };
}

/**
 * Generate detailed matrix output with metadata
 */
export function generateMatrixInclude(
  results: ActionResults,
  excludeEol = true,
  excludeApproachingEol = false
): {
  include: Array<{
    version: string;
    release: string;
    isLts: boolean;
    eolDate: string | null;
    status: string;
    releaseDate: string | null;
  }>;
} {
  let products = results.products;
  if (excludeEol)
    products = products.filter((p) => p.status !== EolStatus.END_OF_LIFE);
  if (excludeApproachingEol)
    products = products.filter((p) => p.status !== EolStatus.APPROACHING_EOL);
  return {
    include: products.map((p) => ({
      version: p.release,
      release: p.release,
      isLts: p.isLts,
      eolDate: p.eolDate,
      status: p.status,
      releaseDate: p.releaseDate,
    })),
  };
}

/**
 * Set action outputs
 */
export function setOutputs(results: ActionResults): void {
  const outputs = {
    'eol-detected': results.eolDetected,
    'approaching-eol': results.approachingEol,
    results: JSON.stringify(results),
    'eol-products': JSON.stringify(results.eolProducts),
    'approaching-eol-products': JSON.stringify(results.approachingEolProducts),
    'latest-versions': JSON.stringify(results.latestVersions),
    summary: results.summary,
    'total-products-checked': results.totalProductsChecked,
    'total-releases-checked': results.totalReleasesChecked,
    'stale-detected': results.staleDetected,
    'stale-products': JSON.stringify(results.staleProducts),
    'discontinued-detected': results.discontinuedDetected,
    'discontinued-products': JSON.stringify(results.discontinuedProducts),
    'extended-support-products': JSON.stringify(
      results.extendedSupportProducts
    ),
    matrix: results.matrix ? JSON.stringify(results.matrix) : undefined,
    'matrix-include': results.matrixInclude
      ? JSON.stringify(results.matrixInclude)
      : undefined,
  };

  for (const [key, value] of Object.entries(outputs)) {
    if (value !== undefined) core.setOutput(key, value);
  }
}

/**
 * Create issue body for EOL detection
 */
export function createIssueBody(results: ActionResults): string {
  const lines: string[] = [
    '# 🚨 End-of-Life Software Detected\n',
    'This issue was automatically created by the Software Lifecycle Tracker because end-of-life software versions were detected.\n',
  ];

  if (results.eolProducts.length > 0) {
    lines.push(MarkdownHelper.createSection('❌ End-of-Life Versions'));
    lines.push(
      results.eolProducts
        .map((p) => {
          const parts = [
            `### ${p.product} ${p.release}`,
            `- **EOL Date:** ${p.eolDate || 'N/A'}`,
            `- **Latest Version:** ${p.latestVersion || 'N/A'}`,
            `- **LTS:** ${p.isLts ? 'Yes' : 'No'}`,
          ];
          if (p.link) parts.push(`- **More Info:** ${p.link}`);
          return parts.join('\n');
        })
        .join('\n\n')
    );
    lines.push('');
  }

  if (results.approachingEolProducts.length > 0) {
    lines.push(MarkdownHelper.createSection('⚠️ Approaching End-of-Life'));
    lines.push(
      results.approachingEolProducts
        .map((p) => {
          const parts = [
            `### ${p.product} ${p.release}`,
            `- **Days Until EOL:** ${p.daysUntilEol}`,
            `- **EOL Date:** ${p.eolDate || 'N/A'}`,
            `- **Latest Version:** ${p.latestVersion || 'N/A'}`,
            `- **LTS:** ${p.isLts ? 'Yes' : 'No'}`,
          ];
          if (p.link) parts.push(`- **More Info:** ${p.link}`);
          return parts.join('\n');
        })
        .join('\n\n')
    );
    lines.push('');
  }

  if (results.staleProducts.length > 0) {
    lines.push(MarkdownHelper.createSection('⏰ Stale Versions'));
    lines.push(
      results.staleProducts
        .map((p) => {
          return [
            `### ${p.product} ${p.release}`,
            `- **Days Since Latest Release:** ${p.daysSinceLatestRelease}`,
            `- **Last Release Date:** ${p.latestReleaseDate || 'N/A'}`,
            `- **Latest Version:** ${p.latestVersion || 'N/A'}`,
          ].join('\n');
        })
        .join('\n\n')
    );
    lines.push('');
  }

  if (results.discontinuedProducts.length > 0) {
    lines.push(MarkdownHelper.createSection('🚫 Discontinued Products'));
    lines.push(
      results.discontinuedProducts
        .map((p) => {
          const parts = [
            `### ${p.product} ${p.release}`,
            `- **Latest Version:** ${p.latestVersion || 'N/A'}`,
          ];
          if (p.discontinuedDate)
            parts.push(`- **Discontinued Date:** ${p.discontinuedDate}`);
          return parts.join('\n');
        })
        .join('\n\n')
    );
    lines.push('');
  }

  lines.push('## 📋 Recommended Actions\n');
  lines.push('1. Review the affected software versions');
  lines.push('2. Plan migration to supported versions');
  lines.push('3. Update dependencies and configurations');
  lines.push('4. Test thoroughly before deploying\n');
  lines.push(
    '---\n*This issue was created automatically by [Software Lifecycle Tracker](https://github.com/broadsage/lifecycle-action)*'
  );

  return lines.join('\n');
}

/**
 * Create a modern lifecycle dashboard body
 */
export function formatAsDashboard(
  results: ActionResults,
  completedTasks: string[] = []
): string {
  const lines: string[] = [
    '# 🛡️ Software Lifecycle Dashboard\n',
    'This dashboard provides a live overview of the support status for your software dependencies. High-risk items require manual review and confirmation.\n',
  ];

  const eolCount = results.eolProducts.length;
  const approachingCount = results.approachingEolProducts.length;
  const staleCount = results.staleProducts.length;
  const healthyCount = results.products.filter(
    (p) => p.status === EolStatus.ACTIVE
  ).length;

  // 1. Status Overview (Visual)
  lines.push('### 📊 Status Overview');
  lines.push(
    `> 🔴 **${eolCount}** Critical | 🟠 **${approachingCount}** Warning | ⏰ **${staleCount}** Stale | 🟢 **${healthyCount}** Healthy\n`
  );

  // 2. Review & Management (Actionable Task List)
  if (eolCount > 0 || staleCount > 0) {
    lines.push('## 📝 Action Items (Review & Confirm)');
    lines.push(
      'Review the following critical items and check them off once migration or risk assessment is complete.'
    );

    if (eolCount > 0) {
      lines.push('\n### 🚨 Critical Upgrades');
      results.eolProducts.forEach((p) => {
        const taskKey = `${p.product} ${p.release}`;
        const isCompleted = completedTasks.includes(taskKey);
        lines.push(MarkdownHelper.formatTaskItem(p, 'eol', isCompleted));
      });
    }

    if (staleCount > 0) {
      lines.push('\n### ⏰ Maintenance Required');
      results.staleProducts.forEach((p) => {
        const taskKey = `${p.product} ${p.release}`;
        const isCompleted = completedTasks.includes(taskKey);
        lines.push(MarkdownHelper.formatTaskItem(p, 'stale', isCompleted));
      });
    }
    lines.push('\n---\n');
  } else {
    lines.push('## ✅ No Action Required');
    lines.push(
      'All dependencies are currently healthy and up-to-date.\n\n---\n'
    );
  }

  // 3. Detailed Inventory Sections
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const recentEol = results.eolProducts.filter(
    (p) => p.eolDate && new Date(p.eolDate) >= ninetyDaysAgo
  );
  const legacyEol = results.eolProducts.filter(
    (p) => !p.eolDate || new Date(p.eolDate) < ninetyDaysAgo
  );

  if (recentEol.length > 0) {
    lines.push(
      MarkdownHelper.createSection(
        '🔴 Recently End-of-Life',
        'Versions that became unsupported within the last 90 days.'
      )
    );
    lines.push(
      MarkdownHelper.createTable(
        ['Product', 'Version', 'EOL Date', 'LTS', 'Recommended'],
        recentEol.map((p) => MarkdownHelper.formatProductRow(p, 'dashboard'))
      )
    );
  }

  if (results.approachingEolProducts.length > 0) {
    lines.push(
      MarkdownHelper.createSection(
        '🟠 Upcoming Risks',
        'Plan migration before these versions reach End-of-Life.'
      )
    );
    lines.push(
      MarkdownHelper.createTable(
        ['Product', 'Version', 'EOL Date', 'LTS', 'Days Left'],
        results.approachingEolProducts.map(
          (p) =>
            `| **${p.product}** | \`${p.release}\` | ${p.eolDate} | ${p.isLts ? '✓' : '✗'} | \`${p.daysUntilEol}\` days |`
        )
      )
    );
  }

  if (legacyEol.length > 0) {
    lines.push('## 💾 Legacy Support');
    lines.push(
      MarkdownHelper.createDetails(
        'Click to view products EOL for > 90 days',
        MarkdownHelper.createTable(
          ['Product', 'Version', 'EOL Date', 'LTS', 'Latest'],
          legacyEol.map(
            (p) =>
              `| ${p.product} | \`${p.release}\` | ${p.eolDate || 'N/A'} | ${p.isLts ? '✓' : '✗'} | \`${p.latestVersion || 'N/A'}\` |`
          )
        )
      )
    );
  }

  const activeProducts = results.products.filter(
    (p) => p.status === EolStatus.ACTIVE
  );
  if (activeProducts.length > 0) {
    lines.push('## 🟢 Healthy & Supported');
    lines.push(
      MarkdownHelper.createTable(
        ['Product', 'Version', 'EOL Date', 'LTS', 'Latest'],
        activeProducts.map(
          (p) =>
            `| ${p.product} | \`${p.release}\` | ${p.eolDate || 'N/A'} | ${p.isLts ? '✓' : '✗'} | \`${p.latestVersion || 'N/A'}\` |`
        )
      )
    );
  }

  // 4. Configuration Metadata (Renovate Style)
  lines.push('\n---\n');
  lines.push('### ⚙️ Configuration');
  lines.push(
    `- **Scan Date:** ${new Date().toUTCString()}\n` +
      `- **Products Tracked:** ${results.totalProductsChecked}\n` +
      `- **Scan Trigger:** \`${process.env.GITHUB_EVENT_NAME || 'manual'}\`\n` +
      `- **Report Link:** [View Run](${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID})`
  );

  lines.push(
    '\n' +
      `*Generated by [Software Lifecycle Tracker](https://github.com/broadsage/lifecycle-action)*`
  );

  return lines.join('\n');
}
