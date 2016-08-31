import 'whatwg-fetch';
import yaml from 'js-yaml'

import { buildDocumentObject } from '../schema'
import { currentDocumentSelector, visibleDocumentsSelector } from '../selectors/documents'
import { getFileReferenceMap } from '../selectors/files'

import parseYamlFrontMatter from 'front-matter'

import NotFoundImage from '../images/not-found.png'

if(!window.collection_editor){
  throw Error("window.collection_editor with api_key, collection and api_root required!")
}

const API_ROOT = window.collection_editor.api_root
const API_KEY = window.collection_editor.api_key
const COLLECTION_TYPE = window.collection_editor.collection

export const REQUEST = 'REQUEST'
export const RESPONSE = 'RESPONSE'
export const ERROR = 'ERROR'
export const WARNING = 'WARNING'
export const RESET_WARNING_MESSAGE = 'RESET_WARNING_MESSAGE'
export const RESET = 'RESET'

function deepCopy(object, destination={}) {
  if(typeof(object) == 'object'){
    Object.keys(object).forEach(key => {
      const value = object[key]

      if(value && value.constructor === Array){
        destination[key] = value.map(item => deepCopy(item))
      }else if(value && typeof(value) == 'object'){
        destination[key] = { }
        deepCopy(value, destination[key])
      }else{
        destination[key] = value
      }
    })

    return destination
  }else{
    return object
  }
}

function requestAction(payload = {}) {
  return {
    type: REQUEST,
    payload: payload
  }
}

function responseAction(payload = {}) {
  return {
    type: RESPONSE,
    payload: payload
  }
}

function errorAction(message) {
  return {
    type: ERROR,
    payload: {
      message: message
    }
  }
}

function warningAction(message) {
  return {
    type: WARNING,
    payload: {
      message: message
    }
  }
}

export function reset() {
  return {
    type: RESET,
    payload: { }
  }
}

export function resetWarningMessage() {
  return {
    type: RESET_WARNING_MESSAGE
  }
}

// state needs documents
export const DOCUMENTS_LOAD = 'DOCUMENTS_LOAD'

// HTTP call made to documents
export const DOCUMENTS_REQUEST = 'DOCUMENTS_REQUEST'

// HTTP call returned with documents, state should receive documents
export const DOCUMENTS_RECEIVE = 'DOCUMENTS_RECEIVE'

// HTTP call returned with failure
export const DOCUMENTS_FAILURE = 'DOCUMENTS_FAILURE'

function fetchIndicatorFilter(dispatch, resource, options = {}){
  dispatch(requestAction({ resource: resource }))

  return function(response){
    if(response.status >= 200 && response.status < 300 || response.status == 404){
      dispatch(responseAction({ resource: resource }))
      return response
    }

    throw Error(`${response.status}: ${response.url}`)
  }
}

function fetchJsonFilter(response){
  return response.json()
}

export function loadData(){
  return (dispatch, getState) => {
    loadConfiguration()(dispatch, getState).then(() => {
      loadDocuments()(dispatch, getState).then(() => {
        const state = getState()
        const visibleDocuments = visibleDocumentsSelector(state).documents

        if(visibleDocuments.length == 0){
          dispatch(newDocument())
        }
      })
    })
  }
}

function loadDocuments(){
  return (dispatch, getState) => {
    const authorization = `Basic ${btoa(`${API_KEY}:`)}`
    return new Promise((resolve, reject) => {
      fetch(`${API_ROOT}/projects/_/contents/${COLLECTION_TYPE}`,
          { headers: { 'Authorization': authorization } })
        .then(fetchIndicatorFilter(dispatch, COLLECTION_TYPE))
        .then(response => {
          if(response.status != 404){
            response.json().then(json => {
              dispatch(receiveDocuments(json))
              resolve()
            })
          }else{
            dispatch(receiveDocuments([]))
            resolve()
          }
        }).catch(e => {
          dispatch(warningAction(e.message))
          reject(e)
        })
    })
  }
}

function receiveDocuments(directory){
  return {
    type: DOCUMENTS_RECEIVE,
    documents: directory.filter(entry => entry.type == 'file')
                        .map(entry => {
                          const { name, sha } = entry
                          return buildDocumentObject({ name, sha })
                        })
  }
}

