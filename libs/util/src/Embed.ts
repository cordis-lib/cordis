import { APIEmbed, APIEmbedAuthor, APIEmbedImage, APIEmbedProvider, APIEmbedFooter, APIEmbedField, APIEmbedThumbnail, APIEmbedVideo, EmbedType } from 'discord-api-types/v8';

export const embed = (data?: Partial<APIEmbed>) => {
  const author: APIEmbedAuthor | undefined = data?.author;
  const color: number | undefined = data?.color;
  const description: string | undefined = data?.description;
  const fields: APIEmbedField[] = data?.fields ?? [];
  const footer: APIEmbedFooter | undefined = data?.footer;
  const image: APIEmbedImage | undefined = data?.image;
  const provider: APIEmbedProvider | undefined = data?.provider;
  const thumbnail: APIEmbedThumbnail | undefined = data?.thumbnail;
  const timestamp: string | undefined = data?.timestamp;
  const title: string | undefined = data?.title;
  const type: EmbedType = EmbedType.Rich;
  const url: string | undefined = data?.url;
  const video: APIEmbedVideo | undefined = data?.video;

  return {
    ...Object.freeze({ author, color, description, fields, footer, image, provider, thumbnail, timestamp, title, type, url, video }),
    toJSON: () => ({
      author,
      color,
      description,
      footer,
      image,
      fields,
      type,
      provider,
      thumbnail,
      timestamp,
      title,
      url,
      video
    }),

    setAuthor(name: string, url?: string, icon_url?: string, proxy_icon_url?: string) {
      return embed({ ...this, author: { name, url, icon_url, proxy_icon_url } });
    },
    setColor(color: number) {
      return embed({ ...this, color });
    },
    setDescription(description: string) {
      return embed({ ...this, description });
    },
    setFooter(text: string, icon_url?: string, proxy_icon_url?: string) {
      return embed({ ...this, footer: { text, icon_url, proxy_icon_url } });
    },
    setImage(url: string, proxy_url?: string, height?: number, width?: number) {
      return embed({ ...this, image: { url, proxy_url, height, width } });
    },
    setThumbnail(url: string, proxy_url?: string, height?: number, width?: number) {
      return embed({ ...this, thumbnail: { url, proxy_url, height, width } });
    },
    setTitle(title: string) {
      return embed({ ...this, title });
    },
    setURL(url: string) {
      return embed({ ...this, url });
    },
    setTimestamp(timestamp: Date | number = Date.now()) {
      return embed({ ...this, timestamp: timestamp.toString() });
    },
    addField(name: string, value: string, inline = false) {
      return this.addFields({ name, value, inline });
    },
    addFields(...data: APIEmbedField[]) {
      return embed({ ...this, fields: fields.concat(data) });
    }
  };
};
