import React, { Component, PropTypes } from 'react'
import inflection from 'inflection'

export default class BooleanInputConfiguration extends Component {
  handleChange(e) {
    this.props.onChange(e.target.checked)
  }

  render() {
    const title = inflection.titleize(this.props.name.replace(/[-_]/, ' '))

    return (
      <div className="inner-group">
        <label>
          <input type="checkbox"
            checked={this.props.value} onChange={this.handleChange.bind(this)} />
            &nbsp; {title}
        </label>
      </div>
    )
  }
}
