import { h } from 'preact';
import { AsyncComponent } from 'relaks/preact';
import { PureComponent } from './pure-component.jsx';
import { CommentList } from './comment-list.jsx';
import { get } from './hacker-news.js';

/** @jsx h */

class StoryView extends AsyncComponent {
  async renderAsync(meanwhile) {
    const { story } = this.props;
    const props = {
      story: story,
      parts: null,
    };
    if (story.parts && story.parts.length > 0) {
      meanwhile.show(<StoryViewSync {...props} />);
      props.parts = await Promise.all(story.parts.map((id) => {
        return get(`/item/${id}.json`);
      }));
    }
    return <StoryViewSync {...props} />;
  }
}

class StoryViewSync extends PureComponent {
  constructor() {
    super();
    this.state = {
      open: false,
    };
  }

  render() {
    const { story } = this.props;
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
    const { story } = this.props;
    const index = story.id % decorativeImages.length;
    const image = decorativeImages[index];
    if (!(story.text || '').trim() && !story.url && (!story.parts || story.parts.length === 0)) {
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
    const { story } = this.props;
    return <p><HTML markup={story.text} /></p>;
  }

  renderParts() {
    const { story, parts } = this.props;
    if (!story.parts || story.parts.length === 0) {
      return null;
    }
    return (
      <ol>
      {
        story.parts.map((id, i) => {
          var part = (parts) ? parts[index] : null;
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
    const { story } = this.props;
    return <a href={story.url} target="_blank">{story.url}</a>;
  }

  renderCommentCount() {
    const { story } = this.props;
    const count = (story.kids) ? story.kids.length : 0;
    const label = `${count} comment` + (count === 1 ? '' : 's');
    const barProps = {
      className: 'comment-bar',
    };
    if (count > 0) {
      barProps.className += ' clickable';
      barProps.onClick = this.handleCommentBarClick;
    }
    return <div {...barProps}>{label}</div>;
  }

  renderCommentList() {
    const { story } = this.props;
    const { showingComments, renderingComments } = this.state;
    let comments;
    if (renderingComments) {
      const listProps = { commentIDs: story.kids, replies: false };
      comments = <CommentList {...listProps} />;
    }
    const containerProps = { className: 'comment-container' };
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
    if (this.state.showingComments) {
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
  const markup = { __html: props.markup };
  return <span dangerouslySetInnerHTML={markup} />;
}

const decorativeImages = [
  require('../img/kitty-1.png').default,
  require('../img/kitty-2.png').default,
  require('../img/kitty-3.png').default,
  require('../img/kitty-4.png').default,
  require('../img/kitty-5.png').default,
  require('../img/kitty-6.png').default,
  require('../img/kitty-7.png').default,
];
const extraDecorativeImage = require('../img/kitty-8.png').default;

export { StoryView, StoryViewSync };
