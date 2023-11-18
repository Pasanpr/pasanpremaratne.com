import { GatsbyNode } from "gatsby";
import { createFilePath } from "gatsby-source-filesystem";

const path = require('path');

export const createPages: GatsbyNode["createPages"] = async ({
  graphql,
  actions
}) => {
  const { createPage } = actions

  //404
  createPage({
    path: '/404',
    component: path.resolve('./src/pages/404.tsx')
  })

  const result: {
    errors?: any,
    data?: { 
      allMdx: {
        nodes: {
          id: string
          fields: {
            slug: string
          }
          internal: {
            contentFilePath: string
          }
        }[]
      }
    }
  } = await graphql(`
    query AllMdx {
      allMdx(
        sort: { frontmatter: { date: DESC }}
        limit: 1000
      ) {
        nodes {
          id
          fields {
            slug
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `)

  const blogPost = path.resolve(`src/pages/BlogPost.tsx`)
  result.data?.allMdx.nodes.forEach(node => {
    createPage({
      path: node.fields.slug,
      component: `${blogPost}?__contentFilePath=${node.internal.contentFilePath}`,
      context: {
        slug: node.fields.slug
      }
    })
  })

  result.data?.allMdx.nodes.forEach(node => {
  })
}


export const onCreateNode: GatsbyNode["onCreateNode"] = async ({
  node,
  getNode,
  actions
}) => {
  const { createNodeField } = actions

  if (node.internal.type === 'Mdx') {
    const slug = createFilePath({ node, getNode })
    createNodeField({
      node,
      name: 'slug',
      value: slug
    })
  }
}
