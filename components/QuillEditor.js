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

var ReactQuill = require("react-quill");

class QuillEditor extends Component {
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



  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.staleKey != this.props.staleKey
  }
  componentDidMount() {
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
    var editorText = "hello World";
    var toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction

      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean']                                         // remove formatting button
    ];

    return (
      <ReactQuill theme="snow" value={{this.props.body}}>
      <ReactQuill.Toolbar key="toolbar"
          ref="toolbar"
          items={ReactQuill.Toolbar.toolbarOptions} />
        <div key="editor"
          ref="editor"
          className="quill-contents" 
          />
      </ReactQuill>
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
  QuillEditor,
  updateDocumentBody,
  updateBodyEditorSelection,
  addUploadToDocument,
})(QuillEditor)
