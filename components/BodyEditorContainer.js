import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { currentDocumentSelector } from '../selectors/documents'
import { configurationEditorModeAvailableSelector } from '../selectors/editorMode'
import DocumentConfigurationEditor from './DocumentConfigurationEditor.js'
import SummernoteEditor from './SummernoteEditor.js'
import { activateConfigurationEditor, duplicateDocument, resetDocument } from '../actions'
import MarkdownPreview from './MarkdownPreview.js'

class BodyEditorContainer extends Component {
  render() {
    const { currentDocument,
            configurationEditorModeAvailable } = this.props

    var title = null;

    if(currentDocument && currentDocument.content &&
        currentDocument.content.configuration &&
        currentDocument.content.configuration.title){
      title = currentDocument.content.configuration.title
    }

    const currentDocumentIsModified = currentDocument && currentDocument.isModified

    return (
      <div>
        <div className="row body-editor-header">
        {title ? <h2 className="title">
          {title}</h2> : null }

          <div className="btn-group">
          { currentDocumentIsModified ?
            <button onClick={this.props.resetDocument}>
              <span style={{cursor: 'pointer', fontSize: '20px'}}
                className="fa fa-undo" />
            </button> : null }

          <button onClick={this.props.duplicateDocument}>
            <span style={{cursor: 'pointer', fontSize: '20px'}}
              className="fa fa-files-o" />
          </button>

          { configurationEditorModeAvailable ?
            <button onClick={this.props.activateConfigurationEditor}>
              <span style={{cursor: 'pointer', fontSize: '20px'}}
                className="fa fa-list" />
            </button> : null }
            </div>

            <div className="row titles"><h5><span className="title col-xs-6">Markdown<button className="fa fa-question-circle markdown-help"
              data-toggle="modal" data-target="#mdHelp"></button></span><span className="title preview-title col-xs-6">Preview</span></h5></div>

        </div>

        <div className="row animated slideInRight content-mode">
          <div className="md-editor has-preview col-sm-8">
            <div className="editor-content">
            <SummernoteEditor {...this.props} />
            </div>
          </div>

          <div className="md-preview col-sm-4">
            <div className="editor-content">
            <MarkdownPreview />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default connect((state, props) => ({
  ...currentDocumentSelector(state),
  configurationEditorModeAvailable: configurationEditorModeAvailableSelector(state),
  ...props
}), {
  activateConfigurationEditor,
  duplicateDocument,
  resetDocument
})(BodyEditorContainer)
