import React, { useState } from 'react';
import { useProgress } from 'relaks';
import { get } from './hacker-news.js';
import { CommentList } from './comment-list.jsx';

export async function StoryView(props) {
  const { story } = props;
  const [ showingComments, showComments ] = useState(false);
  const [ renderingComments, renderComments ] = useState(false);
  const [ show ] = useProgress();
  const parts = [];

  render();
  if (story.parts && story.parts.length > 0) {
    const idChunk = story.parts;
    const partChunk = await Promise.all(idChunk.map((id) => {
      return get(`/item/${id}.json`);
    }));
    for (let part of partChunk) {
      parts.push(part);
    }
    render();
  }

  function render() {
    show(
      <div className="story-view">
        <header>
          {story.title} <span className="by">by {story.by}</span>
        </header>
        <section>
          <div>
            {renderDecorativeImage()}
            {renderText()}
            {renderParts()}
            {renderURL()}
          </div>
        </section>
        <footer>
          {renderCommentCount()}
          {renderCommentList()}
        </footer>
      </div>
    );
  }

  function renderDecorativeImage() {
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

  function renderText() {
    return <p><HTML markup={story.text} /></p>;
  }

  function renderParts() {
    if (!story.parts || story.parts.length === 0) {
      return null;
    }
    return <ol>{story.parts.map(renderPart)}</ol>;
  }

  function renderPart(id, i) {
    const part = (parts) ? parts[index] : null;
    if (part) {
      return <li key={i}><HTML markup={part.text}/> ({part.score} votes)</li>;
    } else {
      return <li key={i} className="pending">...</li>;
    }
  }

  function renderURL() {
    return <a href={story.url} target="_blank">{story.url}</a>;
  }

  function renderCommentCount() {
    const count = (story.kids) ? story.kids.length : 0;
    const label = `${count} comment` + (count === 1 ? '' : 's');
    const classNames = [ 'comment-bar' ];
    let onClick;
    if (count > 0) {
      classNames.push('clickable');
      onClick = (evt) => {
        if (showingComments) {
          showComments(false);
        } else {
          renderComments(true);
          showComments(true);
        }
      };
    }
    return <div className={classNames.join(' ')} onClick={onClick}>{label}</div>;
  }

  function renderCommentList() {
    let comments;
    if (renderingComments) {
      comments = <CommentList commentIDs={story.kids} replies={false} />;
    }
    const classNames = [ 'comment-container' ];
    let onTransitionEnd
    if (showingComments) {
      classNames.push('open');
    } else {
      if (renderingComments) {
        onTransitionEnd = (evt) => {
          renderComments(false);
        };
      }
    }
    return (
      <div className={classNames.join(' ')} onTransitionEnd={onTransitionEnd}>
        {comments}
      </div>
    );
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
