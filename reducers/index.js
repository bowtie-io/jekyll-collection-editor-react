import * as ActionTypes from '../actions'
import { combineReducers } from 'redux'
import { buildStateObject } from '../schema'
import _ from 'lodash'

const initialState = buildStateObject()

function indicators( state = initialState.indicators , action) {
  switch (action.type) {
    case ActionTypes.RESET:
      return { ...state,
              requests: 0,
              error: null,
              warning: null,
              pendingCommit: false }
    case ActionTypes.REQUEST:
      return { ...state,
                requests: state.requests + 1 }
    case ActionTypes.RESPONSE:
      return { ...state,
                requests: state.requests - 1 }
    case ActionTypes.ERROR:
      return { ...state,
               error: action.payload.message }
    case ActionTypes.WARNING:
      return { ...state,
                warning: action.payload.message }
    case ActionTypes.COMMIT_REQUEST:
      return { ...state,
                pendingCommit: true }
    case ActionTypes.COMMIT_RECEIVE:
    case ActionTypes.COMMIT_ERROR:
      return { ...state,
                pendingCommit: false }
    case ActionTypes.RESET_WARNING_MESSAGE:
      return { ...state,
                warning: null }
    default:
      return state
  }
}

function extension ( state = '.md', action ) {
  switch(action.type) {
    case ActionTypes.EXTENSION_RECEIVE:
      return action.payload.extension
    default:
      return state
  }
}

function fields ( state = [], action ) {
  switch(action.type) {
    case ActionTypes.FIELDS_RECEIVE:
      return action.payload.fields
    default:
      return state
  }
}

function setConfigurationValueWithPathKey(key, value, configuration) {
  // Take the original configuration, create a copy
  // Take the key, split on '.' and either set the value at that key, or
  //    update the existing value
  // a.b.c = value
  // {
  //    a: {
  //      b: {
  //        c: value
  //      }
  //    }
  // }

  var chain = key.split('.')                      // [a, b, c]
  var path = chain.pop()                          // [a, b], c
  var config = { ...configuration }
  var current = config

  chain.forEach(l => {
    current[l] = current[l] || {}
    current = current[l]
  })

  current[path] = value
  return config
}

function appendConfigurationArrayWithPathKey(key, configuration) {
  var chain = key.split('.')
  var path = chain.pop()
  var config = { ...configuration }
  var current = config

  chain.forEach(l => {
    current[l] = current[l] || {}
    current = current[l]
  })

  current[path].push('')
  return config
}

function spliceOneFromConfigurationArrayWithPathKey(key, index, configuration) {
  var chain = key.split('.')
  var path = chain.pop()
  var config = { ...configuration }
  var current = config

  chain.forEach(l => {
    current[l] = current[l] || {}
    current = current[l]
  })

  current[path].splice(index, 1)
  return config
}

