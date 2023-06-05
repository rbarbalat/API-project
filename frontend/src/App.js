import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import AllGroups from "./components/AllGroups";
import SingleGroup from "./components/SingleGroup";

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
            <Route exact path="/groups">
              <AllGroups />
            </Route>
            {/* maybe :groupId should be only reachable by Link from /groups not directly
            remove from Route? */}
            <Route path="/groups/:groupId">
              <SingleGroup />
            </Route>
        </Switch>}
    </>
  );
}

export default App;
