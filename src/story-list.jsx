import _ from 'lodash';
import Promise from 'bluebird';
import { default as React, PureComponent } from 'react';
import { AsyncComponent } from 'relaks';
import { StoryView } from 'story-view';
import { get } from 'hacker-news';

class StoryList extends AsyncComponent {
    static displayName = 'StoryList';

    async renderAsync(meanwhile) {
        let { type } = this.props;
        let props = {
            stories: [],
        };
        meanwhile.show(<StoryListSync {...props} />);
        let storyIDs = await get(`/${type}.json`);
        let storyIDChunks = _.chunk(storyIDs, 5);
        await Promise.each(storyIDChunks, async (idChunk) => {
            let stories = await Promise.map(idChunk, (id) => {
                return get(`/item/${id}.json`);
            });
            props.stories = _.concat(props.stories, stories);
            meanwhile.show(<StoryListSync {...props} />);
        });
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
                _.map(_.reject(stories, { deleted: true }), (story) => {
                    return <StoryView key={story.id} story={story} />;
                })
            }
            </div>
        );
    }
}

export { StoryList, StoryListSync };
