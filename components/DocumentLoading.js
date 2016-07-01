import React, { Component, PropTypes } from 'react'

const DocumentLoading = ({ path }) => (
  <div>
    Document { path } loading...
  </div>
)

DocumentLoading.propTypes = {
  path: PropTypes.string.isRequired,
}

export default DocumentLoading
