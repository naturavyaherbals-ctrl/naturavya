export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    // 1. Get Current Logged-in User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch the Team Member profile to check Role and ID
    const { data: member } = await supabase
      .from('team_members')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    // 3. Get pagination params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 4. Start Base Query
    let query = supabase
      .from('leads')
      .select('*, assigned_team_member:team_members(id, name)', { count: 'exact' });

    // 5. 🛡️ DATA PRIVACY LOGIC
    // Normalize role string (handles 'Super Admin' or 'agent' correctly)
    const role = member?.role?.toLowerCase().replace(' ', '_');

    if (role === 'agent') {
      // Agents can ONLY see leads assigned to their specific Team Member ID
      query = query.eq('assigned_to', member.id);
    } 
    // Managers/Admins/SuperAdmins fall through and see everything

    // 6. Execute Query
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database Error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message, 
        data: [] 
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error: any) {
    console.error('Critical Crash:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal Server Error', 
      data: [] 
    }, { status: 500 });
  }
}