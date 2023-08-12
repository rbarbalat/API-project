import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import AllGroups from "./components/AllGroups";
import AllEvents from "./components/AllEvents";
import SingleGroup from "./components/SingleGroup";
import SingleEvent from "./components/SingleEvent";
import LandingPage from "./components/LandingPage";
import GroupForm from "./components/GroupForm";
import EventForm from "./components/EventForm";
import Footer from "./components/Footer";

//current
function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
    <div className = "media_message">
      This website should be viewed at a width of at least 800 pixels.
    </div>
    <div className = "application_wrapper">
      <Navigation isLoaded={isLoaded} />
      {isLoaded &&
        <Switch>
            <Route exact path="/">
              <LandingPage />
            </Route>
            <Route exact path="/groups">
              <AllGroups />
            </Route>
            <Route exact path="/events">
              <AllEvents />
            </Route>
            <Route exact path ="/groups/new">
              <GroupForm formType="Create" />
            </Route>
            <Route path="/groups/:groupId/events/new">
              <EventForm />
            </Route>
            <Route path="/groups/:groupId/edit">
              <GroupForm formType="Update" />
            </Route>
            <Route path="/groups/:groupId">
              <SingleGroup />
            </Route>
            <Route path="/events/:eventId">
              <SingleEvent />
            </Route>
        </Switch>}
        <Footer />
      </div>
    </>
  );
}

export default App;
