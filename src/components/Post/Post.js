import React from 'react';
import Helmet from 'react-helmet';
import styles from './post.module.css';

const Post = (markdownRemark) => {
  const { frontmatter, html } = markdownRemark.children;
  return(
    <div>
      <Helmet>
        <title>{frontmatter.title}</title>
        <meta name="description" content={frontmatter.description} />
        <meta name="twitter:title" content={frontmatter.title} />
        <meta name="twitter:description" content={frontmatter.description} />
      </Helmet>
      <div className={styles.blogPost}>
        <div className={styles.blogTitle}>
          <h1 className={styles.title}>
            {frontmatter.title}
          </h1>
          <h2 className={styles.date}>
            {frontmatter.date}
          </h2>
        </div>
        <div 
          className={styles.blogPostContent}
          dangerouslySetInnerHTML={{ __html: html }}
        >
        </div>
      </div>
    </div>
  )
};

export default Post;