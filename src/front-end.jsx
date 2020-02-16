import React, { useState } from 'react';
import { StoryList } from './story-list.jsx';

import './style.scss';

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
