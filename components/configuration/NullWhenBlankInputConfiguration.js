import React, { Component, PropTypes } from 'react'
import inflection from 'inflection'

export default class NullWhenBlankInputConfiguration extends Component {
  handleChange(e) {
    const value = e.target.value

    if(value === ''){
      this.props.onChange(null)
    }else{
      this.props.onChange(value)
    }
  }

  render() {
    const title = inflection.titleize(this.props.name.replace(/[-_]/, ' '))

    return (
      <div className="inner-group">
        <label>{title}</label>

        <input type="text" className="form-control"
          value={this.props.value} onChange={this.handleChange.bind(this)} />
      </div>
    )
  }
}
