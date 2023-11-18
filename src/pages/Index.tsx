import { graphql, PageProps } from 'gatsby'
import * as React from 'react'

const Index = ({ data }: PageProps<Queries.IndexQuery>) => {
    return (
        <p>Test</p>
    )
}

export default Index

export const query = graphql`
    query Index {
        allMdx {
            nodes {
                id
            }
        }
    }
`
