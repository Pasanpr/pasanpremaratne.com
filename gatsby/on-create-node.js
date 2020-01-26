'use strict';

const onCreateNode = ({node, actions}) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const slug = node.frontmatter.path;
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    });
  }
};

module.exports = onCreateNode;