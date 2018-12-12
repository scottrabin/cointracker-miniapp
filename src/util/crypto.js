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
        // crypto-to-crypto
        txn.sent.value = currencyValues[i][txn.sent.currency]["USD"] || 0;
      } else if (txn.sent.currency === "USD") {
        // purchased crypto
        txn.received.value = txn.sent.qty / txn.received.qty;
      } else {
        // sold crypto
        txn.sent.value = txn.received.qty / txn.sent.qty;
      }
    });
    return transactions;
  });
}

/**
 * Computes the total capital gains for a transaction series
 *
 * @param {Array<Transaction>} txns
 */
export function computeCapitalGains(txns) {
  return txns.reduce((acc, txn) => {
    if (txn.sent.currency === "USD") {
      // cost basis is spent usd
      if (!acc.coins[txn.received.currency]) {
        acc.coins[txn.received.currency] = [];
      }
      acc.coins[txn.received.currency].push({
        qty: txn.received.qty,
        costBasis: txn.sent.qty / txn.received.qty,
      })
    } else if (txn.received.currency === "USD") {
      // sold crypto - capital gain event against fiat
      let qty = txn.sent.qty;
      while (qty > 0) {
        if (acc.coins[txn.sent.currency][0].qty > qty) {
          acc.gain += (txn.received.qty - acc.coins[txn.sent.currency][0].value * qty);
          acc.coins[txn.sent.currency][0].qty -= qty;
          break;
        } else {
          acc.gain += (txn.received.qty - acc.coins[txn.sent.currency][0].value * acc.coins[txn.sent.currency][0].qty);
          qty -= acc.coins[txn.sent.currency][0].qty;
          acc.coins[txn.sent.currency].shift();
        }
      }
    } else {
      // crypto-to-crypto trade
      let qty = txn.sent.qty;
      while (qty > 0) {
        if (acc.coins[txn.sent.currency][0].qty > qty) {
          acc.gain += (txn.sent.value - acc.coins[txn.sent.currency][0].costBasis) * qty;
          acc.coins[txn.sent.currency][0].qty -= qty;
          break;
        } else {
          acc.gain += (txn.sent.value - acc.coins[txn.sent.currency][0].costBasis) * acc.coins[txn.sent.currency][0].qty;
          qty -= acc.coins[txn.sent.currency][0].qty;
        }
      }
    }
    console.log(acc);

    return acc;
  }, {
      gain: 0,
      coins: {},
    }).gain;
}

function getCryptoValue(transaction) {
  return fetch(`https://min-api.cryptocompare.com/data/pricehistorical?fsym=${transaction.sent.currency}&tsyms=USD&ts=${transaction.date.getTime() / 1000}`)
    .then(resp => resp.json());
}
