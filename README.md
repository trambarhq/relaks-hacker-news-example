# Relaks Hacker News Example

The opinionated nature of [Relaks](https://github.com/chung-leong/relaks) makes
it especially useful during the prototyping phrase of application development.
In this example, we're going to build a quick-and-dirty [Hacker News](https://news.ycombinator.com/)
reader. We won't put much thoughts into software architecture. We just want a
working demo to show people. The focus will be squarely on the user interface.

[Here's the end result](https://trambar.io/examples/hacker-news/).

## Data source

The code for data retrieval is contained in [hacker-news.js](https://github.com/chung-leong/relaks-hacker-news-example/blob/master/src/hacker-news.js).
It's very primitive:

```js
import Memoizee from 'memoizee';

const baseURL = 'https://hacker-news.firebaseio.com/v0'

let get = Memoizee(async function(uri) {
    let url = baseURL + uri;
    let response = await window.fetch(url);
    let result = await response.json();
    return result;
});

export { get };
```

As you can see, all we have is a function (rather poorly named) that retrieves
a JSON object from Hacker News. We aren't terribly familiar with the
[Hacker News API](https://github.com/HackerNews/API) at this point. We aren't
even sure if our approach is viable--assessing the API directly from the
client-side could conceivably be too slow. It doesn't make sense to try to
build something sophisticated.

`get()` is memoized so that we get the same promise for the same URI. It's a
quick way of providing the caching that Relaks needs.

## Application

Per usual, **Application** ([application.jsx](https://github.com/chung-leong/relaks-hacker-news-example/blob/master/src/application.jsx))
is the app's root node. It's a regular React component. Its `render()` method
looks as follows:

```js
render() {
    let { storyType } = this.state;
    return (
        <div className="application">
            {this.renderNavBar()}
            <StoryList key={storyType} type={storyType} />
        </div>
    );
}
```

Pretty standard React code. The method renders a nav bar and a the story list,
which could be of different types ("top", "best", "job", etc.). One notable
detail is the use of a key on **StoryList**. This will be addressed [later](#key-usage).

## Story list

**StoryList** ([story-list.jsx](https://github.com/chung-leong/relaks-hacker-news-example/blob/master/src/story-list.jsx))
is a Relaks component. Its `renderAsync()` method is as follows:

```js
async renderAsync(meanwhile) {
    let { type } = this.props;
    let props = {
        stories: [],
    };
    meanwhile.show(<StoryListSync {...props} />);
    let storyIDs = await get(`/${type}.json`);
    let storyIDChunks = _.chunk(storyIDs, 5);
    await Promise.each(storyIDChunks, async (idChunk) => {
        var stories = await Promise.map(idChunk, (id) => {
            return get(`/item/${id}.json`);
        });
        props.stories = _.concat(props.stories, stories);
        meanwhile.show(<StoryListSync {...props} />);
    });
    return <StoryListSync {...props} />;
}
```

We first retrieve a list of story IDs from Hacker News (e.g. "/topstories.json").
The list could contain upwards of 500 IDs. The API only permits the retrieval of
a single story at a time. We obviously don't want to wait for 500 HTTP requests
to complete before showing something. So we break the list into chunks of five
and ask for redraw after each chunk is fetched.

`Promise.each()` and `Promise.map` aren't standard function. We're using the
excellent [Bluebird](http://bluebirdjs.com) library to help orchestrate the
asynchronous operations.

**StoryListSync**'s ([same file](https://github.com/chung-leong/relaks-hacker-news-example/blob/master/src/story-list.jsx#L30)) `render()`
method looks like this--nothing special:

```js
render() {
    let { stories } = this.props;
    return (
        <div className="story-list">
        {
            _.map(stories, (story) => {
                return <StoryView key={story.id} story={story} />;
            })
        }
        </div>
    );
}
```

## Story View

**StoryView** ([story-view.jsx](https://github.com/chung-leong/relaks-hacker-news-example/blob/master/src/story-view.jsx))
is a Relaks component. Async handling is needed because poll stories have
additional parts that needs to be downloaded. Here's its `renderAsync()` method:

```js
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
```

The `render()` method of **StoryViewSync**
([same file](https://github.com/chung-leong/relaks-hacker-news-example/blob/master/src/story-view.jsx#L27))
looks like this:

```js
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
```

The code should be self-explanatory. Of the helper methods, `renderCommentList()`
is the one that contains more than formatting code:

```js
renderCommentList() {
    let { story } = this.props;
    let comments;
    if (this.state.renderingComments) {
        let listProps = { commentIDs: story.kids, replies: false };
        comments = <CommentList {...listProps} />;
    }
    let containerProps = { className: 'comment-container' };
    if (this.state.showingComments) {
        containerProps.className += ' open';
    } else {
        if (this.state.renderingComments) {
            containerProps.onTransitionEnd = this.handleTransitionEnd;
        }
    }
    return <div {...containerProps}>{comments}</div>;
}
```

Comments are not shown initially. They appear when the user clicks on the bar.
Two state variables are used to track this: `showingComments` and
`renderingComments`. The second one is needed due to transition effect. We have
to continue to render **CommentList** while the container div is collapsing.
It's only after the transition has finished (the div having a height of 0) can
we stop rendering it.

Here's the code of `handleTransitionEnd()`:

```js
handleTransitionEnd = (evt) => {
    this.setState({ renderingComments: false });
}
```

When `state.renderingComments` becomes false, **CommentList** will unmount. If
it's still in the middle of retrieving comments from the HN server,
`meanwhile.show()` will throw an `AsyncRenderingInterrupted` exception. The
promise returned by `Promise.each()` then immediately rejects, stopping any
further data retrieval.

## Comment list

**CommentList** ([comment-list.jsx](https://github.com/chung-leong/relaks-hacker-news-example/blob/master/src/comment-list.jsx))
functions largely like **StoryList**. Its code was, in fact, created by
copy-and-pasting from the other class. Here's its `renderAsync()` method:

```js
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
```

The `render()` method of **CommentListSync** ([same file](https://github.com/chung-leong/relaks-hacker-news-example/blob/master/src/comment-list.jsx#L31))
works slightly differently:

```js
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
```

Instead of loop through the list of comment objects, we loop through the list
of comment IDs. This allows us to draw placeholders for the comments while
they're loading.

## Comment view

**CommentView** ([comment-view.jsx](https://github.com/chung-leong/relaks-hacker-news-example/blob/master/src/comment-view.jsx))
is a normal React component. Its `render()` methods looks as follows:

```js
render() {
    let { comment, reply } = this.props;
    let iconClass = 'fa-heart ' + (reply ? 'far' : 'fas');
    let author, text;
    if (comment) {
        if (!comment.deleted) {
            author = `${comment.by}:`;
            text = <HTML markup={comment.text} />;
        } else {
            iconClass = 'fa-sad-tear fas';
            author = '[deleted]';
        }
    } else {
        author = <span className="pending">...</span>;
        text = '\u00a0';
    }
    return (
        <div className="comment">
            <div className="icon">
                <i className={iconClass} />
            </div>
            <div className="contents">
                <div className="by">{author}</div>
                <div className="text">{text}</div>
                {this.renderReplies()}
            </div>
        </div>
    );
}
```

A comment can have replies. `renderReplies()` draws them by creating an
instance of **CommentList**:

```js
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
```

## Key usage

Earlier, you saw the `render()` method of **Application**:

```js
render() {
    let { storyType } = this.state;
    return (
        <div className="application">
            {this.renderNavBar()}
            <StoryList key={storyType} type={storyType} />
        </div>
    );
}
```

Why does it put a key on **StoryList**? That's done to keep React from reusing
the component when the story type changes. As the lists contain largely
different sets of stories, it doesn't make sense to reuse the component. React
will just ending up wasting time performing a diff of the component's children.

Another problem is the scroll position. If the user has scrolled down prior to
switching to a different story type, the new page could end up with the old
scroll position. While you can force a scroll-to-top manually, the operation
would not be in-sync with the redrawing of the page. Either the user will see
very briefly the old page, or he will very briefly see the middle section of
the new page.

If the key is removed, the app would in fact start to malfunction much more
seriously. After a page fully loads, the nav bar would cease to work seemingly.
This behavior is due to the way Relaks defers rendering elements passed to
`meanwhile.show()`. During the initial render cycle (i.e. right after the
component mounts), Relaks gives the promise it receives from `renderAsync()`
50ms. Once the promise has resolved, the delay becomes infinity by default.
Progressive rendering is turned off in effect. The assumption is that any
rerendering after a component has rendered fully is due to changes to the data
that it uses as opposed to user action. If the user is unaware that an operation
has started, then he cannot perceive it as slow. Progressive rendering no longer
makes sense.

While you can alter the delay with a call to `meanwhile.delay()`, forcing React
to recreate the component is the superior solution.

An alternative to using a key would be to create wrapper component type for
each story type:

```js
function TopStoryList(props) {
    return <StoryList type="topstories" {...props} />;
}
```

This would be a cleaner solution when the app is using a page router.

## Omitting Bluebird

While Bluebird is a very handy tool, the library is fairly large. While size is
not an issue for a working demo, eventually we might want to slim down the app
and omit Bluebird.

The following is a version of **StoryList**'s renderAsync() method without
Bluebird or Lodash:

```js
async renderAsync(meanwhile) {
    let { type } = this.props;
    let props = {
        stories: [],
    };
    meanwhile.show(<StoryListSync {...props} />);
    let storyIDs = await get(`/${type}.json`);
    for (let i = 0, n = 5; i < storyIDs.length; i += n) {
        let idChunk = storyIDs.slice(i, i + n);
        let stories = await Promise.all(idChunk.map((id) => {
            return get(`/item/${id}.json`);
        }));
        props.stories = props.stories.concat(stories);
        meanwhile.show(<StoryListSync {...props} />);
    }
    return <StoryListSync {...props} />;
}
```

It's arguably somewhat easier to understand.
