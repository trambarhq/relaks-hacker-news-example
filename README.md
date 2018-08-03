# Relaks Hacker News Example

The opinionated nature of [Relaks](https://github.com/chung-leong/relaks) makes
it especially useful during the prototyping phrase of application development.
In this example, we're going to build a quick-and-dirty [Hacker News](https://news.ycombinator.com/)
reader. We won't put much thoughts into software architecture. We just want a
working demo to show people. The focus will be squarely on the user interface.

[Here's the end result](https://trambar.io/examples/hacker-news/).

## Data source

The code for data retrieval is contained in [hacker-news.js](https://github.com/chung-leong/relaks-hacker-news-example/blob/master/src/hacker-news.jsx).
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

**StoryList** is a Relaks component. Its `renderAsync()` method is as follows:

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
The list could upwards of 500 IDs. The API only permits the retrieval of a
single story at a time. We obviously don't want to wait for 500 HTTP requests to
complete before showing something. So we break the list into chunks of five and
ask for redraw after each chunk is fetched.

`Promise.each()` and `Promise.map` aren't standard function. We're using the
excellent [Bluebird](http://bluebirdjs.com) library to help orchestrate the
asynchronous operations.

**StoryListSync**'s `render()` method looks like this:

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
