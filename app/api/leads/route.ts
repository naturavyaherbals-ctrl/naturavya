export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    // Get params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Fetch leads
    const { data, error, count } = await supabase
      .from('leads')
      .select('*, assigned_team_member:team_members(id, name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database Error:', error);
      return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 200 });
    }

    // ✅ ALWAYS return a NextResponse.json
    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        limit
      }
    });

  } catch (error: any) {
    console.error('Critical Crash:', error);
    // ✅ Even on total crash, return JSON
    return NextResponse.json({ success: false, error: 'Internal Server Error', data: [] }, { status: 500 });
  }
}