import React from 'react';
import PropTypes from 'prop-types';
import Post from './post';
import InfiniteScroll from 'react-infinite-scroll-component';

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      next: '', results: [], url: '', hasMore: true
    };
    this.fetchMoreData = this.fetchMoreData.bind(this);
  }

  componentDidMount() {
    const fetch_url = this.props.url;
    fetch(fetch_url, {credentials: 'same-origin', method: "GET"})
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState({
          next: data.next,
          results: data.results,
          url: data.url
        });
      })
      .catch((error) => console.log(error));
  }

  fetchMoreData() {
    if (this.state.next === '') {
      this.setState({ hasMore: false });
      return;
    }
    const next_url = this.state.next;
    const curr_result = this.state.results;
    fetch(next_url, {credentials: 'same-origin', method: "GET"})
      .then((next_response) => {
        if (!next_response.ok) throw Error(next_response.statusText);
        return next_response.json();
      })
      .then((next_data) => {
        this.setState({
          next: next_data.next,
          results: curr_result.concat(next_data.results),
          url: next_data.url
        });
      })
      .catch((next_error) => console.log(next_error));
  }

  render() {
    const results = this.state.results;
    return (
      <div className="posts">
        <InfiniteScroll
          dataLength={this.state.results.length}
          next={this.fetchMoreData}
          hasMore={this.state.hasMore}
          loader={<h4>Loading...</h4>}
          scrollThreshold="200px"
          endMessage={
            <p style={{ textAlign: "center" }}>
              <b>That's all of the posts!</b>
            </p>
          }
        >
          {results.map((result) => (
            <div key={result.postid}>
              <Post posturl={result.url} />
              <br/>
            </div>
          ))}
        </InfiniteScroll>
      </div>
    );
  }
}

Index.propTypes = {
  url: PropTypes.string.isRequired,
};
  
export default Index;