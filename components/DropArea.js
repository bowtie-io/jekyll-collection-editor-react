import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { addUploadToDocument } from '../actions'
import { currentDocumentSelector } from '../selectors/documents'

class DropArea extends Component {
  constructor(props) {
    super(props)

    this.handleDragOver  = this.handleDragOver.bind(this)
    this.handleDragEnter = this.handleDragEnter.bind(this)
    this.handleDragLeave = this.handleDragLeave.bind(this)
    this.handleDrop      = this.handleDrop.bind(this)

    this.state = {
      activated: 0
    }
  }

  handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  handleDragEnter(e) {
    e.preventDefault()
    e.stopPropagation()

    this.setState({
      activated: this.state.activated + 1
    })
  }

  handleDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()

    this.setState({
      activated: this.state.activated - 1
    })
  }

  handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()

    const { currentDocument } = this.props

    if(e.dataTransfer.files.length > 1){
      alert('Please upload one file at a time.')
    }else if(e.dataTransfer.files.length == 1){
      this.props.addUploadToDocument(currentDocument, e.dataTransfer.files[0])
    }

    this.setState({
      activated: 0
    })
  }

  render(){
    const wrapperStyle = {
      minHeight: '200px',
      position: 'relative',
      padding: '2px'
    }

    const zoneStyle = {
      textAlign: 'center',
      display: (this.state.activated > 0 ? 'block' : 'none'),
      borderRadius: '10px',
      border: '2px dashed #fff',
      position: 'absolute',
      height: 'calc(100vh - 165px)',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      top: '0',
      left: '0',
      zIndex: '5',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '25% 0',
      fontSize:'2em',
      fontWeight: 'bold',
      textShadow:'1px 1px 10px rgba(0,0,0,.6)',
      textTransform: 'uppercase',
      color: '#fff'
    }

    return (
      <div style={wrapperStyle}
        ref={(d) => this._dropZoneElement = d}
        onDragOver={this.handleDragOver}
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}>

        <div className='drop-area' style={zoneStyle}>
          Drop File Here
        </div>

        {this.props.children}
      </div>
    )
  }
}

export default connect((state, props) => ({
  ...currentDocumentSelector(state),
  ...props
}), {
  addUploadToDocument
})(DropArea)
