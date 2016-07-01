import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { updateDocumentName, removeDocument } from '../actions'
import AutosizeTextArea from 'react-autosize-textarea'

class CurrentIndexItem extends Component {
  handleChange(e) {
    const newName = e.target.value

    if(newName != this.props.document.name){
      this.props.updateDocumentName(this.props.document, newName)
    }
  }

  render() {
    const { document, removeDocument, onClick } = this.props

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
          <span onClick={removeDocument.bind(null, document)}
            className="fa fa-trash-o"
            style={({margin: '10px 5px 10px 5px', width: '15px', float: 'left'})}></span>

          <div style={({marginLeft: '25px'})}>
            <AutosizeTextArea value={document.name} onChange={this.handleChange.bind(this)} style={inputStyle} />

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
  removeDocument
})(CurrentIndexItem)
