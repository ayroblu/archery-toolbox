import React from 'react'
import ReactDOM from 'react-dom'
import createHistory from 'history/createBrowserHistory'
import { Provider } from 'react-redux'
import { BrowserRouter, withRouter } from 'react-router-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { IntlProvider, addLocaleData } from 'react-intl'
import App from './containers/App'
import configureStore from './store'
import localeData from './localeData.json'

it('renders without crashing', () => {
  const div = document.createElement('div')

  const initialState = {}
  const history = createHistory()
  const store = configureStore(initialState, history)
  const language = 'en'
  const messages = localeData['en']

  const Inter = withRouter(props=>{
    return (
      <IntlProvider locale={language} messages={messages}>
        <App />
      </IntlProvider>
    )
  })
  ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter history={history}>
        <MuiThemeProvider>
          <Inter />
        </MuiThemeProvider>
      </BrowserRouter>
    </Provider>
  , div
  )
})

