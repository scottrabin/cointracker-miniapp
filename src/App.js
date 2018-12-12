import React, { Component } from 'react';
import './App.css';

import * as file from './util/file';

class App extends Component {
  fileInput = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      fileError: null,
    }
  }
  render() {
    return (
      <div className="App">
        <h1>CoinTracker Mini-App</h1>

        <form className="transaction-record-form" onSubmit={this.handleSubmit}>
          <div>
            <label>Transaction History</label>
            <input type="file" ref={this.fileInput} />
            {this.state.fileError || ""}
          </div>
          <div>
            <button type="submit">Process</button>
          </div>
        </form>
      </div>
    );
  }

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.fileInput.current.files.length !== 1) {
      return;
    }
    file.loadFile(this.fileInput.current.files[0]).then(contents => {
      console.log(contents);
    });
  }
}

export default App;
