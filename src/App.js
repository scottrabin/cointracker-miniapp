import React, { Component } from 'react';
import './App.css';

import * as parse from 'csv-parse/lib/sync';
import * as file from './util/file';
import { processTransactionRecord, computeCapitalGains } from './util/crypto';

class App extends Component {
  fileInput = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
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

        <table className="transactions">
          <thead>
            <tr>
              <th>Date</th>
              <th>Sent</th>
              <th>Received</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {this.state.transactions.map((txn, i) => {
              return (
                <tr key={i}>
                  <td>{txn.date.toLocaleString()}</td>
                  <td>{`${txn.sent.quantity} ${txn.sent.currency}`}</td>
                  <td>{`${txn.received.quantity} ${txn.received.currency}`}</td>
                  <td>{isCryptoExchange(txn) ? `$${txn.sent.quantity * txn.sent.value}` : ""}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th>
                Cost Basis
              </th>
              <td colSpan="3">{computeCapitalGains(this.state.transactions)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.fileInput.current.files.length !== 1) {
      return;
    }
    file.loadFile(this.fileInput.current.files[0])
      .then(contents => {
        console.log(contents);
        return contents;
      })
      .then(contents => parse(contents, { skip_empty_lines: true }).slice(1))
      .then(processTransactionRecord)
      .then(transactions => {
        console.table(transactions);
        this.setState(s => ({ ...s, transactions }));
      });
  }
}

export default App;

function isCryptoExchange(txn) {
  return txn.sent.currency !== "USD" && txn.received.currency !== "USD";
}
