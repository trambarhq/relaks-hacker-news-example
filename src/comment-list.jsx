import React from 'react';
import { useProgress } from 'relaks';
import { get } from './hacker-news.js';
import { CommentView } from './comment-view.jsx';

export async function CommentList(props) {
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
