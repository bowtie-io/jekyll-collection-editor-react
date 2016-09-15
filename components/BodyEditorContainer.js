import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { currentDocumentSelector } from '../selectors/documents'
import { configurationEditorModeAvailableSelector } from '../selectors/editorMode'
import DocumentConfigurationEditor from './DocumentConfigurationEditor.js'
import SummernoteEditor from './SummernoteEditor.js'
import { activateConfigurationEditor, resetDocument } from '../actions'
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


          { configurationEditorModeAvailable ?
            <button onClick={this.props.activateConfigurationEditor} className="viewButton2" style={{width: "auto"}}>
              <span style={{cursor: 'pointer', fontSize: '16px', float: 'left'}} className="fa fa-list" />
              <div className="viewButtonText" style={{float: 'left', marginLeft: '6px'}}>
              Fields
              </div>
            </button> : null }
            </div>
            
        </div>

        <div className="row content-mode animated slideInUp">
            <div className="editor-content">
            <SummernoteEditor {...this.props} />
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
  resetDocument
})(BodyEditorContainer)