function documents( state = initialState.documents , action) {
  switch (action.type) {
    case ActionTypes.DOCUMENTS_RECEIVE:
      return action.documents

    case ActionTypes.DOCUMENT_RECEIVE:
      var { document } = action

      return [...state.filter(d => d.name != document.name),
        document]

    case ActionTypes.DOCUMENT_REMOVE:
      var { name } = action

      return [...state.filter(d => d.name != name),
              ...state.filter(d => (d.name == name && !d.isNew))
                       .map(d => ({ ...d, isRemoved: true }))]

    case ActionTypes.DOCUMENT_UPDATE_BODY:
      var { name, body } = action.payload

      return state.map(d => {
        if(d.name == name) {
          const newContent = { ...d.content, body: body }

          return { ...d, content: newContent,
            isModified: (d.originalName != name || !_.isEqual(newContent, d.originalContent)) }
        } else {
          return d
        }
      })

    case ActionTypes.DOCUMENT_UPDATE_CONFIGURATION:
      var { id, key, value } = action.payload

      return state.map(d => {
        if(d.id == id) {
          const newContent = {
            ...d.content,
            staleContentKey: new Date().toISOString(),
            configuration: setConfigurationValueWithPathKey(key, value, d.content.configuration)
          }

          return { ...d, content: newContent,
                   isModified: (d.originalName != d.name || !_.isEqual(newContent, d.originalContent)) }
        } else {
          return d
        }
      })

    case ActionTypes.DOCUMENT_APPEND_CONFIGURATION_ITEM:
      var { id, key } = action.payload

      return state.map(d => {
        if(d.id == id) {
          const newContent = {
            ...d.content,
            staleContentKey: new Date().toISOString(),
            configuration: appendConfigurationArrayWithPathKey(key, d.content.configuration)
          }

          return { ...d, content: newContent,
                   isModified: (d.originalName != d.name || !_.isEqual(newContent, d.originalContent)) }
        } else {
          return d
        }
      })

    case ActionTypes.DOCUMENT_REMOVE_CONFIGURATION_ITEM:
      var { id, key, index } = action.payload

      return state.map(d => {
        if(d.id == id) {
          const newContent = {
            ...d.content,
            staleContentKey: new Date().toISOString(),
            configuration: spliceOneFromConfigurationArrayWithPathKey(key, index, d.content.configuration)
          }

          return { ...d, content: newContent,
                   isModified: (d.originalName != d.name || !_.isEqual(newContent, d.originalContent)) }
        } else {
          return d
        }
      })

    case ActionTypes.DOCUMENT_UPDATE_NAME:
      var { name, newName } = action.payload

      return state.map(d => {
        if(d.name == name){
          return { ...d, name: newName,
            staleContentKey: new Date().toISOString(),
            isModified: (d.originalName != newName || !_.isEqual(d.content, d.originalContent)) }
        } else {
          return d
        }
      })

    case ActionTypes.DOCUMENT_ADD_UPLOAD:
      var { name, previewURL, position } = action.payload

      return state.map(d => {
        if(d.name == name){
          const newBody = d.content.body.slice(0, position) +
                          `\n![Image](${previewURL})\n` +
                          d.content.body.slice(position)

          return { ...d,
                   staleContentKey: new Date().toISOString(),
                   isModified: true,
                   content: { ...d.content, body: newBody,
                              uploads: [...d.content.uploads, { ...action.payload }] }
                }
        }else{
          return d
        }
      })

    case ActionTypes.RESET_ALL:
      return state.filter(d => !d.isNew)
                  .map(d => ({ ...d,
                               name: d.originalName,
                               staleContentKey: new Date().toISOString(),
                               content: d.originalContent,
                               isModified: false }))

    case ActionTypes.DOCUMENT_RESET:
      var { name } = action

      return state.map(d => {
        if(d.name == name) {
          return { ...d,
            name: d.originalName,
            content: d.originalContent,
            staleContentKey: new Date().toISOString(),
            isModified: false }
        } else {
          return d
        }
      })

    default:
      return state
  }
}

function isStale (state = initialState.isStale, action) {
  switch (action.type) {
    case ActionTypes.DOCUMENTS_RECEIVE:
      return false

    case ActionTypes.COMMIT_RECEIVE:
    case ActionTypes.RESET:
      return true

    default:
      return state
  }
}

function currentDocumentName(state = initialState.currentDocumentName, action){
  switch (action.type) {
    case ActionTypes.DOCUMENT_SELECT:
      return action.payload.name

    default:
      return state
  }
}

function files(state = initialState.files, action){
  switch (action.type) {
    case ActionTypes.RECEIVE_FILE:
      var file = { ...action.payload }
      const existingReference = state.find(f => f.path == file.path) || {}

      return [...state.filter(f => f.path != file.path),
        { ...existingReference, ...file }]

    case ActionTypes.REMOVE_FILE:
      return state.map(f => {
        if(f.path == action.payload.path){
          if(action.payload.referenceCount == 1){
            return null
          }else{
            return f
          }
        }else{
          return f
        }
      }).filter(f => f != null)

    default:
      return state
  }
}

function preferredEditorMode(state = initialState.preferredEditorMode, action){
  switch (action.type) {
    case ActionTypes.ACTIVATE_EDITOR_MODE:
      return action.payload.name

    default:
      return state
  }
}

function bodyEditorSelection(state = initialState.bodyEditorSelection, action){
  switch(action.type) {
    case ActionTypes.DOCUMENT_SELECT:
    case ActionTypes.DOCUMENT_RESET:
      return initialState.bodyEditorSelection
    case ActionTypes.DOCUMENT_UPDATE_BODY_EDITOR_SELECTION:
      return action.payload.bodyEditorSelection || state
    default:
      return state
  }
}

function localReferences(state = initialState.localReferences, action){
  switch(action.type) {
    case ActionTypes.RECEIVE_LOCAL_REFERENCE:
      var newState = { ...state }
      newState[action.payload.path] = action.payload.previewURL
      return newState
    default:
      return state
  }
}

const rootReducer = combineReducers({
    indicators,
    documents,
    isStale,
    extension,
    fields,
    currentDocumentName,
    files,
    preferredEditorMode,
    bodyEditorSelection,
    localReferences
  })

export default rootReducer
