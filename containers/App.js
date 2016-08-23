import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { loadData, commit, newDocument, resetAll } from '../actions'
import { isModifiedSelector, visibleDocumentsSelector } from '../selectors/documents'
import DocumentsIndex from '../components/DocumentsIndex'
import EditorManager from '../components/EditorManager'
import Indicator from '../components/Indicator'
import 'font-awesome/scss/font-awesome.scss'
import '../style/app.scss'
import "react-summernote/dist/react-summernote.css"



class App extends Component {
  loadData(props = this.props) {
    const { loadData } = props

    loadData()
  }

  componentDidMount() {
    // Load documents from server
    if(this.props.isStale){
      this.loadData()
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.isStale){
      this.loadData(nextProps)
    }
  }

  render() {
    const { isModified, newDocument, resetAll, commit } = this.props

    const newButtonStyle = {
      margin: "0 10px",
    }

    const saveButtonStyle = {
      margin: "0 10px",
    }

    return (
      <div className="collectioneditor">
        <Indicator />

        <div className="header row panel panel-default" >
          <div className="panel-body">
            <div className="pull-left">
              <button onClick={newDocument} className="btn btn-secondary" style={newButtonStyle}>
                <span className="fa fa-plus"></span>
              </button>
            </div>

            <div className="pull-left">
              {isModified ? (
                <button onClick={resetAll} className="btn btn-secondary" style={saveButtonStyle}>
                  <span className="fa fa-undo"></span>
                </button>
              ) : null}
            </div>

            <div className="pull-left">
              {isModified ? (
                <button onClick={commit} className="btn btn-warning" style={saveButtonStyle}>
                  <span className="fa fa-floppy-o"></span>
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="content main row panel panel-default">
          <div className="panel-body">
            <div className="documentindex">
              <DocumentsIndex />
            </div>

            <div className="editormanager panel panel-default">
              <div className="panel-body">
                <EditorManager />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    ...isModifiedSelector(state),
    ...visibleDocumentsSelector(state),
    isStale: state.isStale
  }
}

export default connect(mapStateToProps, {
  commit,
  newDocument,
  loadData,
  resetAll
})(App)
