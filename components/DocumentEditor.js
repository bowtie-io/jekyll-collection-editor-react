import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { currentDocumentSelector } from '../selectors/documents'
import { editorModeSelector } from '../selectors/editorMode'
import DocumentConfigurationEditor from './DocumentConfigurationEditor.js'
import DocumentBodyEditor from './DocumentBodyEditor.js'
import BodyAndConfigurationEditorContainer from './BodyAndConfigurationEditorContainer.js'
import BodyEditorContainer from './BodyEditorContainer.js'
import EditorContainerFooter from './EditorContainerFooter.js'

class DocumentEditor extends Component {
  constructor(props) {
    super(props)
  }

  renderEditorContainer() {
    const { currentDocument, editorMode } = this.props
    const staleKey = currentDocument.staleContentKey

    if(editorMode == 'body'){
      return <BodyEditorContainer staleKey={staleKey} />
    }else if(editorMode == 'configuration'){
      return <BodyAndConfigurationEditorContainer staleKey={staleKey} />
    }
  }

  render() {
    return <div>
      {this.renderEditorContainer()}
      <EditorContainerFooter />
    </div>
  }
}

export default connect(state => ({
  ...currentDocumentSelector(state),
  editorMode: editorModeSelector(state)
}))(DocumentEditor)
