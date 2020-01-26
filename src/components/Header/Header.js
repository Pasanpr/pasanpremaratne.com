import React from 'react';
import Link from 'gatsby-link';
import styles from './header.module.css';
import useSiteMetadata from '../../hooks/use-site-metadata';

const Header = () => {
  const { subtitle } = useSiteMetadata();
  return (
    <div className={styles.outerDivStyle}>
      <div className={styles.innerDivStyle}>
        <h1 className={styles.h1Style}>
          <Link to="/" className={styles.linkStyle}>{subtitle}</Link>
        </h1>
      </div>
    </div>
  )
};

export default Header;