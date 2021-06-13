import React from 'react';
import * as styles from './footer.module.css';
import { FaGithub, FaTwitter } from 'react-icons/fa';
import IconListItem from './IconListItem/IconListItem';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <div className={styles.footer}> 
      <div className={styles.social}>
        <ul className={styles.socialList}>
          <IconListItem to='https://github.com/pasanpr'><FaGithub size={30} /></IconListItem>
          <IconListItem to='https://twitter.com/pasanpr'><FaTwitter size={30} /></IconListItem>
        </ul>
      </div>
      <p>&copy; { year } Pasan Premaratne</p>
    </div>
  )
};

export default Footer;