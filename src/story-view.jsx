import _ from 'lodash';
import Promise from 'bluebird';
import { default as React, PureComponent } from 'react';
import { AsyncComponent } from 'relaks';
import { CommentList } from 'comment-list';
import { get } from 'hacker-news';

class StoryView extends AsyncComponent {
    static displayName = 'StoryView'

    async renderAsync(meanwhile) {
        let { story } = this.props;
        let props = {
            story: story,
            parts: null,
        };
        if (!_.isEmpty(story.parts)) {
            meanwhile.show(<StoryViewSync {...props} />);
            props.parts = await Promise.map(story.parts, (id) => {
                return get(`/item/${id}.json`);
            });
        }
        return <StoryViewSync {...props} />;
    }
}

class StoryViewSync extends PureComponent {
    static displayName = 'StoryViewSync';

    constructor() {
        super();
        this.state = {
            open: false,
        };
    }

    render() {
        let { story } = this.props;
        return (
            <div className="story-view">
                <header>
                    {story.title} <span className="by">by {story.by}</span>
                </header>
                <section>
                    <div>
                        {this.renderDecorativeImage()}
                        {this.renderText()}
                        {this.renderParts()}
                        {this.renderURL()}
                    </div>
                </section>
                <footer>
                    {this.renderCommentCount()}
                    {this.renderCommentList()}
                </footer>
            </div>
        );
    }

    renderDecorativeImage() {
        let { story } = this.props;
        let index = story.id % decorativeImages.length;
        let image = decorativeImages[index];
        let extra;
        if (!_.trim(story.text) && !story.url && _.isEmpty(story.parts)) {
            return (
                <span>
                    <img className="extra-decoration" src={extraDecorativeImage} />
                    <img className="decoration" src={image} />
                </span>
            );
        } else {
            return <img className="decoration" src={image} />
        }
    }

    renderText() {
        let { story } = this.props;
        return <p><HTML markup={story.text} /></p>;
    }

    renderParts() {
        let { story, parts } = this.props;
        return (
            <ol>
            {
                _.map(story.parts, (id, i) => {
                    let part = _.get(parts, index);
                    if (part) {
                        return <li key={i}><HTML markup={part.text}/> ({part.score} votes)</li>;
                    } else {
                        return <li key={i} className="pending">...</li>;
                    }
                })
            }
            </ol>
        );
    }

    renderURL() {
        let { story } = this.props;
        return <a href={story.url} target="_blank">{story.url}</a>;
    }

    renderCommentCount() {
        let { story } = this.props;
        let count = _.size(story.kids);
        let label = `${count} comment` + (count === 1 ? '' : 's');
        let barProps = {
            className: 'comment-bar',
        };
        if (count > 0) {
            barProps.className += ' clickable';
            barProps.onClick = this.handleCommentBarClick;
        }
        return <div {...barProps}>{label}</div>;
    }

    renderCommentList() {
        let { story } = this.props;
        let { showingComments, renderingComments } = this.state;
        let comments;
        if (renderingComments) {
            let listProps = { commentIDs: story.kids, replies: false };
            comments = <CommentList {...listProps} />;
        }
        let containerProps = { className: 'comment-container' };
        if (showingComments) {
            containerProps.className += ' open';
        } else {
            if (renderingComments) {
                containerProps.onTransitionEnd = this.handleTransitionEnd;
            }
        }
        return <div {...containerProps}>{comments}</div>;
    }

    handleCommentBarClick = (evt) => {
        let { showingComments } = this.state;
        if (showingComments) {
            this.setState({ showingComments: false });
        } else {
            this.setState({ showingComments: true, renderingComments: true });
        }
    }

    handleTransitionEnd = (evt) => {
        this.setState({ renderingComments: false });
    }
}

function HTML(props) {
    let markup = { __html: props.markup };
    return <span dangerouslySetInnerHTML={markup} />;
}

let decorativeImages = [
    require('../img/kitty-1.png'),
    require('../img/kitty-2.png'),
    require('../img/kitty-3.png'),
    require('../img/kitty-4.png'),
    require('../img/kitty-5.png'),
    require('../img/kitty-6.png'),
    require('../img/kitty-7.png'),
];
let extraDecorativeImage = require('../img/kitty-8.png');

export { StoryView, StoryViewSync };
