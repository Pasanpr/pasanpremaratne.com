import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: 'Pasan Premaratne',
    subtitle: 'Pasan',
    url: 'https://pasanpremaratne.com/',
    pathPrefix: '/',
    meta: [
      { 
        name: 'description', 
        content: 'Personal blog by Pasan.'
      }
    ],
    copyright: '© All rights reserved.',
    postsPerPage: 4,
    menu: [
      {
        label: 'Articles',
        path: '/'
      }
    ],
    author: {
      name: 'Pasan Premaratne',
      contacts: {
          twitter: 'https://twitter.com/pasanpr'
      }
    }
  },
  graphqlTypegen: true,
  plugins: [
    'gatsby-plugin-catch-links',
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    'gatsby-plugin-react-helmet',
    "gatsby-transformer-sharp",
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        "name": "pages",
        "path": `${__dirname}/content`,
      },
      __key: "pages"
    },
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        extensions: [`.md`, `.mdx`],
        gatsbyRemarkPlugins: [
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 590,
              linkImagesToOriginal: true,
              sizeByPixelDensity: false,
            }
          }
        ]
      }
    }
  ]
}

export default config
