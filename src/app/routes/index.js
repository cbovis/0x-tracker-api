const combineRouters = require('koa-combine-routers');

const articles = require('./articles');
const articleSources = require('./article-sources');
const metrics = require('./metrics');
const relayers = require('./relayers');
const stats = require('./stats');
const tokens = require('./tokens');
const fills = require('./fills');
const zrxPrice = require('./zrx-price');

const router = combineRouters(
  articles,
  articleSources,
  fills,
  metrics,
  relayers,
  stats,
  tokens,
  zrxPrice,
);

module.exports = router;
