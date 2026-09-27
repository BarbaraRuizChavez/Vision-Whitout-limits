import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', acceptedTerms: false });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef(null);

  function validate() {
    const newErrors = [];
    if (!form.firstName.trim()) newErrors.push('Escribe tu nombre.');
    if (!form.lastName.trim()) newErrors.push('Escribe tu apellido.');
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) newErrors.push('Escribe un correo válido.');
    if (form.password.length < 8) newErrors.push('La contraseña debe tener al menos 8 caracteres.');
    if (!form.acceptedTerms) newErrors.push('Debes aceptar los Términos y Condiciones.');
    return newErrors;
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview('');
      return;
    }
    if (file.size > 1_500_000) {
      setErrors(['La foto debe pesar menos de 1.5 MB.']);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    const base64 = await fileToBase64(file);
    setPhotoFile(file);
    setPhotoPreview(base64);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    if (newErrors.length > 0) {
      setErrors(newErrors);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }

    setSubmitting(true);
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        photoUrl: photoPreview || null,
        acceptedTerms: form.acceptedTerms,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setErrors([err.message]);
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <main id="contenido" tabIndex={-1} className="auth-card">
        <h1>Formulario Registro</h1>

        {errors.length > 0 && (
          <div className="error-summary" ref={errorRef} tabIndex={-1} role="alert">
            <ul>
              {errors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="f-firstname">Nombre</label>
            <input
              id="f-firstname"
              type="text"
              autoComplete="given-name"
              placeholder="Ingrese su nombre"
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
              placeholder="Ingrese su apellido"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label htmlFor="f-email">Correo</label>
            <input
              id="f-email"
              type="email"
              autoComplete="email"
              placeholder="Ingrese su correo"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label htmlFor="f-password">Contraseña</label>
            <input
              id="f-password"
              type="password"
              autoComplete="new-password"
              placeholder="Ingrese su contraseña"
              aria-describedby="ayuda-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <span id="ayuda-password" className="sr-only">Debe tener al menos 8 caracteres.</span>
          </div>

          <div className="form-field">
            <label htmlFor="f-photo">Foto de perfil (opcional)</label>
            <input id="f-photo" type="file" accept="image/*" onChange={handlePhotoChange} />
            {photoPreview && (
              <img
                src={photoPreview}
                alt={`Vista previa de la foto de perfil de ${form.firstName || 'usuario'}`}
                className="photo-preview"
              />
            )}
          </div>

          <div className="checkbox-field">
            <input
              id="f-terms"
              type="checkbox"
              checked={form.acceptedTerms}
              onChange={(e) => setForm({ ...form, acceptedTerms: e.target.checked })}
            />
            <label htmlFor="f-terms">
              Estoy de acuerdo con los <Link to="/terminos">Términos y Condiciones</Link>
            </label>
          </div>

          <button type="submit" className="button button-primary" disabled={submitting}>
            {submitting ? 'Creando cuenta…' : 'Registrar'}
          </button>
        </form>

        <div className="divider">o</div>
        <GoogleLoginButton onError={(msg) => { setErrors([msg]); requestAnimationFrame(() => errorRef.current?.focus()); }} />

        <p className="link-row">
          <Link to="/login">¿Ya tengo cuenta?</Link>
        </p>
      </main>
    </div>
  );
}
