import { h } from 'preact';
import { PureComponent } from 'pure-component';
import { AsyncComponent } from 'relaks/preact';
import { StoryView } from 'story-view';
import { get } from 'hacker-news';

/** @jsx h */

class StoryList extends AsyncComponent {
    static displayName = 'StoryList';

    async renderAsync(meanwhile) {
        let { type } = this.props;
        let props = {
            stories: [],
        };
        meanwhile.show(<StoryListSync {...props} />);
        let storyIDs = await get(`/${type}.json`);
        for (let i = 0, n = 5; i < storyIDs.length; i += n) {
            let idChunk = storyIDs.slice(i, i + n);
            var stories = await Promise.all(idChunk.map(async (id) => {
                return get(`/item/${id}.json`);
            }));
            props.stories = props.stories.concat(stories);
            meanwhile.show(<StoryListSync {...props} />);
        }
        return <StoryListSync {...props} />;
    }
}

class StoryListSync extends PureComponent {
    static displayName = 'StoryListSync';

    render() {
        let { stories } = this.props;
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
