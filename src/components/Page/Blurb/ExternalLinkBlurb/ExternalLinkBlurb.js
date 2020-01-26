import React from 'react';
import styles from './externalLinkBlurb.module.css'

const ExternalLinkBlurb = (props) => {
  const post = props.post;

  return (
    <div className={styles.blogPostPreview} key={post.id}>
      <h1 className={styles.blogTitle}>
        <a className={styles.postTitleLink} href={post.frontmatter.link}>
          {post.frontmatter.title} ∞
        </a>
      </h1>
      <h2 className={styles.date}>
        {post.frontmatter.date}
      </h2>
    </div>
  );
};

export default ExternalLinkBlurb;