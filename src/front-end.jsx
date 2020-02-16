import { h, Component } from 'preact';
import { StoryList } from './story-list.jsx';

import './style.scss';

/** @jsx h */

class FrontEnd extends Component {
  constructor() {
    super();
    const storyType = localStorage.storyType || 'topstories';
    this.state = { storyType };
  }

  render() {
    const { storyType } = this.state;
    return (
      <div className="application">
        {this.renderNavBar()}
        <StoryList key={storyType} type={storyType} />
      </div>
    );
  }

  renderNavBar() {
    const { storyType } = this.state;
    return (
      <div className="nav-bar">
        <div className="contents">
          <Button value="topstories" selected={storyType} onClick={this.handleClick}>
            Top Stories
          </Button>
          <Button value="beststories" selected={storyType} onClick={this.handleClick}>
            Best Stories
          </Button>
          <Button value="askstories" selected={storyType} onClick={this.handleClick}>
            Ask Stories
          </Button>
          <Button value="showstories" selected={storyType} onClick={this.handleClick}>
            Show Stories
          </Button>
          <Button value="jobstories" selected={storyType} onClick={this.handleClick}>
            Job Stories
          </Button>
        </div>
      </div>
    );
  }

  handleClick = (evt) => {
    const target = evt.currentTarget;
    const storyType =  target.getAttribute('data-value');
    this.setState({ storyType });
    localStorage.storyType = storyType;
  }
}

function Button(props) {
  const buttonProps = {
    className: 'button',
    'data-value': props.value,
    onClick: props.onClick,
  }
  const iconProps = {
    className: 'icon fa-heart',
  };
  if (props.value === props.selected) {
    iconProps.className += ' fas';
    buttonProps.className += ' selected';
  } else {
    iconProps.className += ' far';
  }
  return (
    <div {...buttonProps}>
      <i {...iconProps} /> {props.children}
    </div>
  )
}

export {
  FrontEnd as default,
  FrontEnd,
};
