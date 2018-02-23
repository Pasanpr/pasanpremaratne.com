const path = require('path');
const createPaginatedPages = require('gatsby-paginate');

const createTagPages = (createPage, edges) => {
  const tagTemplate = path.resolve(`src/templates/tags.js`);
  const posts = {};

  edges
    .forEach(({ node }) => {
      if (node.frontmatter.tags) {
        node.frontmatter.tags
          .forEach(tag => {
            if (!posts[tag]) {
              posts[tag] = [];
            }
            posts[tag].push(node);
          });
      }
    });

  createPage({
    path: '/tags',
    component: tagTemplate,
    context: {
      posts
    }
  });

  Object.keys(posts)
    .forEach(tagName => {
      const post = posts[tagName];
      createPage({
        path: `/tags/${tagName}`,
        component: tagTemplate,
        context: {
          posts,
          post,
          tag: tagName
        }
      })
    });
};

exports.createPages = ({ boundActionCreators, graphql }) => {
  const { createPage } = boundActionCreators;

  return new Promise((resolve, reject) => {
    const blogPostTemplate = path.resolve(`src/templates/blog-post.js`);
    // Query for markdown nodes to use in creating pages
    resolve(
      graphql(
        `{
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
        `
      ).then(result => {
        if (result.errors) {
          reject(result.errors);
        }

        // Create pages for each markdown file
        result.data.allMarkdownRemark.edges.forEach(({node}) => {
          const path = node.frontmatter.path;
          console.log(path);
          createPage({
            path,
            component: blogPostTemplate,
            context: { 
              path, 
            },
          });
        });
      })
    );
  });
};