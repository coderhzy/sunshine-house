import React, { useState } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { AppHeader, Home, Host, Listing, Listings, Login, NotFound, User } from "./sections";
import { Viewer } from "./lib/types";
import { Layout, Affix } from "antd";
import * as serviceWorker from "./serviceWorker";
import './styles/index.css';


const client = new ApolloClient({
  uri: "/api"
});

const initialViewer: Viewer = {
  id: null,
  token: null,
  avatar: null,
  hasWallet: null,
  didRequest: false
};


// 配置路由指向组件
const App = () => {
  const [viewer, setViewer] = useState<Viewer>(initialViewer);
  //console.log(viewer); // 检查登录信息返回状态
  return (
    <Router>
      <Layout id="app">
        <Affix offsetTop={0} className="app__affix-header">
          <AppHeader viewer={viewer} setViewer={setViewer} />
        </Affix>
        <Switch>
          <Route exact path="/" component={Home}></Route>
          <Route exact path="/host" component={Host} />
          <Route exact path="/listing/:id" component={Listing} />
          <Route exact path="/listings/:location?" component={Listings} />
          <Route
            exact
            path="/login"
            render={props => <Login {...props} setViewer={setViewer} />} />
          <Route exact path="/user/:id" component={User} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Router>
  );
}

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
