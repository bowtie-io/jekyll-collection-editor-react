import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { loadDocument } from '../actions'
import DocumentLoading from '../components/DocumentLoading'
import DocumentNotFound from '../components/DocumentNotFound'
import DocumentEditor from '../components/DocumentEditor'
import { currentDocumentSelector } from '../selectors/documents'

class EditorManager extends Component {
  render() {
    const { currentDocument, loadDocument } = this.props

    if(!currentDocument){
      return <DocumentNotFound path="" />
    }

    if(!currentDocument.isNew && currentDocument.content == null) {
      loadDocument(currentDocument)
      return <DocumentLoading path={currentDocument.name} />
    }

    return <DocumentEditor />
  }
}

function mapStateToProps(state, props) {
  // TODO: is this the right place to have the conditional logic?
  // is it best to maybe use a currentDocument in the state so we
  // prevent the state-based conditional

  return {
    ...currentDocumentSelector(state)
  }
}


export default connect(mapStateToProps, { loadDocument })(EditorManager)
