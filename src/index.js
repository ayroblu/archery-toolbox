import React from 'react'
import ReactDOM from 'react-dom'
//import registerServiceWorker from './registerServiceWorker'
import { Provider } from 'react-redux'
import createHistory from 'history/createBrowserHistory'
import { BrowserRouter, withRouter } from 'react-router-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { IntlProvider, addLocaleData } from 'react-intl'
// https://en.wikipedia.org/wiki/ISO_639-1
import en from 'react-intl/locale-data/en'
import es from 'react-intl/locale-data/es'
import fr from 'react-intl/locale-data/fr'
import it from 'react-intl/locale-data/it'
import zh from 'react-intl/locale-data/zh'
import localeData from './localeData.json'

import configureStore from './store'
import './index.css'
import App from './containers/App'
import DevTools from './components/DevTools'
import {isHotReload} from './config'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

// Let the reducers handle initial state
const initialState = {}
const history = createHistory()
const store = configureStore(initialState, history)
const isProduction = process.env.NODE_ENV === 'production'
addLocaleData([...en, ...es, ...fr, ...it, ...zh])

const language = (navigator.languages && navigator.languages[0]) ||
  navigator.language || navigator.userLanguage

// Split locales with a region code
const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0]

// Try full locale, fallback to locale without region code, fallback to en
const messages = localeData[languageWithoutRegionCode] || localeData[language] || localeData.en



const render = Container=>{
  // Need to pass history in order for app rerender to occur if route change as a result of IntlProvider - see redux for similar issue
  const Inter = withRouter(props=>{
    return (
      <IntlProvider locale={language} messages={messages}>
        <Container />
      </IntlProvider>
    )
  })
  ReactDOM.render(
    <Provider store={store}>
      <div>
        <BrowserRouter history={history}>
          <MuiThemeProvider>
            <Inter />
          </MuiThemeProvider>
        </BrowserRouter>
        {!isProduction && <DevTools />}
      </div>
    </Provider>
  , document.getElementById('root')
  )
}
if (!window.intl) {
  require.ensure([
    'intl',
    'intl/locale-data/jsonp/en.js',
    'intl/locale-data/jsonp/es.js',
    'intl/locale-data/jsonp/fr.js',
    'intl/locale-data/jsonp/it.js',
    'intl/locale-data/jsonp/zh.js',
  ], (require) => {
    require('intl');
    require('intl/locale-data/jsonp/en.js')
    require('intl/locale-data/jsonp/es.js')
    require('intl/locale-data/jsonp/fr.js')
    require('intl/locale-data/jsonp/it.js')
    require('intl/locale-data/jsonp/zh.js')
    render(App)
  })
} else {
  render(App)
}

if (isHotReload && module.hot) {
  module.hot.accept('./containers/App', () => {
    console.clear()
    const NewApp = require('./containers/App').default
    render(NewApp)
  })
}

//registerServiceWorker()
