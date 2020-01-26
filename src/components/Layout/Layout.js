import React from 'react';
import Helmet from 'react-helmet';
import useSiteMetadata from '../../hooks/use-site-metadata';
import Typekit from 'react-typekit';
import Header from '../Header/Header';
import styles from './layout.module.css';

const Layout = (props) => {
  const { title, meta } = useSiteMetadata();
  const { children } = props;

  return (
    <div>
      <Typekit kitId="kvv8cdm" />
      <Helmet>
        <html lang="en" />
        <title>{title}</title>
        {
          meta.map((metaNode) => {
            return <meta key={metaNode.name} name={metaNode.name} content={metaNode.content} />
          })
        }
      </Helmet>
      <Header />
      <div className={styles.layout}>
        {children}
      </div>
    </div>
  );
}

export default Layout;