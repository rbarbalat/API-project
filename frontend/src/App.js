import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import AllGroups from "./components/AllGroups";
import SingleGroup from "./components/SingleGroup";
import LandingPage from "./components/LandingPage";
import GroupForm from "./components/GroupForm";

//current
function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded &&
        <Switch>
            <Route exact path="/">
              <LandingPage />
            </Route>
            <Route exact path="/groups">
              <AllGroups />
            </Route>
            <Route exact path ="/groups/new">
              <GroupForm formType="Create" />
            </Route>
            <Route path="/groups/:groupId">
              <SingleGroup />
            </Route>
        </Switch>}
    </>
  );
}

export default App;
