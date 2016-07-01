import React, { Component, PropTypes } from 'react'
import inflection from 'inflection'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default class DateInputConfiguration extends Component {
  handleChange(date) {
    this.props.onChange(date.format('L'))
  }

  render() {
    const title = inflection.titleize(this.props.name.replace(/[-_]/, ' '))
    const value = this.props.value ? moment(this.props.value) : moment()

    return (
      <div className="inner-group">
        <label>{title}</label>

        <DatePicker selected={value}
          onChange={this.handleChange.bind(this)} />
      </div>
    )
  }
}
