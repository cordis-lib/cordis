import { APIEmbed, APIEmbedField, EmbedType } from 'discord-api-types/v8';

export const embed = (embedData: Partial<APIEmbed> = {}) => {
  embedData.fields ??= [];
  embedData.type = EmbedType.Rich;

  return {
    ...Object.freeze(embedData),
    toJSON: () => embedData,

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
    addFields(...data: APIEmbedField[]) {
      return embed({ ...this, fields: embedData.fields?.concat(data) ?? [] });
    }
  };
};
