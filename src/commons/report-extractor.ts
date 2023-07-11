import {
    Coverage,
    FileCoverage,
    File,
    CoverageSummary,
    ProjectCoverage,
    ProjectCoverageSummary,
    CoverageType,
    FilesCoverageSummary
} from '../models/coverage';

import * as parser from 'xml2js';
import * as fs from 'fs';

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
            percentage: getCoveragePercentage(
                instructionsMissed,
                instructionsCovered
            )
        },
        branch: {
            type: 'BRANCH',
            missed: branchesMissed,
            covered: branchesCovered,
            percentage: getCoveragePercentage(branchesMissed, branchesCovered)
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

function getCoveragePercentage(missed: number, covered: number): number {
    if (missed + covered === 0) {
        return 100;
    }

    return (covered / (covered + missed)) * 100;
}
