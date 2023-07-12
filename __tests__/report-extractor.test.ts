import { test, describe, expect } from '@jest/globals';
import { getCoverageSummary } from '../src/commons/report-extractor';
import reportCoverageWithModifiedFiles from './__fixtures__/output/report-coverage.json';
import reportCoverageNoModifiedFiles from './__fixtures__/output/report-coverage-no-modified-files.json';

describe('test report extraction', function () {
    test('coverage summary without modified files', async function () {
        const coverage = await getCoverageSummary(
            ['./__tests__/__fixtures__/input/report.xml'],
            []
        );

        expect(JSON.stringify(coverage)).toBe(
            JSON.stringify(reportCoverageNoModifiedFiles)
        );
    });

    test('coverage summary with modified files', async function () {
        const coverage = await getCoverageSummary(
            ['./__tests__/__fixtures__/input/report.xml'],
            [
                {
                    path: 'com/example/zzz/ports/partnercatalog/BranchCode.java',
                    url: 'https://github.com/owner/repo/blob/main/src/main/java/com/example/zzz/ports/partnercatalog/BranchCode.java'
                },
                {
                    path: 'com/example/hhh/TransferValidationGroup.java',
                    url: 'https://github.com/owner/repo/blob/main/src/main/java/com/example/hhh/TransferValidationGroup.java'
                },
                {
                    path: 'com/example/aaa/config/tracing/CallerIdFilter.java',
                    url: 'https://github.com/owner/repo/blob/main/src/main/java/com/example/aaa/config/tracing/CallerIdFilter.java'
                }
            ]
        );

        expect(JSON.stringify(coverage)).toBe(
            JSON.stringify(reportCoverageWithModifiedFiles)
        );
    });
});
