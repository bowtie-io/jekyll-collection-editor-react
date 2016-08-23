import 'babel-polyfill'
import React from 'react'
import './style/codemirror.scss'
import { render } from 'react-dom'
require('font-awesome/css/font-awesome.css');
require('summernote/dist/summernote.css');
require('summernote');

import Root from 'root'
import configureStore from 'configureStore'

const store = configureStore()

render(
  <Root store={store} />,
  document.getElementById('root')
)
