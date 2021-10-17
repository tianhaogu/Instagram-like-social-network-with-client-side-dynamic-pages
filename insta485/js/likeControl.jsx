import React from "react";
import PropTypes from "prop-types";

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <button className="like-unlike-button" onClick={this.props.onClick}>
        LIKE
      </button>
    );
  }
}

class UnlikeButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <button className="like-unlike-button" onClick={this.props.onClick}>
        UNLIKE
      </button>
    );
  }
}

class LikeControl extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const isLognameLikesThis = this.props.isLognameLikesThis;
    let button;
    if (isLognameLikesThis) {
      button = <UnlikeButton onClick={this.props.handleUnlikeClick} />;
    } else {
      button = <LikeButton onClick={this.props.handleLikeClick} />;
    }
    return <div>{button}</div>;
  }
}

LikeButton.propTypes = {
  handleLikeClick: PropTypes.func.isRequired,
};
UnlikeButton.propTypes = {
  handleUnlikeClick: PropTypes.func.isRequired,
};
LikeControl.propTypes = {
  handleLikeClick: PropTypes.func.isRequired,
  handleUnlikeClick: PropTypes.func.isRequired,
  isLognameLikesThis: PropTypes.bool.isRequired,
};

export default LikeControl;

{
  /*
class LikeControl extends React.Component {
  constructor(props) {
    super(props);
    this.handleLikeClick = this.handleLikeClick.bind(this);
    this.handleUnlikeClick = this.handleUnlikeClick.bind(this);
    this.state = {
      isLognameLikesThis: this.props.isLognameLikesThis,
    };
  }

  handleUnlikeClick() {
    this.setState({ isLognameLikesThis: false });
  }

  handleLikeClick() {
    this.setState({ isLognameLikesThis: true });
  }

  render() {
    const isLognameLikesThis = this.state.isLognameLikesThis;
    let button;
    if (isLognameLikesThis === true) {
      button = (
        <button className="like-unlike-button" onClick={this.handleUnlikeClick}>
          Unlike
        </button>
      );
    } else {
      button = (
        <button className="like-unlike-button" onClick={this.handleLikeClick}>
          Like
        </button>
      );
    }

    return <div> <p>{button}</p></div>;
  }
}

ReactDOM.render(
  <LikeControl isLognameLikesThis={false}/>,
  document.getElementById('root')
);


*/
}
