import React from 'react';

const IconListItem = (props) => {
  return (
    <li style={{ float: `left`, margin: `0 0.5rem`, padding: `0` }}>
      <a href={props.to} style={{ textDecoration: `none`, color: `#aaa` }}>{props.children}</a>
    </li>
  );
};

export default IconListItem;