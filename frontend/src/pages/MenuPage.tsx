import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import CategoryFormDialog from "@/components/modals/CategoryFormDialog";
import ProductFormDialog from "@/components/modals/ProductFormDialog";
import type { Category, Product } from "@/lib/types";

export default function MenuPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Category modal state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Product modal state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchData = async () => {
    try {
      const [categoriesData, productsData] = await Promise.all([
        api.get<Category[]>("/products/categories"),
        api.get<Product[]>("/products"),
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching menu data:", error);
      toast({
        title: "Error",
        description: "Error al cargar el menú",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleAvailability = async (product: Product) => {
    try {
      await api.patch(`/products/${product.id}/availability`, {
        available: !product.available,
      });
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, available: !p.available } : p,
        ),
      );
      toast({
        title: "Producto actualizado",
        description: `${product.name} ahora está ${!product.available ? "disponible" : "no disponible"}`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast({
        title: "Error",
        description: "Error al actualizar disponibilidad",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;

    try {
      await api.delete(`/products/categories/${categoryId}`);
      await fetchData();
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
      }
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado correctamente",
        variant: "success",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Error al eliminar la categoría",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      await api.delete(`/products/${productId}`);
      await fetchData();
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente",
        variant: "success",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el producto",
        variant: "destructive",
      });
    }
  };

  const openCategoryDialog = (category?: Category) => {
    setEditingCategory(category || null);
    setCategoryDialogOpen(true);
  };

  const openProductDialog = (product?: Product) => {
    setEditingProduct(product || null);
    setProductDialogOpen(true);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !selectedCategory || product.categoryId === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Menú</h1>
          <p className="text-gray-500">Administra productos y categorías</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openCategoryDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
          <Button onClick={() => openProductDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categorías</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                    !selectedCategory ? "bg-primary-50 text-primary-700" : ""
                  }`}
                >
                  Todas
                </button>
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`group flex items-center justify-between px-4 py-3 hover:bg-gray-50 ${
                      selectedCategory === category.id ? "bg-primary-50" : ""
                    }`}
                  >
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex-1 text-left ${
                        selectedCategory === category.id
                          ? "text-primary-700 font-medium"
                          : ""
                      }`}
                    >
                      {category.name}
                    </button>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openCategoryDialog(category)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-600"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={!product.available ? "opacity-60" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <p className="text-lg font-bold text-primary-600 mt-1">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleAvailability(product)}
                    >
                      {product.available ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.available
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {product.available ? "Disponible" : "No disponible"}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openProductDialog(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Category Form Dialog */}
      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editingCategory}
        onSuccess={() => {
          fetchData();
          setEditingCategory(null);
        }}
      />

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={editingProduct}
        categories={categories}
        onSuccess={() => {
          fetchData();
          setEditingProduct(null);
        }}
      />
    </div>
  );
}
