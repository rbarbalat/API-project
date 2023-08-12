import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import './index.css';
import App from './App';
import configureStore from './store';

import { restoreCSRF, csrfFetch } from './store/csrf';
import * as sessionActions from "./store/session";
import * as groupsActions from "./store/groups";

import { ModalProvider, Modal } from './context/Modal';

//current
const store = configureStore();

// if (process.env.NODE_ENV !== "production") {
//   window.store = store;
// }

if (process.env.NODE_ENV !== 'production') {
  restoreCSRF();

  window.csrfFetch = csrfFetch;
  window.store = store;
  window.sessionActions = sessionActions;
  window.groupsActions = groupsActions;
}

function Root() {
  return (
    <ModalProvider>
      <ReduxProvider store={store}>
        <BrowserRouter>
          <App />
          <Modal />
        </BrowserRouter>
      </ReduxProvider>
    </ModalProvider>
  );
}

ReactDOM.render(
  //installHook.js was overriding my values somehow when I was changing the startDate in the AllEvents component
  //commenting out strictmode fixed the issue
  //<React.StrictMode>
    <Root />,
  //</React.StrictMode>,
  document.getElementById('root')
);
