import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { generateProductId, generateSlug } from '../../data/localProductStore';
import { db } from '../../firebase/config';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const ProductForm = ({ product, onClose, onSuccess }) => {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name:        product?.name ?? '',
    description: product?.shortDescription ?? product?.description ?? '',
    basePrice:   product?.basePrice ?? '',
    category:    product?.parentCategoryId ?? product?.category ?? 'celebration-custom-cakes',
    stockStatus: product?.stockStatus ?? 'made-to-order',
    notice:      product?.notice ?? '',
    flavors:     (product?.flavors ?? []).join(', '),
  });

  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(
    product?.images?.[0] ?? product?.image ?? ''
  );
  const [variants,     setVariants]     = useState(product?.variants ?? []);
  const [variantInput, setVariantInput] = useState({ weight: '', price: '' });
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState(null);

  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageSelect = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const addVariant = () => {
    if (!variantInput.weight || !variantInput.price) return;
    setVariants(v => [...v, { weight: variantInput.weight, price: Number(variantInput.price) }]);
    setVariantInput({ weight: '', price: '' });
  };
  const removeVariant = idx => setVariants(v => v.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaveError(null);

    try {
      const id   = isEditing ? product.id : generateProductId();
      const name = formData.name.trim();
      const slug = isEditing ? (product.slug || generateSlug(name)) : generateSlug(name);

      // Store image as base64 data URL directly in Firestore (no Storage needed)
      let images = product?.images ?? [];
      if (imagePreview) {
        images = [imagePreview]; // already base64 from FileReader, or existing URL
      }

      const payload = {
        ...(isEditing ? product : {}),
        id,
        name,
        slug,
        shortDescription: formData.description,
        longDescription:  formData.description,
        description:      formData.description,
        basePrice:        Number(formData.basePrice),
        category:         formData.category,
        categoryId:       formData.category,
        parentCategoryId: formData.category,
        stockStatus:      formData.stockStatus,
        notice:           formData.notice,
        flavors: formData.flavors
          ? formData.flavors.split(',').map(f => f.trim()).filter(Boolean)
          : (product?.flavors ?? []),
        variants,
        images,
        status: 'active',
      };

      // Helper to add a timeout to Firestore calls
      const withTimeout = (promise, ms = 5000) => {
        return Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase operation timed out. Check your Firestore Security Rules.')), ms))
        ]);
      };

      // Save directly to Firestore — onSnapshot in Products.jsx + useProducts
      // will automatically update both the admin table and the website shop
      if (isEditing) {
        await withTimeout(updateDoc(doc(db, 'products', id), {
          ...payload,
          updatedAt: serverTimestamp(),
        }));
      } else {
        await withTimeout(setDoc(doc(db, 'products', id), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }));
      }

      console.log('[CakeParadise] Saved to Firestore:', id);
      onSuccess();
    } catch (err) {
      console.error('Save failed:', err);
      setSaveError(err.message || 'Failed to save. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold font-display text-gray-900">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            {isEditing && <p className="text-xs text-gray-400 mt-0.5">#{product.id?.slice(0, 8)}</p>}
          </div>
          <button type="button" onClick={onClose}
            className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-1 border border-gray-100 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {saveError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <strong>Error:</strong> {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input name="name" type="text" required value={formData.name} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B76E79] outline-none text-sm" />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img src={imagePreview} alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
              )}
              <input type="file" accept="image/*" onChange={handleImageSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#B76E79]/10 file:text-[#B76E79] hover:file:bg-[#B76E79]/20" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea name="description" required rows="3" value={formData.description} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B76E79] outline-none text-sm" />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (LKR) *</label>
              <input name="basePrice" type="number" required min="0" value={formData.basePrice} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B76E79] outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" value={formData.category} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B76E79] outline-none text-sm bg-white">
                <option value="celebration-custom-cakes">Celebration & Custom Cakes</option>
                <option value="wedding-structure-cakes">Wedding & Structure Cakes</option>
                <option value="cupcakes-party">Cupcakes & Party Confectioneries</option>
                <option value="seasonal-specials">Seasonal & Holiday Specials</option>
                <option value="quick-pick-ready">Quick-Pick & Ready Designs</option>
              </select>
            </div>
          </div>

          {/* Stock Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status *</label>
            <select name="stockStatus" value={formData.stockStatus} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B76E79] outline-none text-sm bg-white">
              <option value="in-stock">In Stock</option>
              <option value="made-to-order">Made to Order</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          {/* Advanced */}
          <div className="pt-4 border-t border-gray-100 space-y-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Advanced Configuration</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flavors (comma separated)</label>
              <input name="flavors" type="text" placeholder="e.g. Classic Vanilla, Double Chocolate"
                value={formData.flavors} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B76E79] outline-none text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight & Price Variants</label>
              {variants.length > 0 && (
                <div className="mb-3 space-y-2">
                  {variants.map((v, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                      <span className="font-medium text-gray-700">{v.weight}</span>
                      <span className="text-gray-500">LKR {Number(v.price).toLocaleString()}</span>
                      <button type="button" onClick={() => removeVariant(idx)} className="ml-3 text-red-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-5 gap-2">
                <input type="text" placeholder="Weight (e.g. 1kg)" value={variantInput.weight}
                  onChange={e => setVariantInput(v => ({ ...v, weight: e.target.value }))}
                  className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#B76E79]" />
                <input type="number" placeholder="Price" value={variantInput.price}
                  onChange={e => setVariantInput(v => ({ ...v, price: e.target.value }))}
                  className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#B76E79]" />
                <button type="button" onClick={addVariant}
                  className="flex items-center justify-center bg-gray-100 border border-gray-200 text-gray-600 rounded-lg hover:bg-[#B76E79]/10 hover:border-[#B76E79] transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Notice / Warning</label>
              <input name="notice" type="text" placeholder="e.g. Requires 48 hours notice"
                value={formData.notice} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-300 outline-none text-sm bg-yellow-50 text-yellow-800 placeholder:text-yellow-600/50" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-[#B76E79] text-white rounded-xl hover:bg-[#a6626d] transition-colors text-sm font-semibold disabled:opacity-70 shadow-sm">
              {saving ? 'Saving to Firestore…' : isEditing ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
