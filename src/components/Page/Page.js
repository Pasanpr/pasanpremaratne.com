import React from 'react';
import Blurb from './Blurb/Blurb';
import * as styles from './page.module.css'

const Page = (props) => {
  const { children: posts } = props;
  return (
    <div className={styles.blogPosts}>
      {
        posts
        .map((post) => {
          return <Blurb key={post.id} post={post} />;
        })
      }
    </div>
  )
};

export default Page;