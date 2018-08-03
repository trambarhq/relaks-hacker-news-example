import { default as React, PureComponent } from 'react';
import { CommentList } from 'comment-list';

class CommentView extends PureComponent {
    static displayName = 'CommentView';

    render() {
        let { comment, reply } = this.props;
        let author, text;
        if (comment) {
            author = `${comment.by}:`;
            text = <HTML markup={comment.text} />;
        } else {
            author = <span className="pending">...</span>;
            text = '\u00a0';
        }
        return (
            <div className="comment">
                <div className="icon">
                    <i className={'fa-heart ' + (reply ? 'far' : 'fas')} />
                </div>
                <div className="contents">
                    <div className="by">{author}</div>
                    <div className="text">{text}</div>
                    {this.renderReplies()}
                </div>
            </div>
        );
    }

    renderReplies() {
        let { comment } = this.props;
        if (!comment || _.isEmpty(comment.kids)) {
            return null;
        }
        let listProps = { commentIDs: comment.kids, replies: true };
        return (
            <div className="replies">
                <CommentList {...listProps} />
            </div>
        );
    }
}

function HTML(props) {
    var markup = { __html: props.markup };
    return <span dangerouslySetInnerHTML={markup} />;
}

export { CommentView };
