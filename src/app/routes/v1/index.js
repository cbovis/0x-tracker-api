const Router = require('koa-router');

const createAddressesRouter = require('./addresses');
const createAppRouter = require('./app');
const createAppLookupRouter = require('./app-lookup');
const createAppsRouter = require('./apps');
const createArticlesRouter = require('./articles');
const createArticleSourcesRouter = require('./article-sources');
const createFillsRouter = require('./fills');
const createLiquiditySourceRouter = require('./liquidity-source');
const createLiquiditySourcesRouter = require('./liquidity-sources');
const createMetricsRouter = require('./metrics');
const createProtocolsRouter = require('./protocols');
const createRatesRouter = require('./rates');
const createStatsRouter = require('./stats');
const createTokenLookupRouter = require('./token-lookup');
const createTokenRouter = require('./token');
const createTokensRouter = require('./tokens');
const createTraderRouter = require('./trader');
const createTraderLookupRouter = require('./trader-lookup');
const createTradersRouter = require('./traders');
const createZrxPriceRouter = require('./zrx-price');

const createRouter = () => {
  const router = new Router();

  router.use(
    createAddressesRouter().routes(),
    createAppRouter().routes(),
    createAppLookupRouter().routes(),
    createAppsRouter().routes(),
    createArticlesRouter().routes(),
    createArticleSourcesRouter().routes(),
    createFillsRouter().routes(),
    createLiquiditySourceRouter().routes(),
    createLiquiditySourcesRouter().routes(),
    createMetricsRouter().routes(),
    createProtocolsRouter().routes(),
    createRatesRouter().routes(),
    createStatsRouter().routes(),
    createTokenLookupRouter().routes(),
    createTokenRouter().routes(),
    createTokensRouter().routes(),
    createTraderRouter().routes(),
    createTraderLookupRouter().routes(),
    createTradersRouter().routes(),
    createZrxPriceRouter().routes(),
  );

  return router;
};

module.exports = createRouter;
