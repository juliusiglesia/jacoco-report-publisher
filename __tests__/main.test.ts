import { test, jest, beforeEach, describe, expect } from '@jest/globals';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { run } from '../src/main';

describe('test jacoco reporter flow', function () {
    const mockInputs: { [key: string]: string } = {
        'report-paths': './__tests__/__fixtures__/input/report.xml',
        'min-overall-instructions-coverage': '45',
        'min-overall-branch-coverage': '50',
        'min-modified-files-instructions-coverage': '45',
        'min-modified-files-branch-coverage': '80',
        'update-previous-comment': 'false',
        'delete-previous-comment': 'false',
        'github-token': 'secret-token'
    };

    const mockListComments = jest.fn();
    const mockCreateComment = jest.fn();
    const mockUpdateComment = jest.fn();
    const mockDeleteComment = jest.fn();

    beforeEach(() => {
        jest.restoreAllMocks();

        mockListComments.mockReturnValue({
            data: []
        });

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

        jest.spyOn(core, 'setFailed');
        jest.spyOn(core, 'setOutput');

        jest.spyOn(core, 'getInput').mockImplementation(name => {
            return mockInputs[name];
        });

        jest.spyOn(core, 'getBooleanInput').mockImplementation(name => {
            return mockInputs[name] == 'true';
        });

        jest.spyOn(github, 'getOctokit').mockReturnValue({
            rest: {
                repos: {
                    compareCommits: jest.fn(() => {
                        return {
                            data: {
                                files: [
                                    {
                                        filename:
                                            'com/example/zzz/ports/partnercatalog/BranchCode.java',
                                        blob_url:
                                            'https://github.com/owner/repo/blob/main/src/main/java/com/example/zzz/ports/partnercatalog/BranchCode.java'
                                    },
                                    {
                                        filename:
                                            'com/example/hhh/TransferValidationGroup.java',
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
                    })
                },
                issues: {
                    createComment: mockCreateComment,
                    listComments: mockListComments,
                    updateComment: mockUpdateComment,
                    deleteComment: mockDeleteComment
                }
            }
        } as any);
    });

    test('pull request event - create comment and no previous comment', async function () {
        await run();

        expect(mockListComments).toHaveBeenCalledTimes(0);
        expect(mockCreateComment).toHaveBeenCalledTimes(1);
        expect(mockUpdateComment).toHaveBeenCalledTimes(0);
        expect(mockDeleteComment).toHaveBeenCalledTimes(0);
    });

    test('pull request event - create comment when update is enabled but no previous comment', async function () {
        jest.spyOn(core, 'getBooleanInput').mockImplementation(name => {
            return name === 'update-previous-comment';
        });

        await run();

        expect(mockListComments).toHaveBeenCalledTimes(1);
        expect(mockCreateComment).toHaveBeenCalledTimes(1);
        expect(mockUpdateComment).toHaveBeenCalledTimes(0);
        expect(mockDeleteComment).toHaveBeenCalledTimes(0);
    });

    test('pull request event - create comment when update is enabled and but no previous jacoco comment', async function () {
        jest.spyOn(core, 'getBooleanInput').mockImplementation(name => {
            return name === 'update-previous-comment';
        });

        mockListComments.mockReturnValue({
            data: [
                {
                    id: 1,
                    body: 'some comment <!-- not-jacoco-report-publisher-marker -->'
                }
            ]
        });

        await run();

        expect(mockListComments).toHaveBeenCalledTimes(1);
        expect(mockCreateComment).toHaveBeenCalledTimes(1);
        expect(mockUpdateComment).toHaveBeenCalledTimes(0);
        expect(mockDeleteComment).toHaveBeenCalledTimes(0);
    });

    test('pull request event - update comment when enabled and has previous comment', async function () {
        jest.spyOn(core, 'getBooleanInput').mockImplementation(name => {
            return name === 'update-previous-comment';
        });

        mockListComments.mockReturnValue({
            data: [
                {
                    id: 1,
                    body: 'some comment <!-- jacoco-report-publisher-marker -->'
                }
            ]
        });

        await run();

        expect(mockListComments).toHaveBeenCalledTimes(1);
        expect(mockCreateComment).toHaveBeenCalledTimes(0);
        expect(mockUpdateComment).toHaveBeenCalledTimes(1);
        expect(mockDeleteComment).toHaveBeenCalledTimes(0);
    });

    test('pull request event - delete comment when enabled and but has no previous comment', async function () {
        jest.spyOn(core, 'getBooleanInput').mockImplementation(name => {
            return name === 'update-previous-comment';
        });

        await run();

        expect(mockListComments).toHaveBeenCalledTimes(1);
        expect(mockCreateComment).toHaveBeenCalledTimes(1);
        expect(mockUpdateComment).toHaveBeenCalledTimes(0);
        expect(mockDeleteComment).toHaveBeenCalledTimes(0);
    });

    test('pull request event - delete comment when enabled but no previous jacoco comment', async function () {
        jest.spyOn(core, 'getBooleanInput').mockImplementation(name => {
            return name === 'delete-previous-comment';
        });

        mockListComments.mockReturnValue({
            data: [
                {
                    id: 1,
                    body: 'some comment <!-- not-jacoco-report-publisher-marker -->'
                }
            ]
        });

        await run();

        expect(mockListComments).toHaveBeenCalledTimes(1);
        expect(mockCreateComment).toHaveBeenCalledTimes(1);
        expect(mockUpdateComment).toHaveBeenCalledTimes(0);
        expect(mockDeleteComment).toHaveBeenCalledTimes(0);
    });

    test('pull request event - delete comment when enabled and has previous comment', async function () {
        jest.spyOn(core, 'getBooleanInput').mockImplementation(name => {
            return name === 'delete-previous-comment';
        });

        mockListComments.mockReturnValue({
            data: [
                {
                    id: 1,
                    body: 'some comment <!-- jacoco-report-publisher-marker -->'
                }
            ]
        });

        await run();

        expect(mockListComments).toHaveBeenCalledTimes(1);
        expect(mockCreateComment).toHaveBeenCalledTimes(1);
        expect(mockUpdateComment).toHaveBeenCalledTimes(0);
        expect(mockDeleteComment).toHaveBeenCalledTimes(1);
    });

    describe.each([
        {
            eventName: 'pull_request',
            allowed: true
        },
        {
            eventName: 'pull_request_target',
            allowed: true
        },
        {
            eventName: 'push',
            allowed: true
        },
        {
            eventName: 'commit',
            allowed: false
        }
    ])('check github event types', ({ eventName, allowed }) => {
        test(`check - ${eventName}`, async function () {
            github.context.eventName = eventName;

            await run();

            if (allowed) {
                expect(core.setFailed).toHaveBeenCalledTimes(0);
            } else {
                expect(core.setFailed).toHaveBeenCalledTimes(1);
            }
        });
    });
});
