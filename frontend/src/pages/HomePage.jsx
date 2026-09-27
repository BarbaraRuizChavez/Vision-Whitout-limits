import { useEffect, useState } from 'react';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('cargando');

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
        setStatus('listo');
      })
      .catch(() => setStatus('error'));
  }, []);

  // Filtrado flexible por coincidencia de texto en el slug o categoría
  const bastones = products.filter(
    (p) => p.slug?.includes('baston') || p.category === 'bastones'
  );
  const lentes = products.filter(
    (p) => p.slug?.includes('lentes') || p.category === 'lentes'
  );
  const kits = products.filter(
    (p) => p.slug?.includes('kit') || p.category === 'kits'
  );

  return (
    <main id="contenido" tabIndex={-1}>
      {/* ---------- Hero ---------- */}
      <section className="hero-photo">
        <div className="container hero-photo-inner">
          <blockquote className="about-quote">
            “Vision Without Limits es más que un producto. Es inclusión, movilidad y esperanza.”
          </blockquote>
          <div className="feature-pills">
            <span className="feature-pill">Sensores ultrasónicos</span>
            <span className="feature-pill">Bastón + lentes inteligentes</span>
            <span className="feature-pill">Hecho para la inclusión</span>
          </div>
        </div>
      </section>

      <div className="icon-box-grid">
        <div className="icon-box">
          <div className="icon-box-top">
            <img src="/images/seguridad.png" alt="" aria-hidden="true" className="cart-icon" />
          </div>
          <p className="icon-box-caption">Seguridad y reducción de accidentes</p>
        </div>

        <div className="icon-box">
          <div className="icon-box-top">
            <img src="/images/autonomia.png" alt="" aria-hidden="true" className="cart-icon" />
          </div>
          <p className="icon-box-caption">Autonomía y dignidad</p>
        </div>

        <div className="icon-box">
          <div className="icon-box-top">
            <img src="/images/inclusion.png" alt="" aria-hidden="true" className="cart-icon" />
          </div>
          <p className="icon-box-caption">Inclusión laboral, social y educativa</p>
        </div>

        <div className="icon-box">
          <div className="icon-box-top">
            <img src="/images/deteccion.png" alt="" aria-hidden="true" className="cart-icon" />
          </div>
          <p className="icon-box-caption">Detección de obstáculos hasta 50 cm</p>
        </div>
      </div>

      {status === 'error' && (
        <div className="container">
          <p role="alert" className="field-error">
            No se pudo cargar el catálogo. Verifica que el servidor de la API esté encendido.
          </p>
        </div>
      )}

      {/* ---------- Sección Conócenos ---------- */}
      <section className="section about-section" id="conocenos" aria-labelledby="titulo-conocenos">
        <div className="container about-grid">
          <div className="about-text">
            <h2 id="titulo-conocenos">Conócenos</h2>
            <p className="about-lead">
              En <strong>Vision Without Limits</strong> desarrollamos herramientas tecnológicas de
              asistencia diseñadas para transformar la autonomía y la seguridad de las personas con
              discapacidad visual.
            </p>
          </div>

          <div className="about-image-wrapper">
            <img src="/images/logo1.jpeg" alt="Logo de Vision Without Limits" loading="lazy" />
          </div>
        </div>
      </section>

      {/* ---------- Sección Nuestro Objetivo ---------- */}
      <section className="section feature-block-section" id="objetivo" aria-labelledby="titulo-objetivo">
        <div className="container">
          <div className="feature-card-grid">
            <div className="feature-card-image">
              <img src="/images/Productos.jpeg" alt="Nuestro Objetivo" loading="lazy" />
            </div>
            <div className="feature-card-content">
              <h2 id="titulo-objetivo">Nuestro Objetivo</h2>
              <p>
                Desarrollar un sistema electrónico portátil basado en sensores 
                ultrasónicos y controladores Arduino, capaz de detectar obstáculos y alertar al usuario a través de señales sonoras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Sección Nuestra Misión ---------- */}
      <section className="section feature-block-section" id="mision" aria-labelledby="titulo-mision">
        <div className="container">
          <div className="feature-card-grid feature-card-reverse">
            <div className="feature-card-image">
              <img src="/images/compromiso.jpeg" alt="Nuestra Misión" loading="lazy" />
            </div>
            <div className="feature-card-content">
              <h2 id="titulo-mision">Nuestra Misión</h2>
              <p>
                Desarrollar soluciones tecnológicas accesibles que mejoren la movilidad, 
                independencia y calidad de vida de las personas con discapacidad visual, 
                mediante dispositivos innovadores, seguros y de bajo costo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Sección Video---------- */}
      <section className="section" id="video-producto" aria-labelledby="titulo-video">
        <div className="container">
          <div className="section-heading">
            <h2 id="titulo-video">Video del producto</h2>
          </div>
          <div className="product-video-wrapper">
            <video controls className="product-video">
              <source src="/videos/video.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* ---------- Sección Comparativa con el mercado ---------- */}
      <section className="section" id="comparativa" aria-labelledby="titulo-comparativa">
        <div className="container">
          <div className="section-heading">
            <h2 id="titulo-comparativa">Comparativa con el mercado</h2>
          </div>
          <p className="info-text info-text-spaced">
            Precios de referencia puestos en México (precio base + envío e impuestos de importación estimados),
            comparados contra los bastones inteligentes WeWALK y UltraCane, las dos marcas más conocidas en el mercado internacional.
          </p>

          <div className="comparison-grid-wrapper">
            <table className="comparison-table">
              <caption className="sr-only">
                Comparativa de precios detallados puestos en México entre Vision Without Limits, WeWALK y UltraCane
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="col-feature">
                    <div className="table-header-pill default-pill">Concepto / Modelo</div>
                  </th>
                  {/* Columna destacada de Tu Empresa */}
                  <th scope="col" className="col-own highlighted-col">
                    <div className="table-header-pill own-pill">
                      Vision Without Limits
                    </div>
                  </th>
                  {/* Competidor 1 */}
                  <th scope="col" className="col-competitor">
                    <div className="table-header-pill competitor-pill-1">
                      WeWALK
                    </div>
                  </th>
                  {/* Competidor 2 */}
                  <th scope="col" className="col-competitor">
                    <div className="table-header-pill competitor-pill-2">
                      UltraCane
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Modelos / Opciones</th>
                  <td className="highlighted-col">
                    <ul className="item-list">
                      <li>• Bastón Plegable Inteligente</li>
                      <li>• Kit Completo (bastón + lentes)</li>
                    </ul>
                  </td>
                  <td>
                    <ul className="item-list">
                      <li>• Smart Cane (v1)</li>
                      <li>• Smart Cane 2 (Estándar)</li>
                      <li>• Smart Cane 2 Plus (IA)</li>
                    </ul>
                  </td>
                  <td>
                    <ul className="item-list">
                      <li>• Modelo base</li>
                      <li>• UltraCane 2.0</li>
                    </ul>
                  </td>
                </tr>

                <tr>
                  <th scope="row">Precio base</th>
                  <td className="highlighted-col">
                    <ul className="item-list">
                      <li><strong>Bastón:</strong> $3,500 MXN</li>
                      <li><strong>Kit Completo:</strong> $4,700 MXN</li>
                    </ul>
                  </td>
                  <td>
                    <ul className="item-list">
                      <li><strong>v1:</strong> $599.95 USD (≈ $10,200 MXN)</li>
                      <li><strong>Cane 2:</strong> $850.00 USD (≈ $14,450 MXN)</li>
                      <li><strong>Cane 2 Plus:</strong> $1,150.00 USD (≈ $19,550 MXN)</li>
                    </ul>
                  </td>
                  <td>
                    <ul className="item-list">
                      <li><strong>Modelo base:</strong> £635.00 (≈ $14,990 MXN)</li>
                      <li><strong>UltraCane 2.0:</strong> €899.00 (≈ $18,050 MXN)</li>
                    </ul>
                  </td>
                </tr>

                <tr>
                  <th scope="row">Envío + impuestos (est.)</th>
                  <td className="highlighted-col">
                    <ul className="item-list">
                      <li><strong>Bastón:</strong> Incluido (Venta nacional)</li>
                      <li><strong>Kit Completo:</strong> Incluido (Venta nacional)</li>
                    </ul>
                  </td>
                  <td>
                    <ul className="item-list">
                      <li><strong>v1:</strong> $3,300 – $4,500 MXN</li>
                      <li><strong>Cane 2:</strong> $4,500 – $6,000 MXN</li>
                      <li><strong>Cane 2 Plus:</strong> $5,000 – $6,500 MXN</li>
                    </ul>
                  </td>
                  <td>
                    <ul className="item-list">
                      <li><strong>Modelo base:</strong> $4,500 – $5,500 MXN</li>
                      <li><strong>UltraCane 2.0:</strong> $5,500 – $6,500 MXN</li>
                    </ul>
                  </td>
                </tr>

                <tr className="row-total">
                  <th scope="row">Total estimado en México</th>
                  <td className="highlighted-col">
                    <ul className="item-list highlight-text">
                      <li><strong>Bastón:</strong> $3,500 MXN</li>
                      <li><strong>Kit Completo:</strong> $4,700 MXN</li>
                    </ul>
                  </td>
                  <td>
                    <ul className="item-list">
                      <li><strong>v1:</strong> $13,500 – $14,700 MXN</li>
                      <li><strong>Cane 2:</strong> $18,950 – $20,450 MXN</li>
                      <li><strong>Cane 2 Plus:</strong> $24,550 – $26,050 MXN</li>
                    </ul>
                  </td>
                  <td>
                    <ul className="item-list">
                      <li><strong>Modelo base:</strong> $19,490 – $20,490 MXN</li>
                      <li><strong>UltraCane 2.0:</strong> $23,550 – $24,550 MXN</li>
                    </ul>
                  </td>
                </tr>

                {/* Fila de Posición en Mercado */}
                <tr className="row-position">
                  <th scope="row">Posición en Mercado</th>
                  <td className="highlighted-col">
                    <div className="badge-position badge-leader">Nuestra Marca (Opción Accesible)</div>
                  </td>
                  <td>
                    <div className="badge-position badge-wewalk">Competidor Internacional (UK/USA)</div>
                  </td>
                  <td>
                    <div className="badge-position badge-ultracane">Competidor Internacional (Europa)</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="table-note">
            Precios de referencia con tipo de cambio y costos de importación aproximados de 2026;
            pueden variar según el momento de compra, el proveedor y la política aduanal vigente.
          </p>
        </div>
      </section>

      {/* ---------- Sección Catálogo Completo ---------- */}
      <section className="section" id="catalogo" aria-labelledby="titulo-catalogo">
        <div className="container">
          <div className="section-heading">
            <h2 id="titulo-catalogo">Nuestros Productos</h2>
          </div>

          {status === 'cargando' && <p>Cargando catálogo…</p>}

          {status !== 'cargando' && [...bastones, ...lentes, ...kits].length === 0 && (
            <p>No hay productos disponibles por el momento.</p>
          )}

          {status !== 'cargando' && bastones.length > 0 && (
            <div id="bastones" tabIndex={-1} className="subsection-spacing">
              <h3>Bastones</h3>
              <div className="product-grid">
                {bastones.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {status !== 'cargando' && lentes.length > 0 && (
            <div id="lentes" tabIndex={-1} className="subsection-spacing">
              <h3>Lentes</h3>
              <div className="product-grid">
                {lentes.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {status !== 'cargando' && kits.length > 0 && (
            <div id="kits">
              <h3>Kits</h3>
              <div className="product-grid">
                {kits.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
