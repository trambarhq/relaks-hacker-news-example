import { h } from 'preact';
import { PureComponent } from 'pure-component';
import { AsyncComponent } from 'relaks/preact';
import { CommentView } from 'comment-view';
import { get } from 'hacker-news';

/** @jsx h */

class CommentList extends AsyncComponent {
    static displayName = 'CommentList';

    async renderAsync(meanwhile) {
        let { commentIDs, replies } = this.props;
        let props = {
            comments: [],
            commentIDs,
            replies,
        };
        meanwhile.show(<CommentListSync {...props} />);
        for (let i = 0, n = 5; i < commentIDs.length; i += n) {
            let idChunk = commentIDs.slice(i, i + n);
            let comments = await Promise.all(idChunk.map(async (id) => {
                return get(`/item/${id}.json`);
            }));
            props.comments = props.comments.concat(comments);
            meanwhile.show(<CommentListSync {...props} />);
        }
        return <CommentListSync {...props} />;
    }
}

class CommentListSync extends PureComponent {
    static displayName = 'CommentListSync';

    render() {
        let { commentIDs, comments, replies } = this.props;
        return (
            <div className="comment-list">
            {
                commentIDs.map((commentID, index) => {
                    let commentProps = {
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
