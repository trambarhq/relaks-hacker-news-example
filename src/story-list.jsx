import React from 'react';
import { useProgress } from 'relaks';
import { StoryView } from './story-view.jsx';
import { get } from './hacker-news.js';

export async function StoryList(props) {
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
