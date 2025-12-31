'use client';

interface ShareButtonsProps {
  userId: string;
}

export default function ShareButtons({ userId }: ShareButtonsProps) {
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const copyMarkdown = async () => {
    try {
      const markdown = `[View Portfolio Performance](https://www.pocketportfolio.app/share/${userId})`;
      await navigator.clipboard.writeText(markdown);
      alert('Markdown copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy markdown:', error);
    }
  };

  return (
    <>
      <button
        onClick={copyLink}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Copy Link
      </button>
      <button
        onClick={copyMarkdown}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        Copy as Markdown
      </button>
    </>
  );
}









