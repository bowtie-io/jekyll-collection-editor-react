import React, { Component, PropTypes } from 'react'
import inflection from 'inflection'
import AutoComplete from 'react-autocomplete'

var clockMarkers = []

for(var b=0;b<24;b++){
  for(var c=0;c<60;c=c+15){
    var mark = b >= 12 ? 'PM' : 'AM'

    var hour = b > 12 ? b - 12 : b;
        hour = hour < 10 ? `0${hour}` : hour

    var minute = c < 10 ? `0${c}` : c

    clockMarkers.push(`${hour}:${minute} ${mark}`)
  }
}


export default class TimeInputConfiguration extends Component {
  handleChange(e, value) {
    this.props.onChange(value)
  }

  handleSelect(value) {
    this.props.onChange(value)
  }

  render() {
    const title = inflection.titleize(this.props.name.replace(/[-_]/, ' '))
    const itemStyle = { padding: '5px' }
    const selectedItemStyle = { ...itemStyle, backgroundColor: '#00f', color: '#fff' }

    return (
      <div className="inner-group">
        <label>{title}</label>

        <div className="time-select" >
        <AutoComplete items={clockMarkers} value={this.props.value || ''}
          inputProps={({ className: 'form-control' })}
          onChange={this.handleChange.bind(this)}
          onSelect={this.handleSelect.bind(this)}
          getItemValue={v=>v} renderItem={(v,s) => (
            <div style={s ? selectedItemStyle : itemStyle}>{v}</div>
          )}/>
        </div>
      </div>
    )
  }
}
