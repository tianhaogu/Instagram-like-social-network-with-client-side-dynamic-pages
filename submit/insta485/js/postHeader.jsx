import moment from "moment";
import React from "react";
import PropTypes from "prop-types";
class PostHeader extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    //style
    const style_owner = { display: "inline-block", verticalAlign: "middle" };
    const style_time = { display: "inline-block", fontSize: "small" };

    //convertTime
    const sqlDateTime = this.props.created.split(" ");
    const momentInput = `${sqlDateTime[0]}T${sqlDateTime[1]}`;
    const utcTime = moment.utc(momentInput);
    const timeCreated = moment(utcTime).fromNow();
    return (
      <div className="postHeader">
        <a href={this.props.ownerShowUrl}>
          <div>
            <div style={style_owner}>
              <img
                src={this.props.ownerImgUrl}
                width="30"
                height="30"
                alt="Portrait"
              />
            </div>
            <b style={style_owner}>{this.props.owner}</b>
          </div>
        </a>
        <a href={this.props.postShowUrl}>
          <p style={style_time}>{timeCreated}</p>
        </a>
      </div>
    );
  }
}

export default PostHeader;
