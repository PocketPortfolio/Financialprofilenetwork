/**
 * Blog Posts Health Check Endpoint
 * Verifies all published posts have valid files
 * Used for monitoring and debugging production issues
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HealthCheckResult {
  slug: string;
  title: string;
  status: 'healthy' | 'missing_file' | 'empty_file' | 'invalid_frontmatter' | 'empty_content' | 'missing_image';
  issues: string[];
  filePath: string;
  imagePath: string;
  fileExists: boolean;
  imageExists: boolean;
  fileSize: number;
  imageSize: number;
}

export async function GET() {
  try {
    const postsDir = path.join(process.cwd(), 'content', 'posts');
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'blog');
    
    if (!fs.existsSync(postsDir)) {
      return NextResponse.json({
        status: 'error',
        message: 'Posts directory does not exist',
        postsDir,
      }, { status: 500 });
    }

    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.mdx'));
    const results: HealthCheckResult[] = [];
    let healthyCount = 0;
    let unhealthyCount = 0;

    for (const file of files) {
      const slug = file.replace('.mdx', '');
      const filePath = path.join(postsDir, file);
      const imagePath = path.join(imagesDir, `${slug}.png`);
      
      const result: HealthCheckResult = {
        slug,
        title: 'Unknown',
        status: 'healthy',
        issues: [],
        filePath,
        imagePath,
        fileExists: fs.existsSync(filePath),
        imageExists: fs.existsSync(imagePath),
        fileSize: 0,
        imageSize: 0,
      };

      // Check file existence
      if (!result.fileExists) {
        result.status = 'missing_file';
        result.issues.push('MDX file does not exist');
        unhealthyCount++;
        results.push(result);
        continue;
      }

      // Check file size
      try {
        const fileStats = fs.statSync(filePath);
        result.fileSize = fileStats.size;
        
        if (fileStats.size === 0) {
          result.status = 'empty_file';
          result.issues.push('MDX file is empty (0 bytes)');
          unhealthyCount++;
          results.push(result);
          continue;
        }
      } catch (error: any) {
        result.status = 'missing_file';
        result.issues.push(`Cannot read file stats: ${error.message}`);
        unhealthyCount++;
        results.push(result);
        continue;
      }

      // Check file content
      try {
        const fileContents = fs.readFileSync(filePath, 'utf-8');
        
        if (!fileContents || fileContents.trim().length === 0) {
          result.status = 'empty_content';
          result.issues.push('File contents are empty');
          unhealthyCount++;
          results.push(result);
          continue;
        }

        // Parse frontmatter
        const parsed = matter(fileContents);
        
        if (!parsed.data || !parsed.data.title) {
          result.status = 'invalid_frontmatter';
          result.issues.push('Frontmatter missing required fields (title)');
          unhealthyCount++;
          results.push(result);
          continue;
        }
        
        result.title = parsed.data.title;

        if (!parsed.content || parsed.content.trim().length === 0) {
          result.status = 'empty_content';
          result.issues.push('Content body is empty');
          unhealthyCount++;
          results.push(result);
          continue;
        }
      } catch (error: any) {
        result.status = 'invalid_frontmatter';
        result.issues.push(`Failed to parse MDX: ${error.message}`);
        unhealthyCount++;
        results.push(result);
        continue;
      }

      // Check image
      if (fs.existsSync(imagePath)) {
        try {
          const imageStats = fs.statSync(imagePath);
          result.imageSize = imageStats.size;
          
          if (imageStats.size === 0) {
            result.status = 'missing_image';
            result.issues.push('Image file is empty (0 bytes)');
            unhealthyCount++;
          }
        } catch (error: any) {
          result.status = 'missing_image';
          result.issues.push(`Cannot read image stats: ${error.message}`);
          unhealthyCount++;
        }
      } else {
        result.status = 'missing_image';
        result.issues.push('Image file does not exist');
        unhealthyCount++;
      }

      if (result.status === 'healthy') {
        healthyCount++;
      }
      
      results.push(result);
    }

    const overallStatus = unhealthyCount === 0 ? 'healthy' : 'unhealthy';

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        healthy: healthyCount,
        unhealthy: unhealthyCount,
      },
      results: results.sort((a, b) => {
        // Sort unhealthy posts first
        if (a.status !== 'healthy' && b.status === 'healthy') return -1;
        if (a.status === 'healthy' && b.status !== 'healthy') return 1;
        return a.slug.localeCompare(b.slug);
      }),
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[Blog Health Check] Error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

