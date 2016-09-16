import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { resetDocument, updateDocumentName, removeDocument, duplicateDocument } from '../actions'
import AutosizeTextArea from 'react-autosize-textarea'

class CurrentIndexItem extends Component {
  handleChange(e) {
    const newName = e.target.value

    if(newName != this.props.document.name){
      this.props.updateDocumentName(this.props.document, newName)
    }
  }

  render() {
    const { document, resetDocument, removeDocument, duplicateDocument, onClick } = this.props

    const inputStyle = {
      fontSize: '18px',
      border: '0px',
      background: 'transparent',
      margin: '10px 0px',
      padding: '0px',
      lineHeight: '1.1em',
      width: '100%'
    }

    return <li className="list-group-item active">
      <div className="row">
        <div style={({marginLeft: '10px'})}>
          <div style={({marginLeft: '10px'})}>
            <AutosizeTextArea value={document.name} onChange={this.handleChange.bind(this)} style={inputStyle} />

          <span onClick={removeDocument.bind(null, document)} className="fa fa-files-o duplicate_document"
            style={({margin: '2px 5px 10px 5px', width: '15px', float: 'right'})}></span>

          <span onClick={duplicateDocument.bind(null, document)} className="fa fa-trash-o"
            style={({margin: '2px 5px 10px 5px', width: '15px', float: 'right'})}></span>
          { document.isModified ?
              <span onClick={this.props.resetDocument} style={{float: 'right', cursor: 'pointer', fontSize: '12px', width: '13px', marginTop: '3px'}}
                className="fa fa-undo" />
            : null }

            <div>
              {document.isNew ? <span className="label label-info">New</span> : null}
              {(document.isModified && !document.isNew) ? <span className="label label-warning">Modified</span> : null}
              {document.isRemoved ? <span className="label label-danger">Removed</span> : null}
            </div>
          </div>
        </div>
      </div>
    </li>
  }
}

CurrentIndexItem.propTypes = {
  document: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired
}

export default connect(s => s, {
  updateDocumentName,
  duplicateDocument,
  resetDocument,
  removeDocument
})(CurrentIndexItem)
