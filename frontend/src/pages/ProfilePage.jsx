import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const [photoPreview, setPhotoPreview] = useState(user?.photoUrl || '');
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef(null);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setErrors(['La foto debe pesar menos de 1.5 MB.']);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    const base64 = await fileToBase64(file);
    setPhotoPreview(base64);
  }

  function removePhoto() {
    setPhotoPreview('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setErrors(['El nombre y el apellido son obligatorios.']);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        photoUrl: photoPreview || null,
      });
      setSuccessMessage('Tu perfil se actualizó correctamente.');
    } catch (err) {
      setErrors([err.message]);
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="contenido" tabIndex={-1} className="container section">
      <h1>Configurar mi perfil</h1>

      {errors.length > 0 && (
        <div className="error-summary" ref={errorRef} tabIndex={-1} role="alert">
          <ul>
            {errors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {successMessage && (
        <p role="status" className="profile-success">
          {successMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="profile-form">
        <div className="form-field">
          <label htmlFor="f-firstname">Nombre</label>
          <input
            id="f-firstname"
            type="text"
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
        </div>

        <div className="form-field">
          <label htmlFor="f-lastname">Apellido</label>
          <input
            id="f-lastname"
            type="text"
            autoComplete="family-name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>

        <div className="form-field">
          <span className="form-field-static-label">Correo electrónico</span>
          <p className="profile-readonly-value">{user?.email}</p>
        </div>

        <div className="form-field">
          <label htmlFor="f-photo">Foto de perfil</label>
          {photoPreview && (
            <img src={photoPreview} alt="Vista previa de tu foto de perfil" className="photo-preview" />
          )}
          <input id="f-photo" type="file" accept="image/*" onChange={handlePhotoChange} />
          {photoPreview && (
            <button type="button" className="button-danger-text" onClick={removePhoto}>
              Quitar foto
            </button>
          )}
        </div>

        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </main>
  );
}
