import React, { Component, PropTypes } from 'react'
import CodeMirror from 'codemirror'
import { connect } from 'react-redux'
import { updateDocumentBody, updateBodyEditorSelection, addUploadToDocument } from '../actions'
import { currentDocumentSelector } from '../selectors/documents'
import DropArea from './DropArea'

import 'codemirror/mode/xml/xml'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/gfm/gfm'

class DocumentBodyEditor extends Component {
  constructor(props) {
    super(props)

    this.handleFocus = this.handleFocus.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.syncBodyEditorState = this.syncBodyEditorState.bind(this)
    this.handleCursorActivity = this.handleCursorActivity.bind(this)
  }

  handleFocus(e) {
    if(this.props.onFocus){
      this.props.onFocus(e)
    }
  }

  handleBlur(e) {
    if(this.props.onBlur){
      this.props.onBlur(e)
    }
  }

  handleChange(doc, change) {
    const { document } = this.props
    const { content }  = document
    const { body }     = content

    const newBody = doc.getValue()

    if(body != newBody){
      this.props.updateDocumentBody(document, newBody)
    }
  }

  handleCursorActivity(doc, change){
    const { document, bodyEditorSelection } = this.props

    const newBodyEditorSelection = {
      anchor: doc.getCursor('anchor'),
      head: doc.getCursor('head'),
      index: doc.indexFromPos(doc.getCursor('head'))
    }

    if(!(bodyEditorSelection.anchor.ch == newBodyEditorSelection.anchor.ch) ||
        !(bodyEditorSelection.anchor.line == newBodyEditorSelection.anchor.line) ||
        !(bodyEditorSelection.head.ch == newBodyEditorSelection.head.ch) ||
        !(bodyEditorSelection.head.line == newBodyEditorSelection.head.ch)){
      this.props.updateBodyEditorSelection(newBodyEditorSelection)
    }
  }

  handleDropZoneActivation() {
    this.setState({ dropZoneActivated: true })
  }

  handleDropZoneDeactivation(){
    this.setState({ dropZoneActivated: false })
  }

  componentDidMount() {
    const codeMirror = CodeMirror.fromTextArea(this._textarea, {
      mode: 'gfm',
      lineNumbers: false,
      lineWrapping: true,
      matchBrackets: true,
      theme: 'default',
      dragDrop: false
    })

    codeMirror.on('focus', this.handleFocus)
    codeMirror.on('blur', this.handleBlur)
    codeMirror.on('cursorActivity', this.handleCursorActivity)
    codeMirror.on('change', this.handleChange)
    codeMirror.on('dragEnter', this.handleDropZoneActivation.bind(this))
    codeMirror.on('dragLeave', this.handleDropZoneDeactivation.bind(this))

    this.setState({ codeMirror: codeMirror })

    this.syncBodyEditorState(codeMirror)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.staleKey != this.props.staleKey
  }

  syncBodyEditorState(codeMirror=null) {
    codeMirror = codeMirror ? codeMirror : (this.state ? this.state.codeMirror : null)

    if(codeMirror){
      codeMirror.setValue(this.props.body || '')
      codeMirror.focus()

      codeMirror.setSelection(
        this.props.bodyEditorSelection.anchor,
        this.props.bodyEditorSelection.head)
    }
  }

  render() {
    this.syncBodyEditorState()
    this.state = this.state || {}

    return (
      <div>
        <DropArea activated={this.state.dropZoneActivated}>
          <textarea ref={(c) => this._textarea = c} />
        </DropArea>
      </div>
    )
  }
}

function mapStateToProperties(state) {
  const currentDocument = currentDocumentSelector(state).currentDocument

  return {
    document: currentDocument,
    bodyEditorSelection: state.bodyEditorSelection,
    body: currentDocument.content.body
  }
}

export default connect(mapStateToProperties, {
  updateDocumentBody,
  updateBodyEditorSelection,
  addUploadToDocument,
})(DocumentBodyEditor)
