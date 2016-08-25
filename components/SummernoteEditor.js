import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import convert from 'convert-rich-text'
import CodeMirror from 'codemirror'
import Summernote from 'summernote'
import ReactSummernote from "react-summernote"
import { connect } from 'react-redux'
import { updateDocumentBody, updateBodyEditorSelection, addUploadToDocument } from '../actions'
import { currentDocumentSelector } from '../selectors/documents'
import DropArea from './DropArea'

import 'codemirror/mode/xml/xml'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/gfm/gfm'


class SummernoteEditor extends Component {
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

  handleChange(contents, $editable) {
    const { document } = this.props
    const { content }  = document
    const { body }     = content
    var  editor        = this.refs.summer
    var newBody        = contents
    console.log(contents);


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
    return (
<ReactSummernote
                value={this.props.body}
                options={{
                    height: 750,
                    dialogsInBody: true,
                    toolbar: [
                        ["style", ["style"]],
                        ["font", ["bold", "underline", "clear"]],
                        ["fontname", ["fontname"]],
                        ["para", ["ul", "ol", "paragraph"]],
                        ["table", ["table"]],
                        ["insert", ["link", "picture", "video"]],
                        ["view", ["codeview"]]
                    ]
                }}
                onChange={this.handleChange}
            />
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
  SummernoteEditor,
  updateDocumentBody,
  updateBodyEditorSelection,
  addUploadToDocument,
})(SummernoteEditor)