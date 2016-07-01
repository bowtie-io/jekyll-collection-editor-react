import 'babel-polyfill'
import React from 'react'
import './style/codemirror.scss'
import { render } from 'react-dom'
import Root from 'root'
import configureStore from 'configureStore'

const store = configureStore()

render(
  <Root store={store} />,
  document.getElementById('root')
)
