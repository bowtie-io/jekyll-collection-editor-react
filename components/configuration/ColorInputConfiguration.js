import React, { Component, PropTypes } from 'react'
import inflection from 'inflection'
import SketchPicker from 'react-color'

function hexrgba(hex){
  const i = parseInt(hex, 16)
  const r = (i >> 16) & 255;
  const g = (i >> 8) & 255;
  const b = i & 255;

  [r, g, b].join()
}

function rgbahex(r, g, b, a){

}

export default class ColorInputConfiguration extends Component {
  constructor(props) {
    super(props)

    this.state = { open: false }
    this.handleToggle = this.handleToggle.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleToggle(e) {
    this.setState({ open: !this.state.open })
  }

  handleClose(e) {
    if(e.target == this._container)
      this.setState({ open: false })
  }

  handleChange(color) {
    if(color.rgb.a != 1){
      this.props.onChange(`rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`)
    }else{
      if(this.props.value && this.props.value.indexOf('#') != -1){
        this.props.onChange(`#${color.hex}`)
      }else{
        this.props.onChange(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`)
      }
    }
  }

  render() {
    const title = inflection.titleize(this.props.name.replace(/[-_]/, ' '))

    return (
      <div className="inner-group">
        <label>{title}</label>

        <div>
          <div className="input-group">
            <span className="input-group-addon"
              style={({backgroundColor: this.props.value, width: '30px'})}>
            </span>

            <input type="text" className="form-control"
              onClick={this.handleToggle} value={this.props.value} readOnly />
          </div>

          <div ref={(c)=>this._container=c}
            style={({display: this.state.open ? 'block' : 'none' })}
            onClick={this.handleClose}>

            <SketchPicker
              color={this.props.value || '#000'}
              type="chrome"
              display={this.state.open}
              position="below"
              onChange={this.handleChange}
              onClose={this.handleClose} />
              </div>
          </div>
      </div>
    )
  }
}
