import { graphql, PageProps } from 'gatsby'
import * as React from 'react'

const BlogPostPage = ({ data }: PageProps<Queries.BlogPostPageQuery>) => {
    return (
        <p>:LKDJF:LSKJFSD</p>
    )
}

export default BlogPostPage

export const query = graphql`
    query BlogPostPage {
        allMdx {
            nodes {
                id
            }
        }
    }
`
