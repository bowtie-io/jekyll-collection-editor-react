import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { currentDocumentBodyPreviewSelector } from '../selectors/documents'
import marked from 'marked'

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
})

class MarkdownPreview extends Component {
  render() {
    const { body } = this.props
    const content = marked(body)

    return (
      <div dangerouslySetInnerHTML={{__html: content}} />
    )
  }
}

export default connect((state, props) => ({
  body: currentDocumentBodyPreviewSelector(state)
}))(MarkdownPreview)
