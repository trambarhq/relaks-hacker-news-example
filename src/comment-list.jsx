import _ from 'lodash';
import Promise from 'bluebird';
import { default as React, PureComponent } from 'react';
import { AsyncComponent } from 'relaks';
import { CommentView } from 'comment-view';
import { get } from 'hacker-news';

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
        let commentIDChunks = _.chunk(commentIDs, 5);
        await Promise.each(commentIDChunks, async (idChunk) => {
            var comments = await Promise.map(idChunk, (id) => {
                return get(`/item/${id}.json`);
            });
            props.comments = _.concat(props.comments, comments);
            meanwhile.show(<CommentListSync {...props} />);
        });
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
                _.map(commentIDs, (commentID, index) => {
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
