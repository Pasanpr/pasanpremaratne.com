import React from 'react';
import Typekit from 'react-typekit';
import PropTypes from 'prop-types';
import Link from 'gatsby-link';
import Helmet from 'react-helmet';

import '../css/typography.css';
import '../css/prism-ghcolors.css'

const IconList = (props) => {
  return (
    <li style={{ float: `left`, margin: `0 0.5rem`, padding: `0` }}>
      <a href={props.to} style={{ textDecoration: `none`, color: `#aaa` }}>{props.children}</a>
    </li>
  );
};

export default class Template extends React.Component {
  static propTypes = {
    children: PropTypes.func,
  };

  render() {
    const { location } = this.props;
    const year = new Date().getFullYear();
    var FaGithub = require('react-icons/lib/fa/github');
    var FaTwitter = require('react-icons/lib/fa/twitter');

    return (
      <div>
        <Helmet
          title="Pasan Premaratne"
          meta={[
            { name: 'description', content: 'Sample' },
            { name: 'keywords', content: 'sample, something' },
          ]}
        />
        <div
          style={{
            background: `#20242C`,
            marginBottom: `1.45rem`,
          }}
        >
          <div
            style={{
              margin: `0 auto`,
              maxWidth: 960,
              padding: `1rem 0.75rem`,
            }}
          >
            <h1 style={{ margin: 0, fontSize: `2.5rem` }}>
              <Link
                to="/"
                style={{
                  color: '#C96DD8',
                  textDecoration: 'none',
                  fontFamily: `ff-market-web, sans-serif`,
                }}
              >
                Pasan
              </Link>
              <Typekit kitId="kvv8cdm" />
            </h1>
          </div>
        </div>
        <div
          style={{
            margin: `0 auto`,
            maxWidth: 960,
            padding: `0px 1.0875rem 1.45rem`,
            paddingTop: 0,
          }}
        >
          {this.props.children()}
        </div>
        
        {/* Footer */}
        <div className="footer">
          <div
            style={{
              margin: `0 auto`,
              maxWidth: 960,

            }}
          > 
            <div className="social" style={{ textAlign: `center` }}>
              <ul style={{ listStyle: `none`, overflow: `auto`, display: `inline-block`, margin: `0`, padding: `0` }}>
                <IconList to='https://github.com/pasanpr'><FaGithub size={30} /></IconList>
                <IconList to='https://twitter.com/pasanpr'><FaTwitter size={30} /></IconList>
              </ul>
            </div>
            <p style={{ textAlign: `center`, marginTop: `1rem`, fontFamily: `museo-sans, sans-serif`, color: `#aaa` }}>&copy; { year } Pasan Premaratne</p>
          </div>
        </div>
      </div>
    );
  }
}
