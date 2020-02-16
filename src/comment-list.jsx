import { h } from 'preact';
import { AsyncComponent } from 'relaks/preact';
import { get } from './hacker-news.js';
import { PureComponent } from './pure-component.jsx';
import { CommentView } from './comment-view.jsx';

/** @jsx h */

class CommentList extends AsyncComponent {
  async renderAsync(meanwhile) {
    const { commentIDs, replies } = this.props;
    const props = {
      comments: [],
      commentIDs,
      replies,
    };
    meanwhile.show(<CommentListSync {...props} />);
    for (let i = 0, n = 5; i < commentIDs.length; i += n) {
      const idChunk = commentIDs.slice(i, i + n);
      const comments = await Promise.all(idChunk.map(async (id) => {
        return get(`/item/${id}.json`);
      }));
      props.comments = props.comments.concat(comments);
      meanwhile.show(<CommentListSync {...props} />);
    }
    return <CommentListSync {...props} />;
  }
}

class CommentListSync extends PureComponent {
  render() {
    const { commentIDs, comments, replies } = this.props;
    return (
      <div className="comment-list">
      {
        commentIDs.map((commentID, index) => {
          const commentProps = {
            comment: comments[index],
            reply: replies
          };
          return <CommentView key={commentID} {...commentProps} />;
        })
      }
      </div>
    );
  }
}

export { CommentList, CommentListSync };
