'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Video {
  id: number;
  title: string;
  description: string;
  videoUrl: string | null;
  status: string;
  error?: string;
}

function VideosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const videosParam = searchParams.get('videos');
    if (!videosParam) {
      router.push('/');
      return;
    }

    try {
      const parsedVideos = JSON.parse(videosParam);
      setVideos(parsedVideos);
    } catch (error) {
      console.error('Error parsing videos:', error);
      router.push('/');
    }
  }, [searchParams, router]);

  const successfulVideos = videos.filter(v => v.status === 'completed');
  const failedVideos = videos.filter(v => v.status === 'failed');

  const downloadVideo = async (videoUrl: string, filename: string) => {
    try {
      // For local files, just create a download link
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `${filename}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading video:', error);
    }
  };

  const downloadAll = () => {
    successfulVideos.forEach((video, index) => {
      if (video.videoUrl) {
        setTimeout(() => {
          downloadVideo(video.videoUrl!, `scenario-${video.id}-${video.title.slice(0, 30)}`);
        }, index * 500);
      }
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Generated Videos
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
            >
              Start Over
            </button>
            {successfulVideos.length > 0 && (
              <button
                onClick={downloadAll}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
              >
                Download All ({successfulVideos.length})
              </button>
            )}
          </div>
        </div>

        {failedVideos.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-semibold mb-2">
              {failedVideos.length} video{failedVideos.length > 1 ? 's' : ''} failed to generate
            </p>
            <ul className="text-sm text-red-600">
              {failedVideos.map(video => (
                <li key={video.id}>
                  {video.title}: {video.error || 'Unknown error'}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {successfulVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-video bg-gray-100">
                {video.videoUrl && (
                  <video
                    controls
                    className="w-full h-full object-cover"
                    src={video.videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{video.description}</p>
                {video.videoUrl && (
                  <button
                    onClick={() => downloadVideo(video.videoUrl!, `scenario-${video.id}-${video.title.slice(0, 30)}`)}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
                  >
                    Download Video
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No videos to display</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function VideosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <VideosContent />
    </Suspense>
  );
}