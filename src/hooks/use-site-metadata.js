import { useStaticQuery, graphql } from 'gatsby';

const useSiteMetadata = () => {
  const { site } = useStaticQuery(
    graphql`
      query SiteMetadata {
        site {
          siteMetadata {
            author {
              name
              contacts {
                twitter
              }
            }
            url
            title
            subtitle
            meta {
              name
              content
            }
            copyright
            menu {
              label
              path
            }
          }
        }
      }
    `
  );

  return site.siteMetadata
};

export default useSiteMetadata;