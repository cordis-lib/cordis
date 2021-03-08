import { APIEmbed, APIEmbedAuthor, APIEmbedImage, APIEmbedProvider, APIEmbedFooter, APIEmbedField, APIEmbedThumbnail, APIEmbedVideo } from 'discord-api-types/v8';

export default class Embed {
  public author: APIEmbedAuthor | null = null;
  public color: number | null = null;
  public description: string | null = null;
  public fields: APIEmbedField[] = [];
  public footer: APIEmbedFooter | null = null;
  public image: APIEmbedImage | null = null;
  public provider: APIEmbedProvider | null = null;
  public thumbnail: APIEmbedThumbnail | null = null;
  public timestamp: number | null = null;
  public title: string | null = null;
  public type = 'rich';
  public url: string | null = null;
  public readonly video: APIEmbedVideo | null = null;

  public constructor(data?: APIEmbed) {
    if (data) {
      if ('author' in data) this.author = data.author ?? null;
      if ('color' in data) this.color = data.color ?? null;
      if ('description' in data) this.description = data.description ?? null;
      if ('footer' in data) this.footer = data.footer ?? null;
      if ('image' in data) this.image = data.image ?? null;
      if ('provider' in data) this.provider = data.provider ?? null;
      if ('thumbnail' in data) this.thumbnail = data.thumbnail ?? null;
      if ('timestamp' in data) this.timestamp = data.timestamp ? Date.parse(data.timestamp) : null;
      if ('title' in data) this.title = data.title ?? null;
      if ('url' in data) this.url = data.url ?? null;
      if ('video' in data) this.video = data.video ?? null;
    }
  }

  public toJSON() {
    const { author, color, description, footer, image, provider, thumbnail, timestamp, title, url, video } = this;

    return {
      author,
      color,
      description,
      footer,
      image,
      provider,
      thumbnail,
      timestamp,
      title,
      url,
      video
    };
  }
}
