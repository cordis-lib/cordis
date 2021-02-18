import makeCordisError from '@cordis/error';

/**
 * @internal
 */
export const CordisBrokerError = makeCordisError(
  Error,
  {
    brokerNotInit: 'Failed to complete operation, broker has not yet been initalized',
    noResponseInTime: waitingFor => `Did not recieve a response in time, waited for ${waitingFor}`,
    serverFailure: 'Server failed with handling the request'
  }
);

/**
 * @internal
 */
export const CordisBrokerTypeError = makeCordisError(
  TypeError,
  {
    invalidBalance: 'Balance was set, but no redis instance was given',
    missingProperties: (props: string | string[]) => `Given payload is missing required data, ${
      Array.isArray(props)
        ? props.map(e => `"${e}"`).join(', ')
        /* istanbul ignore next */
        : `"${props}"`
    }`
  }
);
