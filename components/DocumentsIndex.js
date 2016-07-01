import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import IndexItem from './IndexItem'
import CurrentIndexItem from './CurrentIndexItem'
import { selectDocument } from '../actions'
import { visibleDocumentsSelector, currentDocumentSelector } from '../selectors/documents'

class DocumentsIndex extends Component {
  render() {
    const { requests, currentDocument,
      selectDocument, documents } = this.props

    return (
      <div className="index-dropdown dropdown">
      <button className="btn btn-default index-item-selector dropdown-toggle" data-toggle="dropdown">Select Item</button>
      <ul className="list-group index-item-selector dropdown-menu">
          {documents.map(document => {
            if(currentDocument && document.id == currentDocument.id){
              return <CurrentIndexItem document={document}
                key={document.id} onClick={selectDocument.bind(this, document)} />
            }else{
              return <IndexItem document={document}
                key={document.id} onClick={selectDocument.bind(this, document)} />
            }
          })}
        </ul>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    ...visibleDocumentsSelector(state),
    ...currentDocumentSelector(state)
  }
}

export default connect(mapStateToProps, {
  selectDocument
})(DocumentsIndex)
