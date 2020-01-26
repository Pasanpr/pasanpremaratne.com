import React from 'react';
import ExternalLinkBlurb from './ExternalLinkBlurb/ExternalLinkBlurb';
import PostBlurb from './PostBlurb/PostBlurb';

const Blurb = (props) => {
  const post = props.post;

  if (post.frontmatter.path === '/')  {
    return <ExternalLinkBlurb post={post} />;
  } else {
    return <PostBlurb post={post} />;
  }
};

export default Blurb;