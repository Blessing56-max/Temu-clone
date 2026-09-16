import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, X, Image as ImageIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import SellerLayout from '@/components/seller/SellerLayout'
import Button from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import { api } from '@/lib/api'
import { fetchCategories } from '@/store/slices/catalogSlice'
import ProductThumb from '@/components/ProductThumb'

export default function SellerProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const categories = useSelector((s) => s.catalog.categories)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    categoryId: '',
    active: true,
  })
  const [images, setImages] = useState([])
  const [newImage, setNewImage] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories())
  }, [dispatch, categories.length])

  useEffect(() => {
    if (!isEdit) return
    api.get(`/products/${id}`).then((p) => {
      setForm({
        name: p.name || '',
        description: p.description || '',
        price: p.price || '',
        discountPrice: p.discountPrice || '',
        stock: p.stock || '',
        categoryId: p.categoryId || '',
        active: p.active,
      })
      setImages((p.images || []).map((i) => i.url))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id, isEdit])

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  function addImage() {
    if (!newImage.trim()) return
    setImages((arr) => [...arr, newImage.trim()])
    setNewImage('')
  }

  function removeImage(url) {
    setImages((arr) => arr.filter((u) => u !== url))
  }

  async function save() {
    setError(null)
    if (!form.name || !form.price || form.stock === '') {
      setError('Name, price, and stock are required')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stock: Number(form.stock),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      imageUrls: images,
      active: form.active,
    }
    try {
      if (isEdit) await api.put(`/products/${id}`, payload)
      else await api.post('/products', payload)
      navigate('/vendor/products')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const previewProduct = {
    name: form.name,
    price: form.price,
    discountPrice: form.discountPrice,
    categoryName: categories.find((c) => String(c.id) === String(form.categoryId))?.name,
    images: images.map((url, i) => ({ url, position: i })),
  }

  if (loading) {
    return (
      <SellerLayout>
        <div className="text-center py-20 text-onLight/50">Loading...</div>
      </SellerLayout>
    )
  }

  return (
    <SellerLayout>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-onLight/50 hover:text-leaf mb-6">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <h1 className="font-display text-3xl font-semibold mb-8">
            {isEdit ? 'Edit product' : 'Add new product'}
          </h1>

          <div className="bg-white border border-onLight/10 rounded-3xl p-6 md:p-8 space-y-5">
            <Field label="Product name">
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Wireless Bluetooth Headphones" />
            </Field>

            <Field label="Description" hint="What is it, why should someone buy it?">
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-onLight/15 bg-white text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf"
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Price (₦)">
                <Input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="45000" />
              </Field>
              <Field label="Discount price (₦)" hint="Leave blank if no discount">
                <Input type="number" value={form.discountPrice} onChange={(e) => update('discountPrice', e.target.value)} placeholder="38000" />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Stock quantity">
                <Input type="number" value={form.stock} onChange={(e) => update('stock', e.target.value)} placeholder="25" />
              </Field>
              <Field label="Category">
                <Select value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}>
                  <option value="">— No category —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-onLight/80 mb-2">Product images</label>
              <div className="flex gap-2">
                <Input
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="Paste image URL (unsplash, cloudinary, etc.)"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="shrink-0 px-4 rounded-xl bg-ink text-onDark text-sm font-medium hover:bg-canopy transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {images.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-onLight/10 group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute top-1.5 right-1.5 size-6 rounded-full bg-coral text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => update('active', e.target.checked)}
                className="size-4 accent-leaf"
              />
              <span className="text-sm">Active — visible to buyers</span>
            </label>

            {error && <p className="text-sm text-coral">{error}</p>}

            <div className="flex gap-3 pt-4 border-t border-onLight/8">
              <Button onClick={save} loading={saving} disabled={saving}>
                {isEdit ? 'Save changes' : 'Publish product'}
              </Button>
              <Button variant="outline" onClick={() => navigate('/vendor/products')} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <aside className="lg:sticky lg:top-6 h-fit">
          <div className="text-xs text-onLight/45 uppercase tracking-wide mb-3">Preview</div>
          <div className="bg-white border border-onLight/10 rounded-2xl overflow-hidden">
            <div className="aspect-square">
              <ProductThumb product={previewProduct} />
            </div>
            <div className="p-4">
              <div className="font-medium text-sm line-clamp-2">
                {form.name || 'Product name'}
              </div>
              <div className="text-xs text-onLight/45 mt-1">
                {previewProduct.categoryName || 'Category'}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="font-semibold">
                  &#8358;{Number(form.discountPrice || form.price || 0).toLocaleString()}
                </span>
                {form.discountPrice && form.price && (
                  <span className="text-xs text-onLight/35 line-through">
                    &#8358;{Number(form.price).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </SellerLayout>
  )
}