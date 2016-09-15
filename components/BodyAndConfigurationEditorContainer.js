import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { currentDocumentSelector } from '../selectors/documents'
import DocumentConfigurationEditor from './DocumentConfigurationEditor.js'
import SummernoteEditor from './SummernoteEditor.js'
import DocumentBodyEditor from './DocumentBodyEditor.js'
import { activateBodyEditor, resetDocument } from '../actions'


class BodyAndConfigurationEditorContainer extends Component {
  render() {
    const { currentDocument } = this.props

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



          <button className="viewButton" onClick={this.props.activateBodyEditor}>
            <span style={{float: 'left', cursor: 'pointer', fontSize: '20px'}}
              className="fa fa-edit" />
              <div className="viewButtonText">
              Editor
              </div>
          </button>
          </div>

          <div className="row titles"></div>

        </div>
        <div className="row animated slideInLeft collection-mode">
          <div className="configuration-editor col-lg-5 col-sm-5">
            <div className="editor-content">
            <DocumentConfigurationEditor />
            </div>
          </div>

          <div className="md-editor no-preview col-lg-7 col-sm-7">
            <SummernoteEditor {...this.props} />
          </div>
        </div>
      </div>
    )
  }
}

export default connect((state, props) => ({
  ...currentDocumentSelector(state),
  ...props
}), {
  activateBodyEditor,
  resetDocument
})(BodyAndConfigurationEditorContainer)
