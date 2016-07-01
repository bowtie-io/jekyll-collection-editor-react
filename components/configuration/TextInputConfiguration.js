import React, { Component, PropTypes } from 'react'
import inflection from 'inflection'

export default class TextInputConfiguration extends Component {
  handleChange(e) {
    this.props.onChange(e.target.value)
  }

  handleRemove(_e) {
    this.props.onRemove()
  }

  render() {
    const title = this.props.name ? inflection.titleize(this.props.name.replace(/[-_]/, ' ')) : null
    const onRemove = this.props.onRemove

    return (
      <div className="inner-group input-group">
        {title ?
          <label>{title}</label>
        : null }

        <div className="input-group">
          <input type="text" className="form-control"
            value={this.props.value} onChange={this.handleChange.bind(this)} />

          {onRemove ? <span className="input-group-btn">
                        <button className="btn btn-sm btn-default btn-transparent" type="button"
                          onClick={this.handleRemove.bind(this)}>-</button>
                      </span>
            : null }
        </div>
      </div>
    )
  }
}

TextInputConfiguration.propTypes = {
  name: PropTypes.string.required,
  value: PropTypes.string.required,
  onChange: PropTypes.func.required
}
