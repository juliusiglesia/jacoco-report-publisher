import { test, jest, beforeEach, describe, afterAll } from '@jest/globals';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { run } from './../src/main';

const mockInputs: {[key: string]: string} = {
    'paths': './__tests__/__fixtures__/report-one.xml',
    'min-overall-instructions-coverage': '45',
    'min-overall-branch-coverage': '50',
    'min-changed-files-instructions-coverage': '45',
    'min-changed-files-branch-coverage': '80',
    'update-previous-comment': 'false',
    'delete-previous-comment': 'true',
    'token': 'secret-token',
};

describe('single report', function () {
    let createComment: any;
    let listComments: any;
    let updateComment: any;
    let output: any;

    beforeEach(() => {
        createComment = jest.fn();
        listComments = jest.fn();
        updateComment = jest.fn();
        output = jest.fn();

        jest.spyOn(github.context, 'repo', 'get').mockReturnValue({
            owner: 'owner',
            repo: 'repo'
        });

        github.context.eventName = 'pull_request';
        github.context.payload = {
            pull_request: {
                number: 45,
                base: {
                    sha: '5c7d0c90cf9e0ce560956179e8e82e7d'
                },
                head: {
                    sha: 'd9983f7f6c78f6177e478188768c6c16'
                }
            },
            repository: {
                name: 'repo',
                owner: {
                    login: 'login'
                },
                html_url: 'https://github.com/org/repo'
            }
        };

        jest.spyOn(core, 'getInput').mockImplementation(name => {
            return mockInputs[name];
        });

        jest.spyOn(core, 'getBooleanInput').mockImplementation(name => {
            return mockInputs[name] == 'true';
        });

        jest.spyOn(core, 'setFailed').mockImplementation(err => {
            console.error(err);
        });

        const octokitMock = {
            rest: {
                repos: {
                    compareCommits: jest.fn(() => {
                        return mockCompareCommits;
                    })
                },
                issues: {
                    createComment: createComment,
                    listComments: listComments,
                    updateComment: updateComment
                }
            }
        } as any;

        jest.spyOn(github, 'getOctokit').mockReturnValue(octokitMock);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    const mockCompareCommits = {
        data: {
            files: [
                {
                    filename:
                        'com/example/zzz/ports/partnercatalog/BranchCode.java',
                    blob_url:
                        'https://github.com/owner/repo/blob/main/src/main/java/com/example/zzz/ports/partnercatalog/BranchCode.java'
                },
                {
                    filename: 'com/example/hhh/TransferValidationGroup.java',
                    blob_url:
                        'https://github.com/owner/repo/blob/main/src/main/java/com/example/hhh/TransferValidationGroup.java'
                },
                {
                    filename:
                        'com/example/aaa/config/tracing/CallerIdFilter.java',
                    blob_url:
                        'https://github.com/owner/repo/blob/main/src/main/java/com/example/aaa/config/tracing/CallerIdFilter.java'
                }
            ]
        }
    };

    test('pull request event', async function () {
        await run();
    });

    //     test('Pull Request event', function () {
    //         const context = {
    //             eventName: 'pull_request',
    //             payload: {
    //                 pull_request: {
    //                     number: '45',
    //                     base: {
    //                         sha: 'guasft7asdtf78asfd87as6df7y2u3'
    //                     },
    //                     head: {
    //                         sha: 'aahsdflais76dfa78wrglghjkaghkj'
    //                     }
    //                 }
    //             },
    //             repo: 'jacoco-playground',
    //             owner: 'madrapps'
    //         };

    //         it('publish proper comment', async () => {
    //             github.context = context;

    //             await action.action();

    //             expect(createComment.mock.calls[0][0].body)
    //                 .toEqual(`|File|Coverage [63.64%]|:green_apple:|
    //   |:-|:-:|:-:|
    //   |[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
    //   |[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:x:|

    //   |Total Project Coverage|49.02%|:green_apple:|
    //   |:-|:-:|:-:|`);
    //         });

    //         it('updates a previous comment', async () => {
    //             github.context = context;

    //             const title = 'JaCoCo Report';
    //             core.getInput = jest.fn(c => {
    //                 switch (c) {
    //                     case 'title':
    //                         return title;
    //                     case 'update-comment':
    //                         return 'true';
    //                     default:
    //                         return getInput(c);
    //                 }
    //             });

    //             listComments.mockReturnValue({
    //                 data: [
    //                     { id: 1, body: 'some comment' },
    //                     { id: 2, body: `### ${title}\n to update` }
    //                 ]
    //             });

    //             await action.action();

    //             expect(updateComment.mock.calls[0][0].comment_id).toEqual(2);
    //             expect(createComment).toHaveBeenCalledTimes(0);
    //         });

    //         it('set overall coverage output', async () => {
    //             github.context = context;
    //             core.setOutput = output;

    //             await action.action();

    //             const out = output.mock.calls[0];
    //             expect(out).toEqual(['coverage-overall', 49.02]);
    //         });

    //         it('set changed files coverage output', async () => {
    //             github.context = context;
    //             core.setOutput = output;

    //             await action.action();

    //             const out = output.mock.calls[1];
    //             expect(out).toEqual(['coverage-changed-files', 63.64]);
    //         });
    //     });

    //     test('Pull Request Target event', function () {
    //         const context = {
    //             eventName: 'pull_request_target',
    //             payload: {
    //                 pull_request: {
    //                     number: '45',
    //                     base: {
    //                         sha: 'guasft7asdtf78asfd87as6df7y2u3'
    //                     },
    //                     head: {
    //                         sha: 'aahsdflais76dfa78wrglghjkaghkj'
    //                     }
    //                 }
    //             },
    //             repo: 'jacoco-playground',
    //             owner: 'madrapps'
    //         };

    //         it('set overall coverage output', async () => {
    //             github.context = context;
    //             core.setOutput = output;

    //             await action.action();

    //             const out = output.mock.calls[0];
    //             expect(out).toEqual(['coverage-overall', 49.02]);
    //         });
    //     });

    //     test('Push event', function () {
    //         const context = {
    //             eventName: 'push',
    //             payload: {
    //                 before: 'guasft7asdtf78asfd87as6df7y2u3',
    //                 after: 'aahsdflais76dfa78wrglghjkaghkj'
    //             },
    //             repo: 'jacoco-playground',
    //             owner: 'madrapps'
    //         };

    //         it('set overall coverage output', async () => {
    //             github.context = context;
    //             core.setOutput = output;

    //             await action.action();

    //             const out = output.mock.calls[0];
    //             expect(out).toEqual(['coverage-overall', 49.02]);
    //         });

    //         it('set changed files coverage output', async () => {
    //             github.context = context;
    //             core.setOutput = output;

    //             await action.action();

    //             const out = output.mock.calls[1];
    //             expect(out).toEqual(['coverage-changed-files', 63.64]);
    //         });
    //     });

    //     test('Other than push or pull_request or pull_request_target event', function () {
    //         const context = {
    //             eventName: 'pr_review'
    //         };

    //         it('Fail by throwing appropriate error', async () => {
    //             github.context = context;
    //             core.setFailed = jest.fn(c => {
    //                 expect(c).toEqual(
    //                     'Only pull requests and pushes are supported, pr_review not supported.'
    //                 );
    //             });
    //             core.setOutput = output;

    //             await action.action();
    //         });
    //     });
});
