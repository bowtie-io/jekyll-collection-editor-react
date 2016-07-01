import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import inflection from 'inflection'
import { updateDocumentConfiguration, appendDocumentConfigurationItem, removeDocumentConfigurationItem } from '../actions'
import TextInputConfiguration from '../components/configuration/TextInputConfiguration.js'
import FileUploadConfiguration from '../components/configuration/FileUploadConfiguration.js'
import BooleanInputConfiguration from '../components/configuration/BooleanInputConfiguration.js'
import DateInputConfiguration from '../components/configuration/DateInputConfiguration.js'
import TimeInputConfiguration from '../components/configuration/TimeInputConfiguration.js'
import DateTimeInputConfiguration from '../components/configuration/DateTimeInputConfiguration.js'
import ColorInputConfiguration from '../components/configuration/ColorInputConfiguration.js'
import NullWhenBlankInputConfiguration from '../components/configuration/NullWhenBlankInputConfiguration.js'
import { currentDocumentSelector } from '../selectors/documents'
import '../style/configuration-editor.scss'

class DocumentConfigurationEditor extends Component {
  handleConfigurationChange(key, value) {
    const { currentDocument, updateDocumentConfiguration } = this.props
    updateDocumentConfiguration(currentDocument.id, key, value)
  }

  handleConfigurationAppend(key) {
    const { currentDocument, appendDocumentConfigurationItem } = this.props
    appendDocumentConfigurationItem(currentDocument.id, key)
  }

  handleConfigurationRemove(key, index) {
    const { currentDocument, removeDocumentConfigurationItem } = this.props
    removeDocumentConfigurationItem(currentDocument.id, key, index)
  }

  render() {
    const renderedFields = function(fields, configuration, ancestors = []) {
      if(!fields){
        return null;
      }

      return Object.keys(fields).map(function(name, index){
        const field = fields[name]
        const current = configuration[name]
        const title = inflection.titleize(name.replace(/[-_]/, ' '))
        const ancestorPath = ancestors.join('.')
        const path = [...ancestors, name].join('.')
        const isListItem = (fields.constructor === Array)

        if(field != null && field.constructor === Array){
          return <div key={name} className="form-group outer-group">
              <h3>{title}</h3>

              {renderedFields(current, current || [], [...ancestors, name])}

              <button className="btn btn-sm btn-default" onClick={this.handleConfigurationAppend.bind(this, path)}>+ Add</button>
            </div>
        }else if(field != null && typeof(field) === 'object'){
          return <div key={name} className="form-group outer-group">
              <h3>{title}</h3>
              {renderedFields(field, current || {}, [...ancestors, name])}
            </div>
        } else {
          const value = configuration.hasOwnProperty(name) ? current : field

          if ( name.match(/[_-]path$/i) ) {
            return <div key={name} className="configuration-field file-upload-configuration">
                      <FileUploadConfiguration name={name} value={value}
                        onChange={this.handleConfigurationChange.bind(this, path)} />
                   </div>
          } else if ( name.match(/[_-](date|on)$/i) ) {
            return <div key={name} className="configuration-field date-input-configuration">
                      <DateInputConfiguration name={name} value={value}
                        onChange={this.handleConfigurationChange.bind(this, path)} />
                   </div>
          } else if ( name == 'time' || name.match(/^.*[_-]?(time)$/i) ) {
            return <div key={name} className="configuration-field date-input-configuration">
                      <TimeInputConfiguration name={name} value={value}
                        onChange={this.handleConfigurationChange.bind(this, path)} />
                   </div>
          } else if ( name == 'date' || name.match(/[_-](at)$/i) ) {
            return <div key={name} className="configuration-field date-time-input-configuration">
                      <DateTimeInputConfiguration name={name} value={value}
                        onChange={this.handleConfigurationChange.bind(this, path)} />
                   </div>
          } else if ( name == 'color' || name.match(/[_-]color$/i) ) {
            return <div key={name} className="configuration-field color-input-configuration">
                      <ColorInputConfiguration name={name} value={value}
                        onChange={this.handleConfigurationChange.bind(this, path)} />
                   </div>
          } else if ( typeof(field) === 'string' ) {
            return <div key={name} className="configuration-field text-input-configuration">
                      <TextInputConfiguration name={isListItem ? null : name} value={value}
                        onChange={this.handleConfigurationChange.bind(this, path)}
                        onRemove={isListItem ? this.handleConfigurationRemove.bind(this, ancestorPath, index) : null} />
                  </div>
          } else if ( typeof(field) === 'boolean' ) {
            return <div key={name} className="configuration-field boolean-input-configuration">
                      <BooleanInputConfiguration name={name} value={value}
                        onChange={this.handleConfigurationChange.bind(this, path)} />
                    </div>
          } else {
            return <div key={name} className="configuration-field null-when-blank-input-configuration">
                      <NullWhenBlankInputConfiguration name={name} value={value}
                        onChange={this.handleConfigurationChange.bind(this, path)} />
                  </div>
          }
        }
      }.bind(this))
    }.bind(this)

    const { fields, currentDocument } = this.props
    const { content } = currentDocument
    const { configuration } = content

    return (
      <div>
        {renderedFields(fields.attributes, configuration)}
      </div>
    )
  }
}

DocumentConfigurationEditor.propTypes = {
  configuration: PropTypes.object.required,
  onConfigurationChange: PropTypes.func.required
}

export default connect(state => ({
  fields: state.fields,
  ...currentDocumentSelector(state)
}), {
  updateDocumentConfiguration,
  appendDocumentConfigurationItem,
  removeDocumentConfigurationItem
})(DocumentConfigurationEditor)
