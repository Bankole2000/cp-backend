export const getTagsFromCaption = (caption: string) => {
  const tags = caption.match(/#\w+/g);
  return tags ? [...new Set(tags.map((tag: string) => tag.slice(1).toLowerCase()))] : [];
};

export const getUrlsFromCaption = (caption: string) => {
  const urls = caption.match(/(https?:\/\/(?:www\.|(?!www))[^\s\\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi);
  console.log({ urls });
  return urls ? [...new Set(urls)] : [];
};
