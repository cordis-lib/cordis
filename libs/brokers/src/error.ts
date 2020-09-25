import { makeCordisError } from '@cordis/util';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CordisBrokerError = makeCordisError(
  Error,
  {
    brokerNotInit: 'Failed to complete operation, broker has not yet been initalized',
    noResponseInTime: waitingFor => `Did not recieve a response in time, waited for ${waitingFor}`
  }
);

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CordisBrokerTypeError = makeCordisError(
  TypeError,
  {
    invalidBalance: 'Balance was set to true, but no redis instance was given',
    missingProperties: (props: string | string[]) =>
      `Given payload is missing required data, ${Array.isArray(props) ? props.map(e => `"${e}"`).join(', ') : `"${props}"`}`
  }
);
