import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import IndexItem from './IndexItem'
import CurrentIndexItem from './CurrentIndexItem'
import { resetWarningMessage, reset } from '../actions'
import { visibleDocumentsSelector, currentDocumentSelector } from '../selectors/documents'

class Indicator extends Component {
  render (){
    const {
      requests,
      error,
      warning,
      reset,
      pendingCommit,
      resetWarningMessage
    } = this.props

    const containerStyle = {
      position: 'fixed',
      zIndex: 9000,
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      overflow: 'auto',
    }

    const contentStyle = {
      margin: '10% auto',
      padding: '5px 10px',
      borderRadius: '5px',
      width: '70%',
      height: 'auto',
      color: 'white',
      fontSize: '1.25em',
      fontWeight: '400',
      textAlign: 'center',
      backgroundColor: 'rgba(255, 0, 0, 0.8)'
    }

    if(error) {
      const errorContainerStyle = { ...containerStyle,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }

      const errorContentStyle = { ...contentStyle,
        backgroundColor: 'rgba(255, 0, 0, 0.8)'
      }

      return <div className="indicator-container" style={errorContainerStyle}>
               <div className="indicator modal-content" style={errorContentStyle}>
                <div className="modal-header">
                  <button onClick={reset} type="button" className="close">
                    x
                  </button>
                </div>

                <div className="modal-body">
                  {error}
                </div>

                <div className="modal-footer" style={{textAlign: 'center'}}>
                  <button onClick={reset} type="button" className="btn btn-default">
                    <span className="fa fa-refresh"></span> Reload
                  </button>
                </div>
              </div>
            </div>
    }

    if(warning){
      const warningContainerStyle = { ...containerStyle,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }

      const warningContentStyle = { ...contentStyle,
        backgroundColor: 'rgba(251, 153, 12, 1)'
      }

      return <div className="indicator-container" style={warningContainerStyle}>
               <div className="indicator modal-content" style={warningContentStyle}>
                <div className="modal-header">
                  <button onClick={reset} type="button" className="close">
                    x
                  </button>
                </div>

                <div className="modal-body">
                {warning}
                </div>

                <div className="modal-footer" style={{textAlign: 'center'}}>
                  <button onClick={resetWarningMessage} type="button"
                    className="btn btn-default">
                    Close
                  </button>
                </div>
              </div>
            </div>
    }

    if(pendingCommit){
      const pendingCommitContainerStyle = { ...containerStyle,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }

      const pendingCommitContentStyle = { ...contentStyle,
        backgroundColor: 'rgba(251, 153, 12, 1)'
      }

      return <div className="indicator-container" style={pendingCommitContainerStyle}>
               <div className="indicator modal-content" style={pendingCommitContentStyle}>
                Please wait...
              </div>
            </div>
    }

    if(requests > 0) {
      return <div className="indicator alert alert-info">
        <span className="fa fa-spin fa-spinner"></span>
        <span>&nbsp; Working...</span>
      </div>
    }

    return null
  }
}


function mapStateToProps(state) {
  return { ...state.indicators }
}

export default connect(mapStateToProps, {
  reset,
  resetWarningMessage
})(Indicator)
