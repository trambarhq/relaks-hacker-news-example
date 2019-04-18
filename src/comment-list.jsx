import React from 'react';
import Relaks, { useProgress } from 'relaks';
import { CommentView } from 'comment-view';
import { get } from 'hacker-news';

async function CommentList(props) {
    const { commentIDs, replies } = props;
    const [ show ] = useProgress();
    const comments = [];

    render();
    for (let i = 0, n = 5; i < commentIDs.length; i += n) {
        const idChunk = commentIDs.slice(i, i + n);
        const commentChunk = await Promise.all(idChunk.map(async (id) => {
            return get(`/item/${id}.json`);
        }));
        for (let comment of commentChunk) {
            comments.push(comment);
        }
        render();
    }

    function render() {
        show(
            <div className="comment-list">
                {commentIDs.map(renderComment)}
            </div>
        );
    }

    function renderComment(commentID, i) {
        return <CommentView key={commentID} comment={comments[i]} reply={replies} />;
    }
}

const component = Relaks.memo(CommentList);

export {
    component as CommentList,
};
