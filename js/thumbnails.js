// Restore thumbnails where YouTube provides them; display a local card if unavailable.
document.querySelectorAll('.video-link img[data-video-id]').forEach(img => {
  let triedAlternative = false;
  img.addEventListener('error', () => {
    if (!triedAlternative) {
      triedAlternative = true;
      img.src = `https://img.youtube.com/vi/${img.dataset.videoId}/mqdefault.jpg`;
    } else {
      img.src = 'images/video-fallback.svg';
      img.alt = 'Video preview unavailable — open the video';
    }
  });
});
