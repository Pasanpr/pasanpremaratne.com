import React from "react";
import { Helmet } from "react-helmet";

export declare interface ILayoutProps {
  children?: React.ReactNode
}

const Layout = (props: ILayoutProps) => {
  const { children } = props

  return (
  <div>
    <Helmet>
      <html lang="en" />
      <script src="https://use.typekit.net/kvv8cdm.js" async></script>
    </Helmet>
    <div>
      {children}
    </div>
  </div>
  )
}

export default Layout
