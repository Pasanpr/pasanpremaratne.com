import React from 'react';
import GatsbyLink from 'gatsby-link';
import Helmet from 'react-helmet';
import Link from '../components/Link';

import '../css/index.css';

const PostBlurb = props => {
  const post = props.post;
  if (post.frontmatter.path == "/") {
    return <ExternalLinkBlurb post={post} />;
  } else {
    return <DefaultBlurb post={post} />;
  };
};

const DefaultBlurb = props => {
  const post = props.post;
  return (
    <div className="blog-post-preview" key={post.id}>
      <h1 className="title" style={{ fontFamily: `ff-ernestine-pro, serif` }}>
        <GatsbyLink className="post-title-link" to={post.frontmatter.path} style={{ color: `#20242C`, textDecoration: `none` }}>
          {post.frontmatter.title}
        </GatsbyLink>
      </h1>
      <h2 className="date" style={{ fontFamily: `museo-sans, sans-serif` }}>
        {post.frontmatter.date}
      </h2>
      <p className="text" style={{ fontFamily: `museo-sans, sans-serif`, lineHeight: `1.75rem` }}>
        {post.excerpt}
      </p>
      <GatsbyLink className="post-link" to={post.frontmatter.path} style={{ fontFamily: `museo-sans, sans-serif`, color: `#C96DD8`, textDecoration: `none` }}>
        Continue Reading →
      </GatsbyLink>
    </div>
  );
};

const ExternalLinkBlurb = props => {
  const post = props.post;
  return (
    <div className="blog-post-preview" key={post.id}>
      <h1 className="title" style={{ fontFamily: `ff-ernestine-pro, serif` }}>
        <a className="post-title-link" href={post.frontmatter.link} style={{ color: `#20242C`, textDecoration: `none` }}>
          {post.frontmatter.title} ∞
        </a>
      </h1>
      <h2 className="date" style={{ fontFamily: `museo-sans, sans-serif` }}>
        {post.frontmatter.date}
      </h2>
    </div>
  );
};


export default function Index({ data }) {
  const { edges: posts } = data.allMarkdownRemark;
  return (
    <div className="blog-posts">
      {posts
        .filter(post => post.node.frontmatter.title.length > 0)
        .map(({ node: post }) => {
          return <PostBlurb post={post} />;
        })}
    </div>
  );
}

export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___date] }) {
      edges {
        node {
          excerpt(pruneLength: 250)
          id
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            path
            link
          }
        }
      }
    }
  }
`;