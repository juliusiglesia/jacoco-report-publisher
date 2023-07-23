import * as github from '@actions/github';
import { File } from '../models/coverage';
import { ActionOptions } from '../models/options';
import { GitHub } from '@actions/github/lib/utils';
import { PullRequestMarker } from './args';

export async function getChangedFiles(
    base: string,
    head: string,
    client: InstanceType<typeof GitHub>
): Promise<File[]> {
    const response = await client.rest.repos.compareCommits({
        base,
        head,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo
    });

    return (
        response.data.files?.map((file: any) => {
            return {
                path: file.filename,
                url: file.blob_url
            };
        }) || []
    );
}

export async function addPullRequestComment(
    options: ActionOptions,
    client: InstanceType<typeof GitHub>,
    pullRequestNumber: number,
    content: string
): Promise<void> {
    if (options.updatePreviousComment || options.deletePreviousComment) {
        const comments = await client.rest.issues.listComments({
            issue_number: pullRequestNumber,
            ...github.context.repo
        });

        const comment = comments.data.find(
            c => c.body?.includes(PullRequestMarker)
        );

        if (comment) {
            if (options.updatePreviousComment) {
                await client.rest.issues.updateComment({
                    comment_id: comment.id,
                    body: content,
                    ...github.context.repo
                });

                return;
            }

            if (options.deletePreviousComment) {
                await client.rest.issues.deleteComment({
                    comment_id: comment.id,
                    ...github.context.repo
                });
            }
        }
    }

    await client.rest.issues.createComment({
        issue_number: pullRequestNumber,
        body: content,
        ...github.context.repo
    });
}
