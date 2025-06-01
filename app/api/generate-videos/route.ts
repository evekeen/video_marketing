import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { scenarios } = await request.json();
    
    // Create videos directory if it doesn't exist
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    await mkdir(videosDir, { recursive: true });
    
    const videoPromises = scenarios.map(async (scenario: any) => {
      try {
        const output = await replicate.run("google/veo-2", {
          input: {
            prompt: `${scenario.title}: ${scenario.description}`
          }
        }) as any;
        
        // The output might be a URL, buffer, or ReadableStream
        let videoUrl = '';
        let filename = `video-${scenario.id}-${Date.now()}.mp4`;
        let publicPath = `/videos/${filename}`;
        let fullPath = path.join(videosDir, filename);
        
        if (typeof output === 'string') {
          // If it's a URL, we need to download it
          const response = await fetch(output);
          const buffer = await response.arrayBuffer();
          await writeFile(fullPath, Buffer.from(buffer));
          videoUrl = publicPath;
        } else if (Buffer.isBuffer(output)) {
          // If it's already a buffer, save it directly
          await writeFile(fullPath, output);
          videoUrl = publicPath;
        } else if (output && typeof output === 'object') {
          // Handle ReadableStream
          if (output instanceof ReadableStream || (output.constructor && output.constructor.name === 'ReadableStream')) {
            console.log('Handling ReadableStream output');
            const reader = output.getReader();
            const chunks: Uint8Array[] = [];
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              chunks.push(value);
            }
            
            const buffer = Buffer.concat(chunks);
            await writeFile(fullPath, buffer);
            videoUrl = publicPath;
          } else {
            // Handle other possible response formats
            console.log('Replicate output format:', output);
            // Try to extract URL from object
            const extractedUrl = output.url || output.video_url || output.output;
            
            if (extractedUrl && typeof extractedUrl === 'string' && extractedUrl.startsWith('http')) {
              // Download from URL
              const response = await fetch(extractedUrl);
              const buffer = await response.arrayBuffer();
              await writeFile(fullPath, Buffer.from(buffer));
              videoUrl = publicPath;
            } else {
              throw new Error(`Unexpected output format: ${JSON.stringify(output).slice(0, 200)}`);
            }
          }
        }
        
        return {
          id: scenario.id,
          title: scenario.title,
          description: scenario.description,
          videoUrl: videoUrl,
          status: 'completed'
        };
      } catch (error) {
        console.error(`Error generating video for scenario ${scenario.id}:`, error);
        return {
          id: scenario.id,
          title: scenario.title,
          description: scenario.description,
          videoUrl: null,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
    
    const results = await Promise.all(videoPromises);
    
    return NextResponse.json({ videos: results });
  } catch (error) {
    console.error('Error generating videos:', error);
    return NextResponse.json(
      { error: 'Failed to generate videos' },
      { status: 500 }
    );
  }
}