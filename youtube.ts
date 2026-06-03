export function youtubeEmbedUrl(id: string, autoplay: boolean = false) {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1'
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}