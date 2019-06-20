const fetch = require('node-fetch');
const R = require('ramda');
const { CronJob } = require('cron');

const alternativeApiUrl = 'https://api.alternative.me';
const elastichsearchUrl = process.env.ELASTICSEARCH_URL;

// Impures (I/O)
const fetchCoinsInfo = async () => fetch(`${alternativeApiUrl}/v2/ticker/`);
const insertCoinInfo = async (data) =>
  fetch(`${elastichsearchUrl}/coins-${data.symbol.toLowerCase()}/_doc`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
// Pures
const checkHttpStatus = response => response.status < 400;
const getBody = response => response.json();
const mapResponse = response => Object.values(response.data).map(
  ({
    id,
    name,
    symbol,
    rank,
    circulating_supply,
    total_supply,
    max_supply,
    quotes
  }) => ({
    id,
    name,
    symbol,
    rank,
    circulating_supply,
    total_supply,
    max_supply,
    quotes,
    timestamp: new Date(response.metadata.timestamp * 1000)
  })
);

const resolveAll = (promises) => Promise.all(promises);

const mine = R.pipeWith(R.then, [
  fetchCoinsInfo,
  R.ifElse(
    checkHttpStatus,
    getBody,
    () => { throw new Error('Reponse error status code'); }
  ),
  mapResponse,
  R.map(insertCoinInfo),
  resolveAll,
  () => console.log('All coins imported !')
]);

// Worker
const cron = new CronJob('0 */5 * * * *', async () => {
  try {
    await mine();
  } catch (err) {
    console.error('Coin fetch error', err);
  }
}, null, true, 'Europe/Brussels');
