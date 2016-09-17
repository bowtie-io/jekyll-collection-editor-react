import React, { Component, PropTypes } from 'react'

const DocumentNotFound = ({ path }) => (
  <div style={{paddingTop: "24px;"}}>
    Searching for documents..
  </div>
)

DocumentNotFound.propTypes = {
  path: PropTypes.string.isRequired,
}

export default DocumentNotFound