export const CONFIGURATION_REQUEST = 'CONFIGURATION_REQUEST'
export const FIELDS_RECEIVE        = 'FIELDS_RECEIVE'
export const EXTENSION_RECEIVE     = 'EXTENSION_RECEIVE'
export const CONFIGURATION_FAILURE = 'CONFIGURATION_FAILURE'

function requestConfiguration(){
  return {
    type: CONFIGURATION_REQUEST
  }
}

function receiveExtension(extension){
  return {
    type: EXTENSION_RECEIVE,
    payload: { extension: extension }
  }
}

function receiveFields(fields){
  return {
    type: FIELDS_RECEIVE,
    payload: { fields: fields }
  }
}

function loadConfiguration(){
  // TODO: for simplicity here I re-do the listing
  // request and find the configuration name. Since this list is already
  // populated with #loadDocuments, we should probably use it. The request
  // is probably cached though, so maybe it doesn't make that much difference ;)
  return (dispatch, state) => {
    const authorization = `Basic ${btoa(`${API_KEY}:`)}`

    return new Promise((resolve, reject) => {
      fetch(`${API_ROOT}/projects/_/contents/${COLLECTION_TYPE}`,
          { headers: { 'Authorization': authorization } })
        .then(fetchIndicatorFilter(dispatch, '/configuration'))
        .then(response => {
          if(response.status == 404){
            dispatch(activateBodyEditor())
            dispatch(receiveExtension('.md'))
            dispatch(receiveFields({}))
            resolve()
            return
          }

          response.json().then(json => {
            var fieldsFiles = json.filter(entry => (entry.type == 'file' && entry.name.match(/_fields\./))),
              fieldsFile = null;

            if(fieldsFiles.length > 1){
              dispatch({ type: CONFIGURATION_FAILURE, error: "Can't have more than one _fields file!" })
            }else{
              fieldsFile = fieldsFiles[0]
            }

            if(fieldsFile == null){
              // These are already the default field state, just expressing them explicitly
              dispatch(activateBodyEditor())
              dispatch(receiveExtension('.md'))
              dispatch(receiveFields({}))
              resolve()
              return
            }

            const extension = '.' + fieldsFile.name.split('.').slice(-1)[0];
            dispatch(receiveExtension(extension))

            // Get the contents of the _fields file
            fetch(`${API_ROOT}/projects/_/contents/${COLLECTION_TYPE}/${fieldsFile.name}`,
                { headers: { 'Authorization': authorization } })
              .then(fetchIndicatorFilter(dispatch, '/fields'))
              .then(fetchJsonFilter)
              .then(json => {
                const content = window.decodeURIComponent(window.escape(window.atob(json.content.replace(/\s/g, ''))));
                const front = parseYamlFrontMatter(content)
                front.body = front.body.trim()
                dispatch(receiveFields(front))
                resolve()
              }).catch(e => {
                dispatch(warningAction(e.message))
                reject(e)
              })
          })
        }).catch(e => {
          dispatch(warningAction(e.message))
          reject(e)
        })
    })
  }
}

export function newDocument() {
  // TODO: This should emit an object that we can easily serialize, non?
  return (dispatch, getState) => {
    const state = getState()

    const document = buildDocumentObject({
      isNew: true,
      content: {
        body: state.fields ? (state.fields.body || '') : '',
        configuration: state.fields ? (state.fields.attributes || {}) : {},
        uploads: []
      }
    }, state.extension)

    const existingDocument = state.documents.find(d => d.name == document.name)

    if(existingDocument){
      dispatch(warningAction("Document by same name exists..."))
      dispatch(selectDocument(existingDocument))
    }else{
      dispatch(receiveDocument(document))
      dispatch(selectDocument(document))
    }
  }
}

