import { buildEmbed } from './embed';

test('Dataless value checks', () => {
  const embed1 = buildEmbed({});
  expect(embed1.author).toBe(undefined);
  expect(embed1.color).toBe(undefined);
  expect(embed1.description).toBe(undefined);
  expect(embed1.footer).toBe(undefined);
  expect(embed1.fields).toStrictEqual([]);
  expect(embed1.image).toBe(undefined);
  expect(embed1.provider).toBe(undefined);
  expect(embed1.thumbnail).toBe(undefined);
  expect(embed1.timestamp).toBe(undefined);
  expect(embed1.title).toBe(undefined);
  expect(embed1.author).toBe(undefined);
  expect(embed1.url).toBe(undefined);
  expect(embed1.video).toBe(undefined);
});

test('Data value checks', () => {
  const date = new Date('2021-03-08T14:40:27.875Z');
  const color = 16753920;

  const embed2 = buildEmbed({
    title: 'testing title!',
    description: 'testing description',
    url: 'https://google.com',
    color,
    fields: [],
    thumbnail: {
      url: 'https://google.com'
    },
    image: {
      url: 'https://lh3.googleusercontent.com/proxy/K6J0xWzyfl729xgnZLj55qd5L0us_QN7m5MbcQgV09xP-HVw8Z_iJDwpXexcy87ZkHHrins6rMFwPahgPI-VI_il_gedMlBD7IIll_0e4AZNBg'
    },
    author: {
      name: 'Test Author'
    },
    footer: {
      text: 'Test Footer'
    }
  }).setTimestamp(date.getTime());

  expect(embed2.timestamp).toBe(date.toString());
  expect(embed2.color).toBe(color);
  expect(embed2.fields).toStrictEqual([]);
});
