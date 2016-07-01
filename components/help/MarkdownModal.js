import React, { Component } from 'react'

export default () => (
  <div className="modal fade" id="mdHelp" tabindex="-1" role="dialog" aria-labelledby="mdHelp">
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 className="modal-title" id="myModalLabel">Markdown Tips</h4>
        </div>

        <div className="modal-body">
          <table>
            <tr>
              <th>Format</th>
              <th>Result</th>
            </tr>
            <tr>
              <td>**text**</td><td>Bold</td>
            </tr>
            <tr>
              <td>*text*</td><td>Italicize</td>
            </tr>
            <tr>
              <td>~~text~~</td><td>Strike-through</td>
            </tr>
            <tr>
              <td>[title](http://)</td><td>Link</td>
            </tr>
            <tr>
              <td>![alt](http://)</td><td>Image</td>
            </tr>
            <tr>
              <td>* item</td><td>List</td>
            </tr>
            <tr>
              <td>> Quote</td><td>Blockquote</td>
            </tr>
            <tr>
              <td>==Highlight==</td><td>Highlight</td>
            </tr>
            <tr>
              <td># Heading</td><td>H1</td>
            </tr>
            <tr>
              <td>## Heading</td><td>H2</td>
            </tr>
            <tr>
              <td>### Heading</td><td>H3</td>
            </tr>
            <tr>
              <td>`code`</td><td>Inline Code</td>
            </tr>
          </table>
        </div>
        <div className="modal-footer">
        <span>For more help, read this <a href="https://daringfireball.net/projects/markdown/basics" target="_blank">Markdown Guide</a></span>
        </div>
      </div>
    </div>
  </div>
)