export const DOCUMENT_REQUEST                      = 'DOCUMENT_REQUEST'
export const DOCUMENT_FAILURE                      = 'DOCUMENT_FAILURE'
export const DOCUMENT_RECEIVE                      = 'DOCUMENT_RECEIVE'
export const DOCUMENT_UPDATE_BODY                  = 'DOCUMENT_UPDATE_BODY'
export const DOCUMENT_UPDATE_CONFIGURATION         = 'DOCUMENT_UPDATE_CONFIGURATION'
export const DOCUMENT_APPEND_CONFIGURATION_ITEM    = 'DOCUMENT_APPEND_CONFIGURATION_ITEM'
export const DOCUMENT_REMOVE_CONFIGURATION_ITEM    = 'DOCUMENT_REMOVE_CONFIGURATION_ITEM'
export const DOCUMENT_ADD_UPLOAD                   = 'DOCUMENT_ADD_UPLOAD'
export const DOCUMENT_UPDATE_NAME                  = 'DOCUMENT_UPDATE_NAME'
export const DOCUMENT_RESET                        = 'DOCUMENT_RESET'
export const DOCUMENT_REMOVE                       = 'DOCUMENT_REMOVE'
export const DOCUMENT_UPDATE_BODY_EDITOR_SELECTION = 'DOCUMENT_UPDATE_BODY_EDITOR_SELECTION'

function parseContent(name, content){
  // Returns the content configuration and body
  // https://developer.mozilla.org/en-US/docs/Web/API/window.btoa#Unicode_Strings
  content = window.decodeURIComponent(window.escape(window.atob(content.replace(/\s/g, ''))));

  const front = parseYamlFrontMatter(content)

  return {
    body: front.body.trim(),
    configuration: front.attributes,
    uploads: []
  }
}

function dumpContent(name, content){
  // https://developer.mozilla.org/en-US/docs/Web/API/window.btoa#Unicode_Strings

  const configuration = content.configuration || {}
  const body = content.body || ''

  const front = yaml.safeDump(configuration)
  const newContent = (Object.keys(configuration).length > 0) ? "---\n" + front + "\n---\n" + body : body

  return window.btoa(window.unescape(window.encodeURIComponent(newContent)));
}

export function loadDocument(document) {
  return (dispatch, state) => {
    const { name } = document
    const authorization = `Basic ${btoa(`${API_KEY}:`)}`

    fetch(`${API_ROOT}/projects/_/contents/${COLLECTION_TYPE}/${name}`,
        { headers: { 'Authorization': authorization } })
      .then(fetchIndicatorFilter(dispatch, '/document/' + document.id))
      .then(fetchJsonFilter)
      .then(json => {
        dispatch(receiveDocument(buildDocumentObject({
          id: document.id,
          name: name,
          sha: json.sha,
          content: parseContent(name, json.content),
          originalName: json.name,
          originalContent: parseContent(name, json.content),
          isNew: false,
          isModified: false,
          isRemoved: false
        })))
      }).catch(e => dispatch(warningAction(e.message)))
  }
}

function requestDocument(name) {
  return {
    type: DOCUMENT_REQUEST,
    name: name
  }
}

function receiveDocument(document) {
  return (dispatch, state) => {
    dispatch(processLocalReferences(document))

    dispatch({
      type: DOCUMENT_RECEIVE,
      document: document
    })
  }
}

export const DOCUMENT_SELECT = 'DOCUMENT_SELECT'

export function selectDocument(document) {
  return (dispatch, state) => {
    dispatch({
      type: DOCUMENT_SELECT,
      payload: {
        name: document.name
      }
    })

    if(!document.isNew && document.content == null) {
      loadDocument(document)(dispatch, state)
    }
  }
}

export function updateDocumentBody(document, body) {
  return (dispatch, state) => {
    dispatch(processLocalReferences(document))

    dispatch({
      type: DOCUMENT_UPDATE_BODY,
      payload: {
        name: document.name,
        body
      },
      meta: {
        debounce: {
          time: 200
        }
      }
    })
  }
}

export function updateBodyEditorSelection(bodyEditorSelection){
  return {
    type: DOCUMENT_UPDATE_BODY_EDITOR_SELECTION,
    payload: {
      bodyEditorSelection
    },
    meta: {
      debounce: {
        time: 500
      }
    }
  }
}

export function updateDocumentConfiguration(id, key, value) {
  return {
    type: DOCUMENT_UPDATE_CONFIGURATION,
    payload: { id, key, value }
  }
}

export function appendDocumentConfigurationItem(id, key) {
  return {
    type: DOCUMENT_APPEND_CONFIGURATION_ITEM,
    payload: { id, key }
  }
}

export function removeDocumentConfigurationItem(id, key, index) {
  return {
    type: DOCUMENT_REMOVE_CONFIGURATION_ITEM,
    payload: { id, key, index }
  }
}

