import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout/Layout';
import Post from '../components/Post/Post';
import Footer from '../components/Footer/Footer';

const BlogPost = ({data}) => {
  return (
    <Layout>
      <Post>{data.markdownRemark}</Post>
      <Footer />
    </Layout>
  )
};

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

export default BlogPost;