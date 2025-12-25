import ProductForm from '@/components/admin/ProductForm';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

async function getProduct(id: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/products/${id}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    return null;
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h1>
          <p className="text-slate-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <ProductForm product={product} isEditing={true} />;
}