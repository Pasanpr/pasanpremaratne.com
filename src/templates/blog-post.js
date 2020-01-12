import React from 'react';
import Typekit from 'react-typekit';
import Helmet from 'react-helmet';
import '../css/blog-post.css';

export default function Template({ data, pathContext }) {
  const { markdownRemark: post } = data;
  const { next, prev } = pathContext;
  return (
    <div className="blog-post-container">
      <Helmet title={`${post.frontmatter.title}`} />
      <div className="blog-post">
        <div className="blog-title">
          <h1 className="title" style={{ fontFamily: `ff-ernestine-pro, serif`, color: `#20242C` }}>
            {post.frontmatter.title}
          </h1>
          <h2 className="date" style={{ fontFamily: `museo-sans, sans-serif` }}>
            {post.frontmatter.date}
          </h2>
        </div>
        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: post.html }}
          style={{ fontFamily: `museo-sans, sans-serif`, lineHeight: `1.75rem` }}
        />
      </div>
      <Typekit kitId="kvv8cdm" />
    </div>
  );
}

export const pageQuery = graphql`
  query BlogPostByPath($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        path
        tags
        title
      }
    }
  }
`;
