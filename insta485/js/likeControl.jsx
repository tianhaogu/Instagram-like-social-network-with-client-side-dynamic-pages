import React from 'react';
import PropTypes from 'prop-types';
import UnlikeButton from './unLikeButton';
import LikeButton from './likeButton';

function LikeControl(props) {
  const { isLognameLikesThis, handleUnlikeClick, handleLikeClick } = props;
  let button;
  if (isLognameLikesThis) {
    button = <UnlikeButton onClick={handleUnlikeClick} />;
  } else {
    button = <LikeButton onClick={handleLikeClick} />;
  }
  return <div>{button}</div>;
}

LikeControl.propTypes = {
  handleLikeClick: PropTypes.func.isRequired,
  handleUnlikeClick: PropTypes.func.isRequired,
  isLognameLikesThis: PropTypes.bool.isRequired,
};

export default LikeControl;
