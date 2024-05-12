// -- React and related libs
import React from "react";
import { connect } from "react-redux";
import { Switch, Route, withRouter, Redirect } from "react-router";

// -- Third Party Libs
import PropTypes from "prop-types";

// -- Custom Components
import Sidebar from "../Sidebar/Sidebar";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import Dashboard from "../../pages/dashboard/DashBoard";

// -- Component Styles
import s from "./Layout.module.scss";
import InsertProduct from "../InsertProduct/InsertProduct";
import CreatePhoneSale from "../CreatePhoneSale/CreatePhoneSale";
import ViewsPhoneSale from "../ViewsPhoneSale/ViewsPhoneSale";
import CreateEnterPhone from "../CreateEnterPhone/CreateEnterPhone";
import ViewsEnterPhone from "../ViewsEnterPhone/ViewsEnterPhone";

const Layout = (props) => {
  return (
    <div className={s.root}>
      <div className={s.wrap}>
        <Header />
        <Sidebar />
        <main className={s.content}>
          <Switch>
            <Route path="/template" exact render={() => <Redirect to="template/dashboard"/>} />
            <Route path="/template/dashboard" exact component={Dashboard}/> 
            <Route path="/template/insertProduct" component={InsertProduct} />
            <Route path="/template/createPhoneSale" exact component={CreatePhoneSale} />
            <Route path="/template/viewsPhoneSale" exact component={ViewsPhoneSale} />
            <Route path="/template/createEnterPhone" exact component={CreateEnterPhone} />
            <Route path="/template/viewsEnterPhone" exact component={ViewsEnterPhone} />
          </Switch>
        </main>
        <Footer />
      </div>
    </div>
  );
}

Layout.propTypes = {
  sidebarOpened: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
}

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
  };
}

export default withRouter(connect(mapStateToProps)(Layout));
