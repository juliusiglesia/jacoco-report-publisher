export type CoverageType = 'INSTRUCTION' | 'BRANCH';

export interface Coverage {
    type: CoverageType;
    missed: number;
    covered: number;
    percentage: number | null;
}

export interface FileCoverage {
    file: File;
    modified: boolean;
    instructions: Coverage;
    branch: Coverage;
}

export interface File {
    path: string;
    url: string;
}

export interface CoverageSummary {
    project: ProjectCoverageSummary;
    modifiedFiles: FilesCoverageSummary;
}

export interface ProjectCoverageSummary {
    projects: ProjectCoverage[];
    instructions: Coverage;
    branch: Coverage;
}

export interface FilesCoverageSummary {
    files: FileCoverage[];
    instructions: Coverage;
    branch: Coverage;
}

export interface ProjectCoverage {
    files: FileCoverage[];
    instructions: Coverage;
    branch: Coverage;
}
