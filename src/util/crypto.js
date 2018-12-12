/**
 * Processes a list of transactions and fetches the relevant information for crypto pricing
 *
 * @param {Array<Transaction>} txns
 */
export function processTransactionRecord(txns) {
  const transactions = txns.map(([date, receivedQty, receivedCurrency, sentQty, sentCurrency]) => ({
    date: new Date(date),
    received: {
      currency: receivedCurrency,
      quantity: parseInt(receivedQty, 10),
    },
    sent: {
      currency: sentCurrency,
      quantity: parseInt(sentQty, 10),
    },
  }));

  return Promise.all(transactions.map(txn => {
    if (txn.sent.currency !== "USD" && txn.received.currency !== "USD") {
      return getCryptoValue(txn);
    }
  })).then(currencyValues => {
    transactions.forEach((txn, i) => {
      if (currencyValues[i]) {
        txn.sent.value = currencyValues[i][txn.sent.currency]["USD"] || 0;
      }
    });
    return transactions;
  });
}

function getCryptoValue(transaction) {
  return fetch(`https://min-api.cryptocompare.com/data/pricehistorical?fsym=${transaction.sent.currency}&tsyms=USD&ts=${transaction.date.getTime() / 1000}`)
    .then(resp => resp.json());
}
