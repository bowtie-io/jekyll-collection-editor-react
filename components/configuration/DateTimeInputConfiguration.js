import React, { Component, PropTypes } from 'react'
import inflection from 'inflection'
import moment from 'moment'
import AutoComplete from 'react-autocomplete'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss"

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


export default class DateTimeInputConfiguration extends Component {
  constructor(props) {
    super(props)

    var m = moment(this.props.value, DATE_FORMAT)
    m = (m.isValid()) ? m : moment()

    this.state = { date: m }
  }

  componentWillReceiveProps(nextProps){
    var m = moment(nextProps.value, DATE_FORMAT)
    m = (m.isValid()) ? m : moment()

    this.setState({ date: m })
  }

  handleDateTimeChange(date, time){
    var m;

    if(time){
      const [_, hh, mm, A] = time.match(/^(\d+):(\d+)\s*(\S*)$/)
      const HH = (A == 'PM') ? parseInt(hh) + 12 : parseInt(hh)
      m = moment(`${date.format('MM/DD/YYYY')} ${HH}:${mm}`, "MM/DD/YYYY HH:mm")
    }else{
      m = moment(`${date.format('MM/DD/YYYY')} ${this.state.date.format('HH:mm')}`)
    }

    if(m.isValid()){
      this.props.onChange(m.format(DATE_FORMAT))
      this.setState({ valid: true })
    }else{
      this.setState({ valid: false })
    }

    this.setState({ date: date })
  }

  handleDateChange(date) {
    this.handleDateTimeChange(date, this.state.time)
  }

  handleTimeChange(_e, value) {
    this.handleDateTimeChange(this.state.date, value)
  }

  handleTimeSelect(time) {
    this.handleDateTimeChange(this.state.date, time)
  }

  render() {
    const title = inflection.titleize(this.props.name.replace(/[-_]/, ' '))

    const itemStyle = { padding: '5px' }
    const selectedItemStyle = { ...itemStyle, backgroundColor: '#00f', color: '#fff' }
    const time = moment(this.state.date, DATE_FORMAT).format("hh:mm A")

    return (
      <div className="inner-group">
        <label>{title}</label>

        <div>
          <div style={({ width: '45%', margin: '0 5% 0 0', display: 'inline-block' })}>
            <DatePicker selected={this.state.date}
              className="form-control" onChange={this.handleDateChange.bind(this)} />
          </div>

          <div className="time-select" style={({ width: '50%', display: 'inline-block' })}>
            <AutoComplete items={clockMarkers} value={time} initialValue={time}
              inputProps={({ className: 'form-control' })}
              onChange={this.handleTimeChange.bind(this)}
              onSelect={this.handleTimeSelect.bind(this)} getItemValue={v=>v} renderItem={(v,s) => (
                <div style={s ? selectedItemStyle : itemStyle}>{v}</div>
              )}/>
          </div>
        </div>
      </div>
    )
  }
}