export function updateDocumentName(document, newName) {
  return (dispatch, getState) => {
    const state = getState()

    const extension = state.extension

    if(!newName.endsWith(extension)){
      return
    }

    if(!newName.match(/^[A-Za-z0-9_-]+\..*/)){
      return
    }

    const existingDocument = state.documents.find(d => d.name == newName)

    if(existingDocument){
      dispatch(warningAction("Document by same name exists..."))
      return
    }

    dispatch({
      type: DOCUMENT_UPDATE_NAME,
      payload: {
        name: document.name,
        newName
      }
    })

    dispatch({
      type: DOCUMENT_SELECT,
      payload: {
        name: newName
      }
    })
  }
}

export function addUploadToDocument(document, file) {
  return (dispatch, getState) => {
    const position = getState().bodyEditorSelection.index
    const base64Reader = new FileReader()

    base64Reader.addEventListener('load', function(){
      const base64 = base64Reader.result.replace(/data:.*?base64,/, '')
      const key = Math.random().toString(36).substring(7)

      const destination_path = `/uploads/${document.name}/${key}-${file.name}`

      dispatch({
        type: DOCUMENT_ADD_UPLOAD,
        payload: {
          path: destination_path,
          type: file.type,
          base64: base64,
          name: document.name,
          previewURL: window.URL.createObjectURL(file),
          position: position
        }
      })
    })

    base64Reader.readAsDataURL(file)
  }
}
export function loadImage(document, file) {
  return (dispatch, getState) => {
    const base64Reader = new FileReader();

    const promise = new Promise((resolve, reject)=> {
      base64Reader.addEventListener('load', resolve)
    })
        .then(()=> {
          const base64 = base64Reader.result.replace(/data:.*?base64,/, '')
          const key = Math.random().toString(36).substring(7)
          const destination_path = `/uploads/${document.name}/${key}-${file.name}`
          dispatch({
            type: DOCUMENT_ADD_UPLOAD,
            payload: {
              path: destination_path,
              type: file.type,
              base64: base64,
              name: document.name,
              previewURL: window.URL.createObjectURL(file),
              //position: position
            }
          })
        })
    base64Reader.readAsDataURL(file);
    return promise;
   }
}
export const RESET_ALL = 'RESET_ALL'

export function resetAll() {
  return (dispatch, getState) => {
    const state = getState()
    const { currentDocument } = currentDocumentSelector(state)
    const { originalName } = currentDocument

    dispatch({
      type: RESET_ALL
    })

    dispatch({
      type: DOCUMENT_SELECT,
      payload: {
        name: originalName
      }
    })
  }
}

export function resetDocument() {
  return (dispatch, getState) => {
    const state = getState()
    const { currentDocument } = currentDocumentSelector(state)
    const { originalName } = currentDocument

    dispatch({
      type: DOCUMENT_RESET,
      name: currentDocument.name
    })

    dispatch({
      type: DOCUMENT_SELECT,
      payload: {
        name: originalName
      }
    })
  }
}

export function removeDocument(document) {
  return (dispatch, getState) => {
    dispatch({
      type: DOCUMENT_REMOVE,
      name: document.name
    })
  }
}

export const COMMIT         = 'COMMIT'
export const COMMIT_REQUEST = 'COMMIT_REQUEST'
export const COMMIT_ERROR   = 'COMMIT_ERROR'
export const COMMIT_RECEIVE = 'COMMIT_RECEIVE'

