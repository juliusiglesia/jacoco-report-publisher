import * as core from '@actions/core';
import { ActionOptions, GithubSettings } from '../models/options';
import { Context } from '@actions/github/lib/context';

export const PullRequestMarker = '<!-- jacoco-reporter-marker -->';

export function extractGithubSettings(githubContext: Context): GithubSettings {
    const eventName = githubContext.eventName;
    switch (eventName) {
        case 'pull_request':
        case 'pull_request_target':
            return {
                event: eventName,
                isPullRequest: true,
                pullRequestNumber:
                    githubContext.payload.pull_request?.number || -1,
                repositoryUrl:
                    githubContext.payload.repository?.html_url || 'err',
                base: githubContext.payload.pull_request?.base.sha || 'err',
                head: githubContext.payload.pull_request?.head.sha || 'err'
            };
        case 'push':
            return {
                event: eventName,
                isPullRequest: false,
                pullRequestNumber: -1,
                repositoryUrl:
                    githubContext.payload.repository?.html_url || 'err',
                base: githubContext.payload.before,
                head: githubContext.payload.after
            };
        default:
            throw new Error(
                `Only pull requests and pushes are supported, ${eventName} not supported.`
            );
    }
}

export function extractActionOptions(): ActionOptions {
    const reportPaths: string[] = (core.getInput('paths') || '').split(',');

    const minOverallInstructionsCoverage: number = parseNumber(
        core.getInput('min-overall-instructions-coverage')
    );

    const minOverallBranchCoverage = parseNumber(
        core.getInput('min-overall-branch-coverage')
    );

    const minModifiedFilesInstructionsCoverage = parseNumber(
        core.getInput('min-modified-files-instructions-coverage')
    );

    const minModifiedFilesBranchCoverage = parseNumber(
        core.getInput('min-modified-files-branch-coverage')
    );

    const pullRequestTitle: string = core.getInput('title');

    const updatePreviousComment = core.getBooleanInput(
        'update-previous-comment'
    );
    const deletePreviousComment = core.getBooleanInput(
        'delete-previous-comment'
    );

    const githubToken = core.getInput('github_token');

    return {
        pullRequestTitle,

        deletePreviousComment,
        updatePreviousComment,

        reportPaths,

        minOverallInstructionsCoverage,
        minOverallBranchCoverage,

        minModifiedFilesInstructionsCoverage,
        minModifiedFilesBranchCoverage,

        githubToken
    };
}

function parseNumber(str: string): number {
    if (!str) {
        return 0;
    }

    return parseFloat(str);
}
