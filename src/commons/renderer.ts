import {
    CoverageSummary,
    File,
    FilesCoverageSummary,
    ProjectCoverageSummary
} from '../models/coverage';
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
    const body = `${getModifiedFilesCoverageSection(
        coverage.modifiedFiles,
        options
    )}

<br />

${getOverallCoverageSection(coverage.project, options)}

<br />
`;
    if (options.pullRequestTitle) {
        return `${getPullRequestTitle(
            options
        )}\n${body}\n\n${PullRequestMarker}`;
    }

    return body;
}

function getModifiedFilesCoverageSection(
    coverage: FilesCoverageSummary,
    options: ActionOptions
): string {
    const modifiedFilesInstructionsCoverageStatus = getCoverageStatusIcon(
        coverage.instructions.percentage,
        options.minModifiedFilesInstructionsCoverage
    );

    const modifiedFilesInstructionsCoverage = formatCoverage(
        coverage.instructions.percentage
    );

    const modifiedFilesBranchCoverageStatus = getCoverageStatusIcon(
        coverage.branch.percentage,
        options.minModifiedFilesBranchCoverage
    );

    const modifiedFilesBranchCoverage = formatCoverage(
        coverage.branch.percentage
    );

    if (coverage.files.length === 0) {
        return `<details open >
        <summary> <b>Modified Files Coverage Summary</b>
            <br />
            &nbsp; &nbsp; ${modifiedFilesInstructionsCoverageStatus} Instructions Coverage (${modifiedFilesInstructionsCoverage}) 
            <br />
            &nbsp; &nbsp; ${modifiedFilesBranchCoverageStatus} Branch Coverage (${modifiedFilesBranchCoverage}) 
        </summary>
        <br />

> &nbsp;
> No coverage results for the modified files
> &nbsp;
        </details>`;
    }

    return `<details open >
    <summary> <b>Modified Files Coverage Summary</b>
        <br />
        &nbsp; &nbsp; ${modifiedFilesInstructionsCoverageStatus} Instructions Coverage (${modifiedFilesInstructionsCoverage}) 
        <br />
        &nbsp; &nbsp; ${modifiedFilesBranchCoverageStatus} Branch Coverage (${modifiedFilesBranchCoverage}) 
    </summary>
    <br />
    |File|Instructions Coverage (${modifiedFilesInstructionsCoverage})|${modifiedFilesInstructionsCoverageStatus}|Branch Coverage (${modifiedFilesBranchCoverage})|${modifiedFilesBranchCoverageStatus}|
|:-|:-:|:-:|:-:|:-:|
            ${coverage.files
                .map(cov => {
                    const file = formatFileLinkMarkdown(cov.file);
                    const fileInstructionsCoverageStatus =
                        getCoverageStatusIcon(
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

                    const fileBranchCoverage = formatCoverage(
                        cov.branch.percentage
                    );

                    return `|${file}|${fileInstructionsCoverage}|${fileInstructionsCoverageStatus}|${fileBranchCoverage}|${fileBranchCoverageStatus}|`;
                })
                .join('\n')}
</details>`;
}

function getOverallCoverageSection(
    coverage: ProjectCoverageSummary,
    options: ActionOptions
): string {
    const overallInstructionsCoverageStatus = getCoverageStatusIcon(
        coverage.instructions.percentage,
        options.minOverallInstructionsCoverage
    );

    const overallInstructionsCoverage = formatCoverage(
        coverage.instructions.percentage
    );

    const overallBranchCoverageStatus = getCoverageStatusIcon(
        coverage.branch.percentage,
        options.minOverallBranchCoverage
    );

    const overallBranchCoverage = formatCoverage(coverage.branch.percentage);

    return `<details>
    <summary> <b>Overall Coverage Summary</b>
        <br />
        &nbsp; &nbsp; ${overallInstructionsCoverageStatus} Instructions Coverage (${overallInstructionsCoverage}) 
       <br />
        &nbsp; &nbsp; ${overallBranchCoverageStatus} Branch Coverage (${overallBranchCoverage}) 
    </summary>
</details>`;
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
    coverage: number | null,
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

function formatCoverage(coverage: number | null): string {
    if (coverage == null) {
        return 'NA';
    }

    return `${parseFloat(coverage.toFixed(2))}%`;
}

function formatFileLinkMarkdown(file: File): string {
    return `[${file.path}](${file.url})`;
}
