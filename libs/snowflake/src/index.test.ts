import { Snowflake, getCreationData } from './';

const ID = '223703707118731264';
const CREATED_AT = 1473405519991;

test('deconstructing a known existing snowflake', () => {
  const snowflake = new Snowflake(ID);
  expect(Object.isFrozen(snowflake)).toBe(true);
  expect(snowflake.timestamp).toBe(CREATED_AT);
  expect(snowflake.date.getTime()).toBe(CREATED_AT);
  expect(snowflake.workerId).toBe(0);
  expect(snowflake.processId).toBe(0);
  expect(snowflake.increment).toBe(0);
  expect(`${snowflake}`).toBe(`${ID}`);
});

test('getting creation data from a known snowflake', () => {
  const data = getCreationData(ID);
  expect(Object.isFrozen(data)).toBe(true);

  const { createdAt, createdTimestamp } = data;
  expect(createdAt.getTime()).toBe(CREATED_AT);
  expect(createdTimestamp).toBe(CREATED_AT);
});

test('it to handle an existing instance well', () => {
  const instance = new Snowflake(ID);
  const { createdTimestamp } = getCreationData(instance);
  expect(createdTimestamp).toBe(CREATED_AT);
});