export function commit(  ) {
  return (dispatch, state) => {
    /**
     * Process upload references in the document content
     *
     * For every upload in document.uploads, find references to
     * the upload within the document content body. Replace these
     * references with the path to the file that will exist
     * after the file is uploaded:
     *
     *    ![Image](blob:http%3A//localhost%3A3000/e98dfc27-9345-4f79-a604-0e9fb73c7da2)
     *
     * would become
     *
     *    ![Image](/uploads/{document-name}/{file-name})
     *
     * If an upload reference is not found in the document body, then
     * the upload reference will be removed from the document to prevent
     * pushing unnecessary files.
     *
     * returns: new document object
     *
     */
    function processDocumentUploads(document) {
      if(!document || !document.content) {
        return
      }

      var { body } = document.content

      const uploads = document.content.uploads.map(upload => {
        const newBody = body.split(upload.previewURL).join(upload.path)

        if(newBody == body){ return null }
        body = newBody

        return upload
      }).filter(upload => upload != null)

      return { ...document,
               content: { ...document.content,
                          uploads, body } }
    }

    const authorization = `Basic ${btoa(`${API_KEY}:`)}`
    const message = 'Collection Update'

    const { files } = state()
    const documents = state().documents.map(d => processDocumentUploads(d)).filter(d => d != null)

    const updateDocumentContent = (document) => {
      const { name, content, sha } = document

      return fetch(`${API_ROOT}/projects/_/contents/${COLLECTION_TYPE}/${name}`, {
        method: 'put',
        headers: { 'Authorization': authorization,
                    'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          content: dumpContent(name, content),
          sha: sha,
          build: false
        })
      }).then(fetchIndicatorFilter(dispatch, `/_updateDocumentContent/${name}`))
        .catch(e => dispatch(errorAction(e.message)))
    }

    const createDocument = (document) => {
      const { name, content } = document

      return fetch(`${API_ROOT}/projects/_/contents/${COLLECTION_TYPE}/${name}`, {
        method: 'put',
        headers: { 'Authorization': authorization,
                    'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          content: dumpContent(name, content),
          build: false
        })
      }).then(fetchIndicatorFilter(dispatch, `/_createDocument/${name}`))
        .catch(e => dispatch(errorAction(e.message)))
    }

    const deleteDocument = (document) => {
      const { originalName, content, sha } = document

      return fetch(`${API_ROOT}/projects/_/contents/${COLLECTION_TYPE}/${originalName}`, {
        method: 'delete',
        headers: { 'Authorization': authorization,
                    'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          sha: sha,
          build: false
        })
      }).then(fetchIndicatorFilter(dispatch, `/_deleteDocument/${originalName}`))
        .catch(e => dispatch(errorAction(e.message)))

    }

    const renameDocument = (document) => {
      const { name, originalName, content, sha } = document

      // delete original, create new

      return fetch(`${API_ROOT}/projects/_/contents/${COLLECTION_TYPE}/${originalName}`, {
        method: 'delete',
        headers: { 'Authorization': authorization,
                    'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          sha: sha })
        })
        .then(fetchIndicatorFilter(dispatch, `/_renameDocument/delete/${originalName}`))
        .then(() => {
          fetch(`${API_ROOT}/projects/_/contents/${COLLECTION_TYPE}/${name}`, {
            method: 'put',
            headers: { 'Authorization': authorization,
                        'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: message,
              content: dumpContent(name, content)
            })
          })
          .then(fetchIndicatorFilter(dispatch, `/_renameDocument/put/${name}`))
          .catch(e => dispatch(errorAction(e.message)))
        })
        .catch(e => dispatch(errorAction(e.message)))
    }

    const createFile = (file) => {
      const { path, base64 } = file

      return fetch(`${API_ROOT}/projects/_/contents/${path}`, {
        method: 'put',
        headers: { 'Authorization': authorization,
                    'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          content: base64
        })
      }).then(fetchIndicatorFilter(dispatch, `/_createFile/${path}`))
        .catch(e => dispatch(errorAction(e.message)))
    }

    const updateFile = (file) => {
      const { path, base64, sha } = file

      return fetch(`${API_ROOT}/projects/_/contents/${path}`, {
        method: 'put',
        headers: { 'Authorization': authorization,
                    'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          content: base64,
          sha: sha
        })
      }).then(fetchIndicatorFilter(dispatch, `/_updateFile/${path}`))
        .catch(e => dispatch(errorAction(e.message)))
    }

    const build = () => {
      return fetch(`${API_ROOT}/projects/_/builds`, {
        method: 'post',
        headers: { 'Authorization': authorization,
                    'Content-Type': 'application/json' }})
        .then(fetchIndicatorFilter(dispatch, `/_build`))
        .catch(e => dispatch(errorAction(e.message)))
    }

    var uploads = []

    documents.forEach(d => {
      d.content.uploads.forEach(u => {
        uploads.push(u)
      })
    })

    const updates = [
      ...documents.map(d => {
        if(d.isNew){
          return () => createDocument(d)
        }else if(d.isRemoved){
          return () => deleteDocument(d)
        }else if(d.isModified){
          if(d.name == d.originalName){
            return () => updateDocumentContent(d)
          }else{
            return () => renameDocument(d)
          }
        }
      }),
      ...uploads.map(u => {
        return () => createFile(u)
      }),
      ...files.map(f => {
        if(f.onRemote && f.isModified){
          return () => updateFile(f)
        }else if(f.isNew){
          return () => createFile(f)
        }
      })
    ]

    dispatch({ type: COMMIT_REQUEST })

    updates.reduce((p, n) => {
      return new Promise((resolve, reject) => {
        p.then(resolve)
      }).then(n)
    }, Promise.resolve()).then(() => {
      build().then(() => {
        dispatch({ type: COMMIT_RECEIVE })
      }, () => {
        dispatch({ type: COMMIT_ERROR, phase: 'build' })
      })
    }, () => {
      dispatch({ type: COMMIT_ERROR, phase: 'commit' })
    })
  }
}

