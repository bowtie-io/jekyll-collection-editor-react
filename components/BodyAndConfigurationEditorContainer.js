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



          <button className="viewButton" onClick={this.props.activateBodyEditor}>
            <span style={{fontSize: '16px', float: 'left', cursor: 'pointer'}}
              className="fa fa-caret-up" />
              <div className="viewButtonText">
              Fields
              </div>
          </button>
          </div>


        </div>
          <div className="row">
          <div className="configuration-editor animated slideInDown">
            <div className="editor-content">
            <DocumentConfigurationEditor />
            </div>
          </div>
          </div>

        <div className="row">
            <SummernoteEditor {...this.props} />
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
