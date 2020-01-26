import React from 'react';
import styles from './postBlurb.module.css'
import GatsbyLink from 'gatsby-link';

const PostBlurb = props => {
  const post = props.post;
  return (
    <div className={styles.blogPostPreview} key={post.id}>
      <h1 className={styles.blogTitle}>
        <GatsbyLink className={styles.postTitleLink} to={post.frontmatter.path}>
          {post.frontmatter.title}
        </GatsbyLink>
      </h1>
      <h2 className={styles.date}>
        {post.frontmatter.date}
      </h2>
      <p className={styles.text}>
        {post.excerpt}
      </p>
      <GatsbyLink className={styles.postLink} to={post.frontmatter.path}>
        Continue Reading →
      </GatsbyLink>
    </div>
  );
};

export default PostBlurb;