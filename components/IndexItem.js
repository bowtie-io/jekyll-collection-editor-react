import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { removeDocument } from '../actions'

const IndexItem = ({onClick, removeDocument, document}) => (
  <li className="list-group-item" onClick={onClick}>
    <div className="row" style={({ cursor: 'pointer' })}>
      <div style={({marginLeft: '10px'})}>
        <span onClick={removeDocument.bind(null, document)} className="fa fa-trash-o"
          style={({margin: '2px 5px 10px 5px', width: '15px', float: 'left'})}></span>

        <div style={({marginLeft: '25px'})}>
          <p>{document.name}</p>

          <div>
            {document.isNew ? <span className="label label-info">New</span> : null}
            {(document.isModified && !document.isNew) ? <span className="label label-warning">Modified</span> : null}
            {document.isRemoved ? <span className="label label-danger">Removed</span> : null}
          </div>
        </div>
      </div>
    </div>
  </li>
)

export default connect(s => s, {
  removeDocument
})(IndexItem)
