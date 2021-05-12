import { APIEmbed, APIEmbedField, EmbedType } from 'discord-api-types/v8';

export const buildEmbed = (embedData: Partial<APIEmbed> = {}) => {
  embedData.fields ??= [];
  embedData.type = EmbedType.Rich;

  return {
    ...Object.freeze(embedData),
    toJSON: () => embedData,

    setAuthor(name: string, url?: string, icon_url?: string, proxy_icon_url?: string) {
      return buildEmbed({ ...this, author: { name, url, icon_url, proxy_icon_url } });
    },
    setColor(color: number) {
      return buildEmbed({ ...this, color });
    },
    setDescription(description: string) {
      return buildEmbed({ ...this, description });
    },
    setFooter(text: string, icon_url?: string, proxy_icon_url?: string) {
      return buildEmbed({ ...this, footer: { text, icon_url, proxy_icon_url } });
    },
    setImage(url: string, proxy_url?: string, height?: number, width?: number) {
      return buildEmbed({ ...this, image: { url, proxy_url, height, width } });
    },
    setThumbnail(url: string, proxy_url?: string, height?: number, width?: number) {
      return buildEmbed({ ...this, thumbnail: { url, proxy_url, height, width } });
    },
    setTitle(title: string) {
      return buildEmbed({ ...this, title });
    },
    setURL(url: string) {
      return buildEmbed({ ...this, url });
    },
    setTimestamp(timestamp: Date | number = new Date()) {
      if (typeof timestamp === 'number') timestamp = new Date(timestamp);
      return buildEmbed({ ...this, timestamp: timestamp.toString() });
    },
    addFields(...data: APIEmbedField[]) {
      return buildEmbed({ ...this, fields: embedData.fields?.concat(data) ?? data });
    }
  };
};
