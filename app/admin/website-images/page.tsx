'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Upload, ImageIcon, Loader2, Save } from 'lucide-react'

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export default function WebsiteImagesPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState<number | null>(null)

  // 1. Fetch Assets
  const fetchAssets = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('site_assets')
      .select('*')
      .order('section', { ascending: true })
      .order('id', { ascending: true }) // Secondary sort

    if (error) console.error('Error:', error)
    else setAssets(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  // 2. Handle File Upload
  const handleUpload = async (assetId: number, assetKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploadingId(assetId)
    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    // We name the file using the asset_key (e.g., 'header_logo.png') 
    // This way, the new file always overwrites the old one in storage to save space
    const filePath = `${assetKey}-${Date.now()}.${fileExt}`

    try {
      // A. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('website-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // B. Get Public URL
      const { data: urlData } = supabase.storage
        .from('website-assets')
        .getPublicUrl(filePath)

      // C. Update Database Record
      const { error: dbError } = await supabase
        .from('site_assets')
        .update({ image_url: urlData.publicUrl, updated_at: new Date() })
        .eq('id', assetId)

      if (dbError) throw dbError

      // D. Update Local State
      setAssets(prev => prev.map(item => 
        item.id === assetId ? { ...item, image_url: urlData.publicUrl } : item
      ))

    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploadingId(null)
    }
  }

  // 3. Group Assets by Section Helper
  const groupedAssets = assets.reduce((acc, asset) => {
    (acc[asset.section] = acc[asset.section] || []).push(asset)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Website Images</h1>
        <p className="text-gray-500 text-sm">Update your logo, banners, and other site assets directly.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading assets...</div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedAssets).map(([section, items]) => (
            <div key={section} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">{section}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((asset) => (
                  <div key={asset.id} className="group relative">
                    
                    {/* Label */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{asset.label}</span>
                      <span className="text-xs text-gray-400 font-mono">{asset.asset_key}</span>
                    </div>

                    {/* Image Preview Box */}
                    <div className="aspect-video w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden relative flex items-center justify-center">
                      {asset.image_url ? (
                        <img 
                          src={asset.image_url} 
                          alt={asset.label} 
                          className="w-full h-full object-contain bg-white" 
                        />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="mx-auto text-gray-300 mb-2" size={32} />
                          <span className="text-xs text-gray-400">No Image Set</span>
                        </div>
                      )}

                      {/* Loading Overlay */}
                      {uploadingId === asset.id && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                          <Loader2 className="animate-spin text-green-600" size={32} />
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="mt-3">
                      <label className={`
                        flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer
                        ${uploadingId === asset.id ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm'}
                      `}>
                        <Upload size={16} />
                        {asset.image_url ? 'Replace Image' : 'Upload Image'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          disabled={uploadingId === asset.id}
                          onChange={(e) => handleUpload(asset.id, asset.asset_key, e)}
                        />
                      </label>
                    </div>
                    
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {assets.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed">
          <p className="text-gray-500">No image slots found.</p>
          <p className="text-sm text-gray-400 mt-1">Please run the SQL setup script to create the slots.</p>
        </div>
      )}
    </div>
  )
}