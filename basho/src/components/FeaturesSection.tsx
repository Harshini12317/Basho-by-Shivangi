"use client";

import { useEffect, useState } from "react";
import "./FeaturesSection.css";

interface FeatureItem {
  _id?: string;
  imageUrl: string;
  altText?: string;
  title?: string;
  description?: string;
}

const DEFAULT_FEATURES = [
  {
    imageUrl: '/images/pottery-hero.png',
    altText: 'Pottery workshop',
    title: 'Hands-on Workshops',
    description: 'Experience the joy of shaping clay yourself through guided, small-group pottery workshops.',
  },
  {
    imageUrl: '/images/p1.png',
    altText: 'Custom pottery',
    title: 'Custom Creations',
    description: 'Each piece can be tailored — from form to glaze — crafted specifically for your space and story.',
  },
  {
    imageUrl: '/images/common.png',
    altText: 'Fine pottery quality',
    title: 'Refined Quality',
    description: 'We work slowly and intentionally, ensuring balance, durability, and elegance in every finished piece.',
  },
  {
    imageUrl: '/images/common3.png',
    altText: 'Safe materials',
    title: 'Natural & Safe Materials',
    description: 'Crafted using high-quality clay and food-safe glazes, made to be used and cherished daily.',
  },
];

export default function FeaturesSection() {
  const [features, setFeatures] = useState<FeatureItem[]>(DEFAULT_FEATURES);

  useEffect(() => {
    // Fetch home page content to get dynamic images
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/admin/homepage');
        const data = await response.json();
        
        if (data.featuresSection && data.featuresSection.length > 0) {
          const activeFeatures = data.featuresSection
            .filter((item: any) => item.isActive)
            .sort((a: any, b: any) => a.order - b.order);
          setFeatures(activeFeatures);
        }
      } catch (error) {
        console.error('Error fetching home page content:', error);
      }
    };

    fetchContent();
  }, []);

  return (
    <section className="features-section">
      <div className="features-container">

        {/* HEADER */}
        <div className="features-header">
          <h2>Thoughtfully Crafted Experiences</h2>
          <p>
            Basho brings together craftsmanship, customization,
            and care — shaping objects meant to be lived with.
          </p>
        </div>

        {/* FEATURES */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className={`feature-card ${index % 2 === 1 ? 'offset' : ''}`}>
              <div className="feature-image">
                <img src={feature.imageUrl} alt={feature.altText || feature.title || 'Feature'} />
              </div>
              <div className="feature-content">
                <h3>{feature.title || 'Feature'}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
