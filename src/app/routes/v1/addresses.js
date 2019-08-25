const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const getAddressesWith24HourStats = require('../../../addresses/get-addresses-with-24-hour-stats');
const getAddressesWithStatsForDates = require('../../../addresses/get-addresses-with-stats-for-dates');
const pagination = require('../../middleware/pagination');

const parseBooleanString = value => {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
};

const createRouter = () => {
  const router = new Router();

  router.get(
    '/addresses',
    pagination({ defaultLimit: 20, maxLimit: 50, maxPage: Infinity }),
    async ({ pagination: { limit, page }, request, response }, next) => {
      const statsPeriod = request.query.statsPeriod || TIME_PERIOD.DAY;
      const { dateFrom, dateTo } = getDatesForTimePeriod(statsPeriod);
      const excludeRelayers = parseBooleanString(request.query.excludeRelayers);

      const { addresses, resultCount } =
        statsPeriod === TIME_PERIOD.DAY
          ? await getAddressesWith24HourStats({
              excludeRelayers,
              page,
              limit,
            })
          : await getAddressesWithStatsForDates(dateFrom, dateTo, {
              excludeRelayers,
              page,
              limit,
            });

      response.body = {
        addresses,
        page,
        pageCount: Math.ceil(resultCount / limit),
        limit,
        total: resultCount,
      };

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
