import React from 'react';
import Layout from '../components/Layout/Layout';
import Page from '../components/Page/Page';
import { graphql } from 'gatsby';

import '../css/typography.css';
import '../css/prism-ghcolors.css'

const Index = ({ data }) => {
  const { nodes } = data.allMarkdownRemark;
  return (
    <Layout>
      <Page>
        {nodes}
      </Page>
    </Layout>
  );
}

export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(
      filter: { frontmatter: { draft: { ne: true } } }
      sort: {fields: [frontmatter___date], order: DESC}
      ) {
      nodes {
        id
        excerpt(pruneLength: 250)
        frontmatter {
          title
          date(formatString: "MMMM DD, YYYY")
          path
          link
        }
      }
    }
  }
`;

export default Index;