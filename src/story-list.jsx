import { h } from 'preact';
import { AsyncComponent } from 'relaks/preact';
import { PureComponent } from './pure-component.jsx';
import { StoryView } from './story-view.jsx';
import { get } from './hacker-news.js';

/** @jsx h */

class StoryList extends AsyncComponent {
  async renderAsync(meanwhile) {
    const { type } = this.props;
    const props = {
      stories: [],
    };
    meanwhile.show(<StoryListSync {...props} />);
    const storyIDs = await get(`/${type}.json`);
    for (let i = 0, n = 5; i < storyIDs.length; i += n) {
      const idChunk = storyIDs.slice(i, i + n);
      const stories = await Promise.all(idChunk.map(async (id) => {
        return get(`/item/${id}.json`);
      }));
      props.stories = props.stories.concat(stories);
      meanwhile.show(<StoryListSync {...props} />);
    }
    return <StoryListSync {...props} />;
  }
}

class StoryListSync extends PureComponent {
  render() {
    const { stories } = this.props;
    return (
      <div className="story-list">
      {
        stories.filter((story) => {
          return !story.deleted;
        }).map((story) => {
          return <StoryView key={story.id} story={story} />;
        })
      }
      </div>
    );
  }
}

export { StoryList, StoryListSync };
