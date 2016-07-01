import React, { Component, PropTypes } from 'react'

const DocumentNotFound = ({ path }) => (
  <div>
    Document { path } not found
  </div>
)

DocumentNotFound.propTypes = {
  path: PropTypes.string.isRequired,
}

export default DocumentNotFound
