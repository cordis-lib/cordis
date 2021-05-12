import { buildEmbed } from './Embed';

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

  let embed2 = buildEmbed({
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

  embed2 = embed2
    .setAuthor('testing_author_3')
    .setColor(16753920)
    .setDescription('I am testing changing descriptions')
    .setFooter('bing bong', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    .setImage('https://static.wikia.nocookie.net/youtubepoop/images/2/2a/Rick_Ashley.png/revision/latest/scale-to-width-down/340?cb=20130102175058')
    .setThumbnail('https://static.wikia.nocookie.net/youtubepoop/images/2/2a/Rick_Ashley.png/revision/latest/scale-to-width-down/340?cb=20130102175058')
    .setTitle('Never gonna give you up')
    .setURL('http://yahoo.com')
    .addFields({ name: 'never gonna', value: 'let you down', inline: true }, { name: 'never gonna run around and', value: 'desert you' });

  expect(embed2.toJSON()).toMatchObject({
    title: 'Never gonna give you up',
    description: 'I am testing changing descriptions',
    url: 'http://yahoo.com',
    color: 16753920,
    fields: [{ name: 'never gonna', value: 'let you down', inline: true }, { name: 'never gonna run around and', value: 'desert you' }],
    thumbnail: {
      url: 'https://static.wikia.nocookie.net/youtubepoop/images/2/2a/Rick_Ashley.png/revision/latest/scale-to-width-down/340?cb=20130102175058'
    },
    image: {
      url: 'https://static.wikia.nocookie.net/youtubepoop/images/2/2a/Rick_Ashley.png/revision/latest/scale-to-width-down/340?cb=20130102175058'
    },
    author: {
      name: 'testing_author_3'
    },
    type: 'rich',
    footer: {
      text: 'bing bong',
      icon_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    }
  });
});
