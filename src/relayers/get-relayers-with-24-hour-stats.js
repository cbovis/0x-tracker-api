const _ = require('lodash');
const moment = require('moment');

const RelayerMetric = require('../model/relayer-metric');

const getRelayersWith24HourStats = async options => {
  const { page, limit } = _.defaults({}, options, {
    page: 1,
    limit: 20,
  });

  const dateTo = moment.utc().toDate();
  const dateFrom = moment
    .utc(dateTo)
    .subtract(24, 'hours')
    .toDate();

  const result = await RelayerMetric.aggregate([
    {
      $match: {
        date: {
          $gte: moment
            .utc(dateFrom)
            .startOf('day')
            .toDate(),
          $lte: dateTo,
        },
        relayerId: { $ne: null },
      },
    },
    {
      $unwind: {
        path: '$hours',
      },
    },
    {
      $unwind: {
        path: '$hours.minutes',
      },
    },
    {
      $match: {
        'hours.minutes.date': {
          $gte: dateFrom,
          $lte: dateTo,
        },
      },
    },
    {
      $group: {
        _id: '$relayerId',
        fillCount: {
          $sum: '$hours.minutes.fillCount',
        },
        fillVolume: {
          $sum: '$hours.minutes.fillVolume',
        },
        tradeCount: {
          $sum: '$hours.minutes.tradeCount',
        },
        tradeVolume: {
          $sum: '$hours.minutes.tradeVolume',
        },
      },
    },
    {
      $facet: {
        relayers: [
          { $sort: { tradeVolume: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: 'relayers',
              localField: '_id',
              foreignField: 'lookupId',
              as: 'relayer',
            },
          },
          {
            $project: {
              _id: 0,
              imageUrl: { $arrayElemAt: ['$relayer.imageUrl', 0] },
              name: { $arrayElemAt: ['$relayer.name', 0] },
              slug: { $arrayElemAt: ['$relayer.slug', 0] },
              stats: {
                fillCount: '$fillCount',
                fillVolume: '$fillVolume',
                tradeCount: '$tradeCount',
                tradeVolume: '$tradeVolume',
              },
              url: { $arrayElemAt: ['$relayer.url', 0] },
            },
          },
        ],
        resultCount: [{ $count: 'value' }],
        totals: [
          {
            $group: {
              _id: null,
              relayerCount: { $sum: 1 },
              tradeVolume: { $sum: '$tradeVolume' },
            },
          },
        ],
      },
    },
  ]);

  const totalVolume = _.get(result, '[0].totals[0].tradeVolume', 0);

  return {
    relayers: _.get(result, '[0].relayers', []).map(relayer => ({
      ...relayer,
      stats: {
        ...relayer.stats,
        tradeVolumeShare: (relayer.stats.tradeVolume / totalVolume) * 100,
      },
    })),
    resultCount: _.get(result, '[0].totals[0].relayerCount', 0),
  };
};

module.exports = getRelayersWith24HourStats;