const _ = require('lodash');
const moment = require('moment');

const { METRIC_INTERVAL, ZRX_TOKEN_ADDRESS } = require('../constants');
const { getToken } = require('../tokens/token-cache');
const formatTokenAmount = require('../tokens/format-token-amount');
const TokenMetric = require('../model/token-metric');
const Token = require('../model/token');

const getTokenMetrics = async (
  tokenAddress,
  dateFrom,
  dateTo,
  metricInterval,
) => {
  const dayFrom = moment
    .utc(dateFrom)
    .startOf('day')
    .toDate();
  const dayTo = moment
    .utc(dateTo)
    .endOf('day')
    .toDate();
  const hourFrom = moment
    .utc(dateFrom)
    .startOf('hour')
    .toDate();
  const hourTo = moment
    .utc(dateTo)
    .endOf('hour')
    .toDate();

  const pipeline =
    metricInterval === METRIC_INTERVAL.DAY
      ? [
          {
            $match: { date: { $gte: dayFrom, $lte: dayTo }, tokenAddress },
          },
          { $sort: { date: 1 } },
        ]
      : [
          {
            $match: { date: { $gte: dayFrom, $lte: dayTo }, tokenAddress },
          },
          {
            $unwind: {
              path: '$hours',
            },
          },
          {
            $project: {
              hour: '$hours.date',
              fillCount: '$hours.fillCount',
              tokenVolume: '$hours.tokenVolume',
              usdVolume: '$hours.usdVolume',
            },
          },
          {
            $match: { hour: { $gte: hourFrom, $lte: hourTo } },
          },
          {
            $group: {
              _id: '$hour',
              fillCount: {
                $sum: '$fillCount',
              },
              tokenVolume: {
                $sum: '$tokenVolume',
              },
              usdVolume: {
                $sum: '$usdVolume',
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ];

  const dataPoints = await TokenMetric.aggregate(pipeline);
  const zrxToken = getToken(ZRX_TOKEN_ADDRESS);

  if (zrxToken === undefined) {
    throw new Error('Cannot find ZRX token');
  }

  const token = await Token.findOne({ address: tokenAddress });
  const result = dataPoints.map(dataPoint => {
    return {
      date: _.get(dataPoint, 'date', dataPoint._id),
      fillCount: dataPoint.fillCount,
      volume: {
        USD: dataPoint.usdVolume,
        [token.symbol]: formatTokenAmount(dataPoint.tokenVolume, token),
      },
    };
  });

  return result;
};

module.exports = getTokenMetrics;
