const _ = require('lodash');

/**
 * Build an elasticsearch query to filter fills by a specified date range and set of params.
 * The resulting query object can be provided to an elasticsearch search operation.
 *
 * @param {Date} dateFrom
 * @param {Date} dateTo
 * @param {object} params
 */
const buildFillsQuery = params => {
  const {
    address,
    bridgeAddress,
    bridged,
    dateFrom,
    dateTo,
    protocolVersion,
    query,
    relayerId,
    status,
    token,
    valueFrom,
    valueTo,
  } = params;

  const filters = [];
  const exclusions = [];

  if (dateFrom !== undefined || dateTo !== undefined) {
    filters.push({
      range: {
        date: {
          gte: dateFrom !== undefined ? dateFrom.toISOString() : undefined,
          lte: dateTo !== undefined ? dateTo.toISOString() : undefined,
        },
      },
    });
  }

  if (valueFrom !== undefined || valueTo !== undefined) {
    filters.push({
      range: {
        value: {
          gte: valueFrom !== undefined ? valueFrom : undefined,
          lte: valueTo !== undefined ? valueTo : undefined,
        },
      },
    });
  }

  if (_.isFinite(relayerId)) {
    filters.push({ term: { relayerId } });
  }

  if (_.isNull(relayerId)) {
    exclusions.push({
      exists: {
        field: 'relayerId',
      },
    });
  }

  if (_.isFinite(protocolVersion)) {
    filters.push({ term: { protocolVersion } });
  }

  if (_.isString(token)) {
    filters.push({ match_phrase: { 'assets.tokenAddress': token } });
  }

  if (_.isString(address)) {
    filters.push({
      multi_match: {
        fields: ['maker', 'taker'],
        query: address,
        type: 'phrase',
      },
    });
  }

  if (_.isString(query)) {
    filters.push({
      multi_match: {
        fields: [
          'feeRecipient',
          'maker',
          'orderHash',
          'senderAddress',
          'taker',
          'transactionHash',
        ],
        query,
        type: 'phrase',
      },
    });
  }

  if (_.isNumber(status)) {
    filters.push({ term: { status } });
  }

  if (_.isString(bridgeAddress)) {
    filters.push({ match_phrase: { 'assets.bridgeAddress': bridgeAddress } });
  }

  if (_.isBoolean(bridged)) {
    if (bridged) {
      filters.push({
        exists: {
          field: 'assets.bridgeAddress',
        },
      });
    } else {
      exclusions.push({
        exists: {
          field: 'assets.bridgeAddress',
        },
      });
    }
  }

  return filters.length === 0 && exclusions.length === 0
    ? undefined
    : {
        bool: { filter: filters, must_not: exclusions },
      };
};

module.exports = buildFillsQuery;