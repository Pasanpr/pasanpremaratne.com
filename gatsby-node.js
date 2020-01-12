'use strict';

const path = require('path');

module.exports = async (graphql, actions) => {
  const { createPage } = actions;
  const blogPostTemplate = path.resolve(`src/templates/blog-post.js`);
  const result = await graphql(`
  {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] },
      limit: 1000
    ) {
      edges {
        node {
          frontmatter {
            path
          }
        }
      }
    }
  }
  `);

  result.data.allMarkdownRemark.edges.forEach(({node}) => {
    const path = node.frontmatter.path;
    createPage({
      path: path,
      component: blogPostTemplate,
      context: {
        path
      }
    });
  });
}