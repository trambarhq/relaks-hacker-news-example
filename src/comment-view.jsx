import React from 'react';
import { CommentList } from 'comment-list';

function CommentView(props) {
    const { comment, reply } = props;
    const iconClassNames = [ 'fa-heart', (reply) ? 'far' : 'fas' ];
    let author, text;
    if (comment) {
        if (!comment.deleted) {
            author = `${comment.by}:`;
            text = <HTML markup={comment.text} />;
        } else {
            iconClassNames[0] = 'fa-sad-tear';
            author = '[deleted]';
            console.log()
        }
    } else {
        author = <span className="pending">...</span>;
        text = '\u00a0';
    }

    return (
        <div className="comment">
            <div className="icon">
                <i className={iconClassNames.join(' ')} />
            </div>
            <div className="contents">
                <div className="by">{author}</div>
                <div className="text">{text}</div>
                {renderReplies()}
            </div>
        </div>
    );

    function renderReplies() {
        if (!comment || !comment.kids || !comment.kids.length) {
            return null;
        }
        return (
            <div className="replies">
                <CommentList commentIDs={comment.kids} replies={true} />
            </div>
        );
    }
}

function HTML(props) {
    let markup = { __html: props.markup };
    return <span dangerouslySetInnerHTML={markup} />;
}

export { 
    CommentView 
};
