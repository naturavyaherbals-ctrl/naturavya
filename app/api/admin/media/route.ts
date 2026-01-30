export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch media library
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminClient = createAdminClient();

    const folder = searchParams.get('folder');
    const fileType = searchParams.get('fileType');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('media_library')
      .select('*', { count: 'exact' });

    if (folder) query = query.eq('folder', folder);
    if (fileType) query = query.eq('file_type', fileType);
    if (search) {
      query = query.or(`filename.ilike.%${search}%,title.ilike.%${search}%,alt_text.ilike.%${search}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Get folder list
    const { data: folders } = await adminClient
      .from('media_library')
      .select('folder')
      .order('folder');

    const uniqueFolders = [...new Set((folders || []).map(f => f.folder))];

    return NextResponse.json({
      success: true,
      media: data,
      folders: uniqueFolders,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Media fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch media' }, { status: 500 });
  }
}

// POST - Upload media
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    const altText = formData.get('altText') as string || '';
    const title = formData.get('title') as string || '';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
    const filePath = `${folder}/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('media')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = adminClient.storage
      .from('media')
      .getPublicUrl(filePath);

    // Determine file type
    let fileType = 'other';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type.includes('pdf')) fileType = 'pdf';
    else if (file.type.includes('document') || file.type.includes('word')) fileType = 'document';

    // Save to database
    const { data: media, error: dbError } = await adminClient
      .from('media_library')
      .insert({
        filename,
        original_filename: file.name,
        file_type: fileType,
        file_size: file.size,
        mime_type: file.type,
        url: urlData.publicUrl,
        alt_text: altText || file.name,
        title: title || file.name,
        folder,
        uploaded_by: user.id,
      })
      .select('*')
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload media' }, { status: 500 });
  }
}

// DELETE - Delete media
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Media ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Get media info
    const { data: media } = await adminClient
      .from('media_library')
      .select('filename, folder')
      .eq('id', id)
      .single();

    if (media) {
      // Delete from storage
      await adminClient.storage
        .from('media')
        .remove([`${media.folder}/${media.filename}`]);
    }

    // Delete from database
    const { error } = await adminClient
      .from('media_library')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete media' }, { status: 500 });
  }
}