export const RECEIVE_FILE = 'RECEIVE_FILE'
export const RECEIVE_FILE_DETAILS_FROM_REMOTE = 'RECEIVE_FILE_DETAILS_FROM_REMOTE'
export const REMOVE_FILE  = 'REMOVE_FILE'

export function removeFile(path) {
  return (dispatch, getState) => {
    const fileReferenceMap = getFileReferenceMap(getState())

    dispatch({
      type: REMOVE_FILE,
      payload: {
        path: path,
        referenceCount: fileReferenceMap[path]
      }
    })
  }
}

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data.replace(/\s/g, ''));
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

export function loadFile(path) {
  return (dispatch, state) => {
    const authorization = `Basic ${btoa(`${API_KEY}:`)}`

    // If we already have a file with this name, we'll replace the
    // original, but we need the sha
    fetch(`${API_ROOT}/projects/_/contents${path}`,
        { headers: { 'Authorization': authorization } })
      .then(fetchIndicatorFilter(dispatch, '/loadFile/' + path, { ignoreErrors: true }))
      .then(fetchJsonFilter)
      .then(json => {
        const isImage = path.match(/.+\.(jpg|jpeg|png|bmp|gif)$/)
        const imageExtension = isImage ? isImage[1] : null
        const type = isImage ? `image/${imageExtension}` : 'application/octet-stream'

        if(json.sha){
          var blob = b64toBlob(json.content, type, 512)
          window.URL = window.URL || window.webkitURL

          var action = {
            type: RECEIVE_FILE,
            payload: {
              path: path,
              type: type,
              sha: json.sha,
              onRemote: true,
              previewURL: window.URL.createObjectURL(blob) // TODO revoke object url
            }
          }

          dispatch(action)

        }else{
          // File didn't exist on remote...

          var action = {
            type: RECEIVE_FILE,
            payload: {
              path: path,
              type: type,
              onRemote: false,
              notFound: true
            }
          }

          dispatch(action)
        }
      }).catch(e => dispatch(warningAction(e.message)))
  }
}

export function addFileObject(file) {
  return (dispatch, state) => {
    var destination_dir = '';

    if(file.type.startsWith('image/')){
      destination_dir = '/images'
    }else if(file.type.startsWith('video/')){
      destination_dir = '/videos'
    }else if(file.type.startsWith('audio/')){
      destination_dir = '/audio'
    }else{
      destination_dir = '/files'
    }

    const file_ext = (file.name.indexOf('.') != -1) ? file.name.split('.').pop() : null
    const file_name = file_ext ? file.name.substr(0, file.name.length - (file_ext.length + 1)) : file.name

    const destination_name = [file_name.replace(/[^a-z0-9_\-]/gi, '-'), file_ext].filter((v) => !!v).join('.')
    const destination_path = [destination_dir, destination_name].join('/')

    var action = {
      type: RECEIVE_FILE,
      payload: {
        path: destination_path,
        type: file.type,
        isNew: true,
        isModified: true,
        onRemote: false,            // This will be updated by the loadFile method
        sha: null,                  // ^
        previewURL: null
      }
    }

    const readBase64 = new Promise(function(resolve, reject){
      const base64Reader = new FileReader()

      base64Reader.addEventListener('load', function(){
        action.payload.base64 = base64Reader.result.replace(/data:.*?base64,/, '')
        resolve()
      })

      base64Reader.readAsDataURL(file)
    })

    const readPreview = new Promise(function(resolve, reject){
      if(file.type.startsWith('image/')) {
        const previewReader = new FileReader()

        previewReader.addEventListener('load', function(){
          action.payload.previewURL = previewReader.result
          resolve()
        })

        previewReader.readAsDataURL(file)
      }else{
        resolve()
      }
    })

    Promise.all([readBase64, readPreview]).
      then(() => dispatch(action))

    return action
  }
}

