import {
    Coverage,
    FileCoverage,
    OverallModuleCoverage,
    OverallFileCoverage,
    File,
    CoverageSummary,
    ProjectCoverage,
    ProjectCoverageSummary,
    CoverageType,
    FilesCoverageSummary
} from '../models/coverage';

import * as parser from 'xml2js';
import * as fs from 'fs';

export async function getJacocoReportsAsJson(paths: string[]): Promise<any> {
    return Promise.all(
        paths.map(async path => {
            const reportXml = await fs.promises.readFile(path.trim(), 'utf-8');
            return await parser.parseStringPromise(reportXml);
        })
    );
}

export async function getCoverageSummary(
    paths: string[],
    modifiedFiles: File[]
): Promise<CoverageSummary> {
    const reports = await Promise.all(
        paths.map(async path => {
            const xml = await fs.promises.readFile(path.trim(), 'utf-8');
            return await parser.parseStringPromise(xml);
        })
    );

    const projects = reports.map((report: any) => {
        return getProjectCoverage(report['report'], modifiedFiles);
    });

    return {
        project: getProjectCoverageSummary(projects),
        modifiedFiles: getModifiedFilesCoverageSummary(projects)
    };
}

function getProjectCoverageSummary(
    projects: ProjectCoverage[]
): ProjectCoverageSummary {
    let instructionsCovered = 0;
    let instructionsMissed = 0;

    let branchesCovered = 0;
    let branchesMissed = 0;

    for (const project of projects) {
        instructionsCovered += project.instructions.covered;
        instructionsMissed += project.instructions.missed;

        branchesCovered += project.branch.covered;
        branchesMissed += project.branch.missed;
    }

    return {
        projects,
        instructions: {
            type: 'INSTRUCTION',
            missed: instructionsMissed,
            covered: instructionsCovered,
            percentage: parseFloat(
                (
                    (instructionsCovered /
                        (instructionsCovered + instructionsMissed)) *
                    100
                ).toFixed(2)
            )
        },
        branch: {
            type: 'BRANCH',
            missed: branchesMissed,
            covered: branchesCovered,
            percentage: parseFloat(
                (
                    (branchesCovered / (branchesCovered + branchesMissed)) *
                    100
                ).toFixed(2)
            )
        }
    };
}

function getModifiedFilesCoverageSummary(
    projects: ProjectCoverage[]
): FilesCoverageSummary {
    const files: FileCoverage[] = [];

    let instructionsCovered = 0;
    let instructionsMissed = 0;

    let branchesCovered = 0;
    let branchesMissed = 0;

    for (const project of projects) {
        for (const file of project.files) {
            if (file.modified) {
                files.push(file);

                instructionsCovered += file.instructions.covered;
                instructionsMissed += file.instructions.missed;

                branchesCovered += file.branch.covered;
                branchesMissed += file.branch.missed;
            }
        }
    }

    return {
        files,
        instructions: {
            type: 'INSTRUCTION',
            missed: instructionsMissed,
            covered: instructionsCovered,
            percentage: parseFloat(
                (
                    (instructionsCovered /
                        (instructionsCovered + instructionsMissed)) *
                    100
                ).toFixed(2)
            )
        },
        branch: {
            type: 'BRANCH',
            missed: branchesMissed,
            covered: branchesCovered,
            percentage: parseFloat(
                (
                    (branchesCovered / (branchesCovered + branchesMissed)) *
                    100
                ).toFixed(2)
            )
        }
    };
}

function getProjectCoverage(
    report: any,
    modifiedFiles: File[]
): ProjectCoverage {
    const files: FileCoverage[] = [];

    for (const pck of report['package']) {
        const pckName = pck['$'].name;
        const sourceFiles = pck.sourcefile;
        for (const sourceFile of sourceFiles) {
            const fileName = sourceFile['$'].name;
            const fqdn = `${pckName}/${fileName}`;
            const modifiedFile = findFileEndingWith(fqdn, modifiedFiles);
            const modified = modifiedFile != null;
            const counters = sourceFile['counter'];

            if (counters != null && counters.length !== 0) {
                files.push({
                    file: {
                        path: modifiedFile?.path || fqdn,
                        url: modifiedFile?.url || ''
                    },
                    modified,
                    instructions: getDetailedCoverage(counters, 'INSTRUCTION'),
                    branch: getDetailedCoverage(counters, 'BRANCH')
                });
            }
        }
    }

    return {
        files,
        instructions: getDetailedCoverage(report['counter'], 'INSTRUCTION'),
        branch: getDetailedCoverage(report['counter'], 'BRANCH')
    };
}

