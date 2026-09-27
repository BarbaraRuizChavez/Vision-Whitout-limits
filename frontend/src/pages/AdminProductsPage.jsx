import { useEffect, useRef, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';
import { formatPrice } from '../utils';

const EMPTY_FORM = {
  slug: '', name: '', category: 'baston', description: '',
  imageAlt: '', price: '', stock: '', features: '',
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('cargando');
  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef(null);

  function loadProducts() {
    setStatus('cargando');
    getProducts()
      .then((data) => {
        setProducts(data);
        setStatus('listo');
      })
      .catch(() => setStatus('error'));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function startEdit(product) {
    setEditingId(product.id);
    setImagePreview(product.image_url || '');
    setForm({
      slug: product.slug,
      name: product.name,
      category: product.category,
      description: product.description,
      imageAlt: product.image_alt,
      price: (product.price_cents / 100).toString(),
      stock: product.stock.toString(),
      features: (product.features || []).join(', '),
    });
    requestAnimationFrame(() => document.getElementById('titulo-formulario')?.focus());
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImagePreview('');
    setErrors([]);
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setErrors(['La imagen debe pesar menos de 1.5 MB.']);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    const base64 = await fileToBase64(file);
    setImagePreview(base64);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);

    const priceCents = Math.round(parseFloat(form.price) * 100);
    const stock = parseInt(form.stock, 10);
    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      imageAlt: form.imageAlt.trim(),
      imageUrl: imagePreview || null,
      priceCents: Number.isNaN(priceCents) ? -1 : priceCents,
      stock: Number.isNaN(stock) ? -1 : stock,
      features: form.features.split(',').map((f) => f.trim()).filter(Boolean),
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      cancelEdit();
      loadProducts();
    } catch (err) {
      setErrors([err.message]);
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`¿Borrar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteProduct(product.id);
      loadProducts();
    } catch (err) {
      setErrors([err.message]);
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  return (
    <main id="contenido" tabIndex={-1} className="container section">
      <h1>Administrar productos</h1>

      {errors.length > 0 && (
        <div className="error-summary" ref={errorRef} tabIndex={-1} role="alert">
          <ul>
            {errors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="admin-form-section" aria-labelledby="titulo-formulario">
        <h2 id="titulo-formulario" tabIndex={-1}>
          {editingId ? `Editando: ${form.name}` : 'Agregar producto nuevo'}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="f-slug">Slug (identificador único en la URL)</label>
              <input id="f-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            </div>
            <div className="form-field">
              <label htmlFor="f-name">Nombre</label>
              <input id="f-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-field">
              <label htmlFor="f-category">Categoría</label>
              <select id="f-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="baston">Bastón</option>
                <option value="lentes">Lentes</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="f-price">Precio (MXN, ej. 3500.00)</label>
              <input id="f-price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="form-field">
              <label htmlFor="f-stock">Existencias</label>
              <input id="f-stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            </div>
            <div className="form-field">
              <label htmlFor="f-image">Foto del producto</label>
              <input id="f-image" type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <img src={imagePreview} alt="Vista previa de la foto del producto" className="product-image-preview" />
              )}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="f-image-alt">Texto alternativo de la imagen (para lectores de pantalla)</label>
            <input id="f-image-alt" value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} required />
          </div>

          <div className="form-field">
            <label htmlFor="f-description">Descripción</label>
            <textarea id="f-description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>

          <div className="form-field">
            <label htmlFor="f-features">Características (separadas por comas)</label>
            <input id="f-features" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Plegable, Sensor de proximidad, Batería recargable" />
          </div>

          <div className="form-actions">
            <button type="submit" className="button button-primary" disabled={submitting}>
              {submitting ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Agregar producto'}
            </button>
            {editingId && (
              <button type="button" className="button" onClick={cancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <h2>Catálogo actual</h2>

      {status === 'cargando' && <p>Cargando productos…</p>}
      {status === 'error' && <p role="alert">No se pudo cargar el catálogo.</p>}

      {status === 'listo' && (
        <div className="cart-table-wrapper">
          <table className="cart-table">
            <caption className="sr-only">Lista de productos con opciones para editar o borrar cada uno</caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Categoría</th>
                <th scope="col">Precio</th>
                <th scope="col">Stock</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <th scope="row">{p.name}</th>
                  <td>{p.category}</td>
                  <td>{formatPrice(p.price_cents)}</td>
                  <td>{p.stock}</td>
                  <td className="table-actions">
                    <button type="button" className="button" onClick={() => startEdit(p)} aria-label={`Editar ${p.name}`}>
                      Editar
                    </button>
                    <button type="button" className="button" onClick={() => handleDelete(p)} aria-label={`Borrar ${p.name}`}>
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
