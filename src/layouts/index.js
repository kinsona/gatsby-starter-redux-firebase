import React, { Component } from 'react'
import { createStore, combineReducers } from 'redux'
import { Provider as ReduxProvider } from 'react-redux'
import { ReactReduxFirebaseProvider, firebaseReducer } from 'react-redux-firebase'

import getFirebase from '../firebase'
import SignIn from '../containers/SignIn'


class Layout extends Component {
  state = {
    firebase: null,
    authenticated: false,
    store: null,
  }

  componentDidMount() {
    const app = import('firebase/app')
    const auth = import('firebase/auth')
    const database = import('firebase/database')

    Promise.all([app, auth, database]).then(values => {
      const firebase = getFirebase(values[0])
      this.setState({ firebase })

      // Add firebase to reducers
      const rootReducer = combineReducers({
        firebase: firebaseReducer,
      })
      const initialState = {}
      const store = createStore(rootReducer, initialState)
      this.setState({ store })

      firebase.auth().onAuthStateChanged(user => {
        if (!user) {
          this.setState({ authenticated: false })
        } else {
          this.setState({ authenticated: true })
        }
      })
    })
  }

  render = () => {
    const { firebase, authenticated, store } = this.state
    if (!firebase || !store) return null

    const rrfConfig = {
      userProfile: 'users',
    }

    const rrfProps = {
      firebase,
      config: rrfConfig,
      dispatch: store.dispatch,
    }

    return (
      <ReduxProvider store={store}>
        <ReactReduxFirebaseProvider {...rrfProps}>
          {authenticated ? this.props.children : <SignIn />}
        </ReactReduxFirebaseProvider>
      </ReduxProvider>
    )
  }
}

export default Layout
