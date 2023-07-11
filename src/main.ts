import * as core from '@actions/core';
import * as github from '@actions/github';
import { extractActionOptions, extractGithubSettings } from './commons/args';
import {
    addPullRequestComment,
    getChangedFiles
} from './commons/github-helper';
import { getCoverageSummary } from './commons/report-extractor';
import { GitHub } from '@actions/github/lib/utils';
import { getPullRequestCommentBody } from './commons/renderer';

export async function run(): Promise<void> {
    try {
        const githubSettings = extractGithubSettings(github.context);

        core.info(
            `github settings: ${JSON.stringify(
                { ...githubSettings, token: '[filtered]' },
                null,
                '\t'
            )}`
        );

        const options = extractActionOptions();
        core.info(`options: ${JSON.stringify(options, null, '\t')}`);

        const client: InstanceType<typeof GitHub> = github.getOctokit(
            core.getInput('github-token')
        );

        const changedFiles = await getChangedFiles(
            githubSettings.base,
            githubSettings.head,
            client
        );

        const coverage = await getCoverageSummary(
            options.reportPaths,
            changedFiles
        );

        core.setOutput(
            'overall-instructions-coverage',
            coverage.project.instructions.percentage
        );

        core.setOutput(
            'overall-branch-coverage',
            coverage.project.branch.percentage
        );

        core.setOutput(
            'modified-files-instructions-coverage',
            coverage.modifiedFiles.instructions.percentage
        );

        core.setOutput(
            'modified-files-branch-coverage',
            coverage.modifiedFiles.branch.percentage
        );

        if (githubSettings.isPullRequest) {
            const pullRequestComment = getPullRequestCommentBody(
                coverage,
                options
            );

            core.info(pullRequestComment);

            await addPullRequestComment(
                options,
                client,
                githubSettings.pullRequestNumber,
                pullRequestComment
            );
        }

        core.info('\n\ndone! have a great day!\n\n');
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

run();
