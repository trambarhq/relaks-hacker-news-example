# Relaks Hacker News Example

The unopinionated nature of [Relaks](https://github.com/trambarhq/relaks) makes it especially useful during the prototyping phrase of development. In this example, we're going to build a quick-and-dirty [Hacker News](https://news.ycombinator.com/) reader. We don't want to spend time on software architecture. We just want a working demo to show people. The focus will be squarely on the user interface.

[Here's the end result](https://trambar.io/examples/hacker-news/).

[![Screenshot](docs/img/screenshot.png)](https://trambar.io/examples/hacker-news/)

(In case you're wondering: Yes, the UI is meant as a joke :-)

## Data source

The code for data retrieval is contained in [hacker-news.js](https://github.com/trambarhq/relaks-hacker-news-example/blob/master/src/hacker-news.js). It's very primitive:

```javascript
const baseURL = 'https://hacker-news.firebaseio.com/v0'
const cache = {};

async function get(uri) {
	let promise = cache[uri];
	if (!promise) {
	    promise = cache[uri] = fetchJSON(baseURL + uri);
	}
    return promise;
}

async function fetchJSON(url) {
	const response = await fetch(url);
	return response.json();
}

export {
    get
};
```

Just a function (rather poorly named) that retrieves a JSON object from Hacker News. We aren't familiar with the [Hacker News API](https://github.com/HackerNews/API) at this point. We aren't even sure if our approach is viable. Conceivably, assessing the API directly from the client side might be too slow. It doesn't make sense therefore to build something sophisticated.

## FrontEnd

Per usual, `FrontEnd` ([front-end.jsx](https://github.com/trambarhq/relaks-hacker-news-example/blob/master/src/front-end.jsx)) is the front-end's root node. It's a regular React component. Its source code is listed below:

```javascript
import React, { useState } from 'react';
import { StoryList } from 'story-list';

import 'style.scss';

function FrontEnd(props) {
    const [ storyType, setStoryType ] = useState(localStorage.storyType || 'topstories');

    const handleClick = (evt) => {
        const target = evt.currentTarget;
        const type =  target.getAttribute('data-value');
        setStoryType(type);
        localStorage.storyType = type;
    };

    return (
        <div className="application">
            <div className="nav-bar">
                <div className="contents">
                    <Button value="topstories" selected={storyType} onClick={handleClick}>
                        Top Stories
                    </Button>
                    <Button value="beststories" selected={storyType} onClick={handleClick}>
                        Best Stories
                    </Button>
                    <Button value="askstories" selected={storyType} onClick={handleClick}>
                        Ask Stories
                    </Button>
                    <Button value="showstories" selected={storyType} onClick={handleClick}>
                        Show Stories
                    </Button>
                    <Button value="jobstories" selected={storyType} onClick={handleClick}>
                        Job Stories
                    </Button>
                </div>
            </div>
            <StoryList key={storyType} type={storyType} />
        </div>
    );
}

function Button(props) {
    const { value, children, onClick } = props;
    const btnClassNames = [ 'button' ];
    const iconClassNames = [ 'icon', 'fa-heart' ];
    if (props.value === props.selected) {
        iconClassNames.push('fas') ;
        btnClassNames.push('selected');
    } else {
        iconClassNames.push('far');
    }
    return (
        <div className={btnClassNames.join(' ')} data-value={value} onClick={onClick}>
            <i className={iconClassNames.join(' ')} /> {children}
        </div>
    )
}

export {
    FrontEnd,
};
```

Pretty standard React code. The method renders a nav bar and a story list, which could be of different types ("top", "best", "job", etc.). One notable detail is the use of a key on `StoryList`. This will be addressed [later](#key-usage).

## StoryList

`StoryList` ([story-list.jsx](https://github.com/trambarhq/relaks-hacker-news-example/blob/master/src/story-list.jsx)) is a Relaks component. It uses the `useProgress` hook to perform progressive rendering. It accepts `type` as a prop and retrieves stories of that type from HN.

```javascript
import React from 'react';
import Relaks, { useProgress } from 'relaks';
import { StoryView } from 'story-view';
import { get } from 'hacker-news';

async function StoryList(props) {
    const { type } = props;
    const [ show ] = useProgress();
    const stories = [];

    render();
    const storyIDs = await get(`/${type}.json`);
    for (let i = 0, n = 5; i < storyIDs.length; i += n) {
        const idChunk = storyIDs.slice(i, i + n);
        const storyChunk = await Promise.all(idChunk.map(async (id) => {
            return get(`/item/${id}.json`);
        }));
        for (let story of storyChunk) {
            stories.push(story);
        }
        render();
    }

    function render() {
        show(
            <div className="story-list">
                {stories.map(renderStory)}
            </div>
        );
    }

    function renderStory(story, i) {
        if (story.deleted) {
            return null;
        }
        return <StoryView story={story} key={story.id} />;
    }
}

const component = Relaks.memo(StoryList);

export {
    component as StoryList
};
```

We first retrieve a list of story IDs (e.g. [/topstories.json](https://hacker-news.firebaseio.com/v0/topstories.json)). The list can contain upwards of 500 IDs. The API only permits the retrieval of a single story at a time. We obviously don't want to wait for 500 HTTP requests to finish before showing something. So we break the list into chunks of five and ask for redraw after each chunk is fetched.

## StoryView

`StoryView` ([story-view.jsx](https://github.com/trambarhq/relaks-hacker-news-example/blob/master/src/story-view.jsx)) is another Relaks component. Async handling is needed because poll stories have additional parts that need to be downloaded. That only occupies a small part of its code though. The rest is standard React UI code.

```javascript
import React, { useState } from 'react';
import Relaks, { useProgress } from 'relaks';
import { CommentList } from 'comment-list';
import { get } from 'hacker-news';

var counts = {};

async function StoryView(props) {
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
    require('../img/kitty-1.png'),
    require('../img/kitty-2.png'),
    require('../img/kitty-3.png'),
    require('../img/kitty-4.png'),
    require('../img/kitty-5.png'),
    require('../img/kitty-6.png'),
    require('../img/kitty-7.png'),
];
const extraDecorativeImage = require('../img/kitty-8.png');

const component = Relaks.memo(StoryView);

export {
    component as StoryView
};
```

The code above should be largely self-explanatory. Of the helper functions, `renderCommentList()` is the only one that warrants a closer look:

```javascript
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
```

Comments are not shown initially. They appear when the user clicks on the bar. Two state variables are used to track this: `showingComments` and `renderingComments`. The second one is needed due to transition effect. We have to continue to render `CommentList` while the container div is collapsing. Only after the transition has ended can we stop rendering it.

## CommentList

`CommentList` ([comment-list.jsx](https://github.com/trambarhq/relaks-hacker-news-example/blob/master/src/comment-list.jsx)) functions largely like `StoryList`. Its code was, in fact, created by copy-and-pasting. The component receives `commentIDs` and `replies` as props. The latter is a boolean that indicates whether the list contains replies to comments. `StoryView` sets this to `false`.

```javascript
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
```

The rendering code is slightly different here. Instead of loop through the list of comment objects, we loop through the list of comment IDs. This allows us to draw placeholders for the comments while they're loading.

## CommentView

`CommentView` ([comment-view.jsx](https://github.com/trambarhq/relaks-hacker-news-example/blob/master/src/comment-view.jsx)) is a normal React component. It receives `comment` and `reply` as props. The latter indicates whether the comment is a reply to a comment.

```javascript
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
```

A comment can have replies. `renderReplies()` draws them by creating an instance of `CommentList`:

```javascript
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
```

And that's it!

## Key usage

Earlier you saw `FrontEnd` rendering `StoryList` with a key:

```javascript
    <StoryList key={storyType} type={storyType} />
```

That's done to keep React from reusing the component when the story type changes. As the lists contain different sets of stories, it doesn't make sense to reuse the component. React will just end up wasting time diffing the component's children.

Another problem is the scroll position. If the user has scrolled down prior to switching to a different story type, the new page would end up with the old scroll position. While you can force a scroll-to-top manually, the operation would not be in-sync with the redrawing of the page. Either the user will see very briefly the old page, or he will very briefly see the middle section of the new page.

If the key is removed, the front-end would in fact start to malfunction much more seriously. After a page fully loads, the nav bar would cease to work seemingly. This behavior is due to the way Relaks defers rendering elements passed to `show()`. During the initial render cycle (i.e. right after the component mounts), asynchronous operations have 50ms to complete before progressive rendering kicks in. Once the component renders fully, the delay becomes `infinity` by default. Progressive rendering is turned off, in effect. The assumption is that any rerendering after a component has fully rendered is due to data changes as opposed to user action. The user has no clue when that happens so progressive rendering isn't necessary--if you don't know when an operation begins, you can't tell whether it happens slowly or quickly. Besides, a component suddenly reverting from a complete state to an incomplete state just feels weird.

While you can give a different delay to `useProgress`, starting afresh whenever the story type changes makes better sense.

## Next step

As a proof-of-concept, this example managed to exceed expectations. Hacker News' API turns out to be very fast. Even from across the Atlantic, our front-end is quite responsive. Building it didn't take long--half a day or so. The majority of the time was spent on page layout and CSS styling.

Building a front-end using Relaks is easy and quick. There's no new concepts to digest. All that's required is a strong command of the JavaScript asynchronous model and React.

Where do we go from here? There's a couple short-comings that need addressing. First, the page doesn't update itself when new stories are posted on Hacker News. Adding change notification would entail using the Firebase SDK. Second, the comment count currently only reflects top-level comments. In order to get the total number of comments (that is, including replies to comments) we would have to recursively fetch all comments. Clearly, we can't do that for all stories. Some kind of retrieve-on-scroll mechanism would be needed. We'll deal with these issues in a future example.
