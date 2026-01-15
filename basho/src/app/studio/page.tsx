"use client"
import './studio.css'
import { colors } from '@/constants/colors'

export default function StudioPage() {
  const mapSrc = "https://maps.google.com/maps?q=21.1299866%2C72.7239895&z=17&hl=en&output=embed";

  return (
    <div className="studio-root">
      <style>{`
        :root{ --c-2: ${colors[1].hex}; --accent: ${colors[3].hex} }
      `}</style>

      <section className="studio-hero">
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="studio-title">Visit Our Studio</h1>
          <p className="studio-sub">Come by the Basho Pottery Studio — see the making process, attend a workshop, or collect your order.</p>
        </div>
      </section>

      <section className="studio-content container mx-auto px-6 py-12">
        <div className="studio-grid">
          <div className="studio-map">
            <div className="map-embed">
              <iframe
                title="Basho Pottery Studio - Map"
                src={mapSrc}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          <aside className="studio-info">
            <div className="info-card">
              <h2>Our Location</h2>
              <p className="muted">Basho Pottery Studio</p>
              <address className="studio-address">311, Silent Zone, Gavier,<br/>Dumas Road, Surat-395007</address>

              <h3 className="mt-6">Opening Hours</h3>
              <ul className="hours">
                <li>Mon – Fri: 10:00 — 18:00</li>
                <li>Sat: 10:00 — 16:00</li>
                <li>Sun: Closed</li>
              </ul>

              <h3 className="mt-6">Contact</h3>
              <p className="muted"><a href="tel:+919879575601" className="contact-link">Phone: +91 9879575601</a></p>
              <p className="muted"><a href="https://www.instagram.com/bashobyyshivangi?igsh=NnBhMzh3NTVwbzA4" target="_blank" rel="noopener noreferrer" className="contact-link">Instagram: @bashobyyshivangi</a></p>

              <div className="mt-6">
                <a className="studio-cta" href="https://maps.google.com/maps?q=21.1299866%2C72.7239895&z=17&hl=en" target="_blank" rel="noreferrer">Open in Google Maps</a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