function findFileEndingWith(
    suffix: string,
    modifiedFiles: File[]
): File | undefined {
    return modifiedFiles.find((f: File) => {
        return f.path.endsWith(suffix);
    });
}

// function getFileCoverageFromPackages(
//     packages: any[],
//     files: File[]
// ): OverallFileCoverage {
//     const fileCoverages: FileCoverage[] = [];

//     return getOverallFileCoverage(fileCoverages);
// }

//
//
//

export function getFileCoverage(
    reports: { [key: string]: any },
    files: File[]
): OverallFileCoverage {
    const packages = reports.map((report: any) => report['package']);
    return getFileCoverageFromPackages([].concat(...packages), files);
}

export function getOverallCoverage(reports: {
    [key: string]: any;
}): OverallModuleCoverage {
    const modules = reports.map((report: any) => {
        return {
            module: report['$']['name'],
            instructions: getModuleCoverage(report, 'INSTRUCTION') || 0,
            branch: getModuleCoverage(report, 'BRANCH')
        };
    });

    return {
        modules,
        overallInstructions: getProjectCoverageForType(reports, 'INSTRUCTION'),
        overallBranch: getProjectCoverageForType(reports, 'BRANCH')
    };
}

function getFileCoverageFromPackages(
    packages: any[],
    files: File[]
): OverallFileCoverage {
    const fileCoverages: FileCoverage[] = [];

    for (const item of packages) {
        const packageName = item['$'].name;
        const sourceFiles = item.sourcefile;

        for (const sourceFile of sourceFiles) {
            const sourceFileName = sourceFile['$'].name;
            const file = files.find((f: File) => {
                return f.path.endsWith(`${packageName}/${sourceFileName}`);
            });

            if (file != null) {
                const counters = sourceFile['counter'];
                if (counters != null && counters.length !== 0) {
                    fileCoverages.push({
                        file,
                        modified: true,
                        instructions: getDetailedCoverage(
                            counters,
                            'INSTRUCTION'
                        ),
                        branch: getDetailedCoverage(counters, 'BRANCH')
                    });
                }
            }
        }
    }

    return getOverallFileCoverage(fileCoverages);
}

function getOverallFileCoverage(
    fileCoverages: FileCoverage[]
): OverallFileCoverage {
    let missedBranch = 0;
    let coveredBranch = 0;

    let missedInsructions = 0;
    let coveredInsructions = 0;

    for (const cov of fileCoverages) {
        missedBranch += cov.branch.missed;
        coveredBranch += cov.branch.covered;

        missedInsructions += cov.instructions.missed;
        coveredInsructions += cov.instructions.covered;
    }

    return {
        files: fileCoverages,
        overallInstructions: parseFloat(
            (
                (coveredInsructions /
                    (coveredInsructions + missedInsructions)) *
                100
            ).toFixed(2)
        ),
        overallBranch: parseFloat(
            ((coveredBranch / (coveredBranch + missedBranch)) * 100).toFixed(2)
        )
    };
}

function getModuleCoverage(
    report: { [key: string]: any },
    type: CoverageType
): number | undefined {
    const counters = report['counter'];
    const coverage = getDetailedCoverage(counters, type);
    return coverage.percentage;
}

function getProjectCoverageForType(
    reports: { [key: string]: any },
    type: CoverageType
): number {
    const coverages: Coverage[] = reports.map((report: any) =>
        getDetailedCoverage(report['counter'], type)
    );

    const covered = coverages.reduce(
        (acc: number, coverage: Coverage) => acc + coverage.covered,
        0
    );

    const missed = coverages.reduce(
        (acc: number, coverage: Coverage) => acc + coverage.missed,
        0
    );

    return parseFloat(((covered / (covered + missed)) * 100).toFixed(2));
}

function getDetailedCoverage(
    counters: readonly { [key: string]: any }[],
    type: CoverageType
): Coverage {
    const coverage: Coverage = {
        type,
        missed: 0,
        covered: 0
    };

    for (const counter of counters) {
        const attr = counter['$'];
        if (attr['type'] === type) {
            const missed = parseFloat(attr['missed']);
            const covered = parseFloat(attr['covered']);
            coverage.missed = missed;
            coverage.covered = covered;
            coverage.percentage = parseFloat(
                ((covered / (covered + missed)) * 100).toFixed(2)
            );
        }
    }

    return coverage;
}
