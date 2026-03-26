import dashboard_pic from '../assets/images/dashboard_pic.jpg';
import status_page_pic from '../assets/images/status-page-placeholder.png';

interface ShowBlurImageProps {
  forPage: string;
}

export default function ShowBlurImage({ forPage }: ShowBlurImageProps) {
  let imgSrc = null;
  if (forPage === 'dashboard') {
    imgSrc = dashboard_pic;
  } else if (forPage === 'status_page') {
    imgSrc = status_page_pic;
  }
  if (!imgSrc) return null;
  return (
    <img
      src={imgSrc}
      alt="Blurred background"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: '50%',
        transition: 'opacity 0.5s',
      }}
    />
  );
}
