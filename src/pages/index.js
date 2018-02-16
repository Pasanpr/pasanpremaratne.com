import React from 'react';
import GatsbyLink from 'gatsby-link';
import Helmet from 'react-helmet';
import Link from '../components/Link';

import '../css/index.css';

const NavLink = props => {
  if (!props.test) {
    return <li><Link to={props.url}>{props.text}</Link></li>;
  } else {
    return <li><span className="pagination-disabled">{props.text}</span></li>;
  }
};

export default function Index({ data }) {
  const { edges: posts } = data.allMarkdownRemark;
  return (
    <div className="blog-posts">
      {posts
        .filter(post => post.node.frontmatter.title.length > 0)
        .map(({ node: post }) => {
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
          }
        }
      }
    }
  }
`;