import Embed from './Embed';

test('Dataless value checks', () => {
  const embed = new Embed({});
  expect(embed.author).toBe(null);
  expect(embed.color).toBe(null);
  expect(embed.description).toBe(null);
  expect(embed.footer).toBe(null);
  expect(embed.fields).toStrictEqual([]);
  expect(embed.image).toBe(null);
  expect(embed.provider).toBe(null);
  expect(embed.thumbnail).toBe(null);
  expect(embed.timestamp).toBe(null);
  expect(embed.title).toBe(null);
  expect(embed.author).toBe(null);
  expect(embed.url).toBe(null);
  expect(embed.video).toBe(null);
});

test('Data value checks', () => {
  const timestamp = '2021-03-08T14:40:27.875Z';
  const color = 16753920;

  const embed = new Embed({
    title: 'testing title!',
    description: 'testing description',
    url: 'https://google.com',
    timestamp,
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
  });

  expect(embed.timestamp).toBe(new Date(timestamp).getTime());
  expect(embed.color).toBe(color);
  expect(embed.fields).toStrictEqual([]);
});
