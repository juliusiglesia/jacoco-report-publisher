import { CoverageSummary, File } from '../models/coverage';
import { ActionOptions } from '../models/options';
import { PullRequestMarker } from './args';

// eslint-disable-next-line no-shadow
const enum CoverageStatusIcon {
    Pass = ':white_check_mark:',
    Fail = ':x:',
    None = ':yellow_circle:'
}

export function getPullRequestCommentBody(
    coverage: CoverageSummary,
    options: ActionOptions
): string {
    const modifiedFilesInstructionsCoverageStatus = getCoverageStatusIcon(
        coverage.modifiedFiles.instructions.percentage,
        options.minModifiedFilesInstructionsCoverage
    );

    const modifiedFilesInstructionsCoverage = formatCoverage(
        coverage.modifiedFiles.instructions.percentage
    );

    const modifiedFilesBranchCoverageStatus = getCoverageStatusIcon(
        coverage.modifiedFiles.branch.percentage,
        options.minModifiedFilesBranchCoverage
    );

    const modifiedFilesBranchCoverage = formatCoverage(
        coverage.modifiedFiles.branch.percentage
    );

    const overallInstructionsCoverageStatus = getCoverageStatusIcon(
        coverage.project.instructions.percentage,
        options.minOverallInstructionsCoverage
    );

    const overallInstructionsCoverage = formatCoverage(
        coverage.project.instructions.percentage
    );

    const overallBranchCoverageStatus = getCoverageStatusIcon(
        coverage.project.branch.percentage,
        options.minOverallBranchCoverage
    );

    const overallBranchCoverage = formatCoverage(
        coverage.project.branch.percentage
    );

    const body = `<details open >
    <summary> <b>Modified Files Coverage Summary</b>
        <br />
        &nbsp; &nbsp; ${modifiedFilesInstructionsCoverageStatus} Instructions Coverage (${modifiedFilesInstructionsCoverage}) 
        <br />
        &nbsp; &nbsp; ${modifiedFilesBranchCoverageStatus} Instructions Coverage (${modifiedFilesBranchCoverage}) 
    </summary>
    <br />

|File|Instructions Coverage (${modifiedFilesInstructionsCoverage})|${modifiedFilesInstructionsCoverageStatus}|Branch Coverage (${modifiedFilesBranchCoverage})|${modifiedFilesBranchCoverageStatus}|
|:-|:-:|:-:|:-:|:-:|
${coverage.modifiedFiles.files
    .map(cov => {
        const file = formatFileLinkMarkdown(cov.file);
        const fileInstructionsCoverageStatus = getCoverageStatusIcon(
            cov.instructions.percentage,
            options.minModifiedFilesInstructionsCoverage
        );

        const fileInstructionsCoverage = formatCoverage(
            cov.instructions.percentage
        );

        const fileBranchCoverageStatus = getCoverageStatusIcon(
            cov.branch.percentage,
            options.minModifiedFilesBranchCoverage
        );

        const fileBranchCoverage = formatCoverage(cov.branch.percentage);

        return `|${file}|${fileInstructionsCoverage}|${fileInstructionsCoverageStatus}|${fileBranchCoverage}|${fileBranchCoverageStatus}|`;
    })
    .join('\n')}
</details>

<br />
<details>
    <summary> <b>Overall Coverage Summary</b>
        <br />
        &nbsp; &nbsp; ${overallInstructionsCoverageStatus} Instructions Coverage (${overallInstructionsCoverage}) 
       <br />
        &nbsp; &nbsp; ${overallBranchCoverageStatus} Branch Coverage (${overallBranchCoverage}) 
    </summary>
</details>
`;
    if (options.pullRequestTitle) {
        return `${getPullRequestTitle(
            options
        )}\n${body}\n\n${PullRequestMarker}`;
    }

    return body;
}

function getPullRequestTitle(options: ActionOptions): string {
    const title = options.pullRequestTitle;
    if (title != null && title.length > 0) {
        return `### ${title}`;
    } else {
        return '';
    }
}

function getCoverageStatusIcon(
    coverage: number | undefined,
    minCoverage: number
): CoverageStatusIcon {
    if (coverage == null) {
        return CoverageStatusIcon.None;
    }

    if (coverage < minCoverage) {
        return CoverageStatusIcon.Fail;
    }

    return CoverageStatusIcon.Pass;
}

function formatCoverage(coverage: number | undefined): string {
    if (coverage == null) {
        return 'NA';
    }

    return `${parseFloat(coverage.toFixed(2))}%`;
}

function formatFileLinkMarkdown(file: File): string {
    return `[${file.path}](${file.url})`;
}
