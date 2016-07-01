import React, { Component, PropTypes } from 'react'
import inflection from 'inflection'
import { currentDocumentSelector } from '../../selectors/documents'
import { connect } from 'react-redux'
import { loadFile, removeFile, replaceFile } from '../../actions'

const ImagePreview = ({ file }) => (
  <div>
    <div style={({maxHeight: '200px', overflow: 'auto', background: '#f7f7f7'})}>
      <img className="img-preview" src={file.previewURL} />
    </div>

    <div>
      {file.path}
    </div>
  </div>
)

const NonImagePreview = ({ file }) => (
  <div>
    {file.path}
  </div>
)

const NotFound = ({ file }) => (
  <div className="alert alert-warning">
    `{file.path}` not found on server
  </div>
)

class Loading extends Component {
  render() {
    return <h4>Loading...</h4>
  }
}

export default class FileUploadConfiguration extends Component {
  componentWillMount() {
    if(this.props.value && !this.props.file){
      this.props.loadFile(this.props.value)
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.value && !nextProps.file){
      this.props.loadFile(nextProps.value)
    }
  }

  handleChange(e) {
    e.preventDefault()

    const files  = e.target.files
    const file   = files[0]           // this only supports one upload
    const action = this.props.replaceFile(this.props.value, file)

    console.log(`Handle change: ${action}`)

    if(action){
      this.props.onChange(action.payload.path)
    }
  }

  handleRemove(e) {
    this.props.removeFile(this.props.value)
    this.props.onChange(null)
  }

  renderInnerComponent() {
    const { value, file } = this.props

    if(!value) {
      return <input type="file"
          onChange={this.handleChange.bind(this)} />

    }else if(file && !file.isNew && file.notFound) {
      return <div style={({position: 'relative'})}>
        <span style={({position: 'absolute', top: 0, right: 0, padding: '15px', cursor: 'pointer'})}
          onClick={this.handleRemove.bind(this)}>
          <span className="fa fa-trash-o"></span>
        </span>

        <NotFound file={file} />
      </div>

    }else if(file && file.type.startsWith('image')) {
      return <div style={({position: 'relative'})}>
        <span style={({position: 'absolute', top: 0, right: 0, padding: '15px', cursor: 'pointer'})}
          onClick={this.handleRemove.bind(this)}>
          <span className="fa fa-trash-o"></span>
        </span>

        <ImagePreview file={file} />
      </div>
    }else if(file) {
      return <div style={{position: 'relative'}}>
        <span style={({position: 'absolute', top: 0, right: 0, padding: '0 15px', cursor: 'pointer'})}
          onClick={this.handleRemove.bind(this)}>
          <span className="fa fa-trash-o"></span>
        </span>

        <NonImagePreview file={file} />
      </div>
    }else {
      return <Loading value={value} />
    }
  }

  render() {
    const { name, value, file } = this.props
    const title = inflection.titleize(name.replace(/[-_]path/, '').
                                        replace(/[-_]/, ' '))

    return <div style={({ position: 'relative' })} className="inner-group">
        <label>{title}</label>
        {this.renderInnerComponent()}
      </div>
  }
}

function mapStateToProps(state, ownProps) {
  return {
    ...currentDocumentSelector(state),
    file: state.files.find(f => (f.path == ownProps.value))
  }
}

export default connect(mapStateToProps, {
  loadFile,
  removeFile,
  replaceFile
})(FileUploadConfiguration)
