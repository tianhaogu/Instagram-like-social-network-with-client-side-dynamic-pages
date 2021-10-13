import React from 'react';
import PropTypes from 'prop-types';


class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      owner: '', ownerImgUrl: '', ownerShowUrl: '', imgUrl: '', 
      postShowUrl: '', postid: '', created: '', comments: [],
      likes: {lognameLikesThis: false, numLikes: 0, url: ''}
    };
  }

  componentDidMount() {
    const fetch_url = this.props.posturl;
    fetch(fetch_url, {credentials: 'same-origin'})
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState({
          owner: data.owner,
          ownerImgUrl: data.ownerImgUrl,
          ownerShowUrl: data.ownerShowUrl,
          imgUrl: data.imgUrl,
          postShowUrl: data.postShowUrl,
          postid: data.postid,
          created: data.created,
          comments: data.comments,
          likes: data.likes
        });
      })
      .catch((error) => console.log(error));
  }

  render() {
    const {
      owner, ownerImgUrl, ownerShowUrl, imgUrl, postShowUrl, postid, 
      created, comments, likes
    } = this.state;
    let numLikes = likes.numLikes;
    let likeComp;
    if (numLikes == 0 || numLikes >= 2) {
      likeComp = <p>{numLikes} likes</p>;
    }
    else {
      likeComp = <p>{numLikes} like</p>;
    }
    let likeButton;
    if (likes.lognameLikesThis == true) {
      likeButton = <button className="like-unlike-button">
        <input type="hidden" name="operation" value="unlike"/>
        <input type="hidden" name="postid" value={postShowUrl}/>
        <input type="submit" name="unlike" value="unlike"/>
      </button>;
    }
    else {
      likeButton = <button className="like-unlike-button">
        <input type="hidden" name="operation" value="like"/>
        <input type="hidden" name="postid" value={postShowUrl}/>
        <input type="submit" name="unlike" value="like"/>
      </button>;
    }
    let commentComp = comments.map((comment) => (
      <div key={comment.commentid}>
        <a href={comment.ownerShowUrl}>
          <b>{comment.owner}</b>
        </a>
        <p>{comment.text}</p>
        {comment.lognameOwnsThis == true &&
          <button className="delete-comment-button">
            <input type="hidden" name="operation" value="delete"/>
            <input type="hidden" name="commentid" value={comment.commentid}/>
            <input type="submit" name="uncomment" value="delete"/>
          </button>
        }
      </div>
    ));
    const style_owner = {display: "inline-block", verticalAlign: "middle"};
    const style_time = {display: "inline-block", fontSize: "small"};

    return (
      <div className="post">
        <div className="postHeader">
          <a href={ownerShowUrl}>
            <div>
              <div style={style_owner}>
                <img src={ownerImgUrl} width="30" height="30" alt="Portrait"/>
              </div>
              <b style={style_owner}>
                {owner}
              </b>
            </div>
          </a>
          <a href={postShowUrl}>
            <p style={style_time}>
              {created}
            </p>
          </a>
        </div>
        <div className="postPhoto">
          <img src={imgUrl} alt="postPhoto"/>
        </div>
        <div className="postParagraph">
          {likeComp}
          {commentComp}
          {likeButton}
          <form className="comment-form">
            <input type="hidden" name="operation" value="create"/>
            <input type="hidden" name="postid" value={postid}/>
            <input type="text" name="text" value="text"/>
            <input type="submit" name="comment" value="comment"/>
          </form>
        </div>
      </div>
    );
  }
}


Post.propTypes = {
  posturl: PropTypes.string.isRequired,
};

export default Post;