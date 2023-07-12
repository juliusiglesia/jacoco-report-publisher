export interface ActionOptions {
    pullRequestTitle: string;

    deletePreviousComment: boolean;
    updatePreviousComment: boolean;

    reportPaths: string[];

    minOverallInstructionsCoverage: number;
    minOverallBranchCoverage: number;

    minModifiedFilesInstructionsCoverage: number;
    minModifiedFilesBranchCoverage: number;

    githubToken: string;
}

export interface GithubSettings {
    event: string;
    isPullRequest: boolean;
    pullRequestNumber: number;
    repositoryUrl: string;
    base: string;
    head: string;
}