/**
 * Ensure that a file is valid and can be added to `files`.
 *
 * Returns null if no errors are encountered, or a string
 * containing an error message if there is a problem */
function validateFileObject(fileObject){
  if(fileObject.size > 1024 * 1024 * 20){
    return "File must be smaller than 20MB"
  }

  return null;
}

export function replaceFile(oldPath, fileObject){
  return (dispatch, state) => {
    const error = validateFileObject(fileObject);

    if(error){
      dispatch(warningAction(error))
      return
    }

    dispatch(removeFile(oldPath))

    return dispatch(addFileObject(fileObject))
  }
}

export const ACTIVATE_EDITOR_MODE = 'ACTIVATE_EDITOR_MODE';

export function activateBodyEditor(){
  return (dispatch, state) => {
    dispatch({
      type: ACTIVATE_EDITOR_MODE,
      payload: {
        name: 'body'
      }
    })
  }
}

export function activateConfigurationEditor(){
  return (dispatch, state) => {
    dispatch({
      type: ACTIVATE_EDITOR_MODE,
      payload: {
        name: 'configuration'
      }
    })
  }
}


export function duplicateDocument(){
  return (dispatch, getState) => {
    const state = getState()

    const { extension }       = state
    const { currentDocument } = currentDocumentSelector(state)

    const name = currentDocument.name.replace('-copy', '')
                                     .replace(extension, `-copy${extension}`)

    const document = buildDocumentObject({
      isNew: true,
      content: deepCopy(currentDocument.content),
      name: name
    }, extension)

    const existingDocument = state.documents.find(d => d.name == document.name)

    if(existingDocument){
      dispatch(warningAction("Document by same name exists..."))
      dispatch(selectDocument(existingDocument))
    }else{
      dispatch(receiveDocument(document))
      dispatch(selectDocument(document))
    }
  }
}

export const RECEIVE_LOCAL_REFERENCE = 'RECEIVE_LOCAL_REFERENCE';

/**
 * Given a document body, scan for references we may need to display for
 * a local preview, and request a local reference for each one.
 *
 * This is generally the case for images that are embedded in the document body
 */
function processLocalReferences(document) {
  function requestLocalReference(path) {
    return (dispatch, state) => {
      const authorization = `Basic ${btoa(`${API_KEY}:`)}`

      fetch(`${API_ROOT}/projects/_/contents${path}`,
        { headers: { 'Authorization': authorization } })
        .then(fetchIndicatorFilter(dispatch, '/loadFile/' + path, { ignoreErrors: true }))
        .then(fetchJsonFilter)
        .then(json => {
          if(json.message == 'Not Found'){
            dispatch({
              type: RECEIVE_LOCAL_REFERENCE,
              payload: {
                path: path,
                previewURL: NotFoundImage
              }
            })

            return
          }

          const isImage = path.match(/.+\.(jpg|jpeg|png|bmp|gif)$/)
          const imageExtension = isImage ? isImage[1] : null
          const type = isImage ? `image/${imageExtension}` : 'application/octet-stream'

          window.URL = window.URL || window.webkitURL

          const blob = b64toBlob(json.content, type, 512)

          dispatch({
            type: RECEIVE_LOCAL_REFERENCE,
            payload: {
              path: path,
              previewURL: window.URL.createObjectURL(blob) // TODO revoke object url
            }
          })
        })
    }
  }

  return (dispatch, getState) => {
    const { body } = document.content
    const { localReferences } = getState()
    const referencePattern = /(\[.*?\])\((\/.*?)\)/g

    var match;

    while ((match = referencePattern.exec(body)) !== null) {
      if(!localReferences[match[2]]){
        dispatch(requestLocalReference(match[2]))
      }
    }
  }
}

