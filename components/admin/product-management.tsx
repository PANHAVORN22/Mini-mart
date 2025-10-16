"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  Trash2,
  Plus,
  Upload,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import imageCompression from "browser-image-compression";

interface Beer {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  alcohol_content: number;
  volume: number;
  stock: number;
  image_url: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

interface NewBeerForm {
  name: string;
  type: string;
  description: string;
  price: string;
  alcohol_content: string;
  volume: string;
  stock: string;
  is_premium: boolean;
  image: File | null;
}

const BEER_TYPES = [
  "Ale",
  "IPA",
  "Lager",
  "Stout",
  "Porter",
  "Wheat",
  "Pilsner",
  "Belgian",
  "Sour",
  "Other",
];

export function ProductManagement() {
  const [beers, setBeers] = useState<Beer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBeer, setEditingBeer] = useState<Beer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newBeer, setNewBeer] = useState<NewBeerForm>({
    name: "",
    type: "",
    description: "",
    price: "",
    alcohol_content: "",
    volume: "355",
    stock: "",
    is_premium: false,
    image: null,
  });

  useEffect(() => {
    fetchBeers();
  }, []);

  const fetchBeers = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("beers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching beers:", error);
      toast.error("Failed to fetch products");
      setIsLoading(false);
      return;
    }

    setBeers(data || []);
    setIsLoading(false);
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.5, // Maximum file size in MB
      maxWidthOrHeight: 800, // Maximum width or height in pixels
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: 0.8,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(
        `Image compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(
          compressedFile.size /
          1024 /
          1024
        ).toFixed(2)}MB`
      );
      return compressedFile;
    } catch (error) {
      console.error("Image compression failed:", error);
      toast.error("Failed to compress image");
      return file;
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const supabase = getSupabaseBrowserClient();

    // Compress the image first
    const compressedFile = await compressImage(file);

    const fileName = `beer-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.jpg`;
    const { data, error } = await supabase.storage
      .from("beer-images")
      .upload(fileName, compressedFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      throw new Error("Failed to upload image");
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("beer-images")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(
          "Image file is too large. Please select an image smaller than 10MB"
        );
        return;
      }

      setNewBeer((prev) => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async () => {
    if (
      !newBeer.name ||
      !newBeer.type ||
      !newBeer.price ||
      !newBeer.stock ||
      !newBeer.image
    ) {
      toast.error("Please fill in all required fields and select an image");
      return;
    }

    setIsSaving(true);
    setIsUploading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      // Upload image first
      const imageUrl = await uploadImage(newBeer.image);

      // Create beer record
      const { data, error } = await supabase
        .from("beers")
        .insert({
          name: newBeer.name,
          type: newBeer.type,
          description: newBeer.description,
          price: parseFloat(newBeer.price),
          alcohol_content: parseFloat(newBeer.alcohol_content) || null,
          volume: parseInt(newBeer.volume),
          stock: parseInt(newBeer.stock),
          image_url: imageUrl,
          is_premium: newBeer.is_premium,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating beer:", error);
        toast.error("Failed to create product");
        return;
      }

      toast.success("Product created successfully!", {
        description: `${newBeer.name} has been added to inventory`,
      });

      // Reset form
      setNewBeer({
        name: "",
        type: "",
        description: "",
        price: "",
        alcohol_content: "",
        volume: "355",
        stock: "",
        is_premium: false,
        image: null,
      });
      setImagePreview(null);

      // Refresh the list
      fetchBeers();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleEdit = (beer: Beer) => {
    setEditingBeer(beer);
    setNewBeer({
      name: beer.name,
      type: beer.type,
      description: beer.description || "",
      price: beer.price.toString(),
      alcohol_content: beer.alcohol_content?.toString() || "",
      volume: beer.volume?.toString() || "355",
      stock: beer.stock.toString(),
      is_premium: beer.is_premium,
      image: null,
    });
    setImagePreview(beer.image_url);
    setIsDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (
      !editingBeer ||
      !newBeer.name ||
      !newBeer.type ||
      !newBeer.price ||
      !newBeer.stock
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);

    try {
      const supabase = getSupabaseBrowserClient();

      let imageUrl = editingBeer.image_url;

      // Upload new image if provided
      if (newBeer.image) {
        setIsUploading(true);
        imageUrl = await uploadImage(newBeer.image);
      }

      // Update beer record
      const { error } = await supabase
        .from("beers")
        .update({
          name: newBeer.name,
          type: newBeer.type,
          description: newBeer.description,
          price: parseFloat(newBeer.price),
          alcohol_content: parseFloat(newBeer.alcohol_content) || null,
          volume: parseInt(newBeer.volume),
          stock: parseInt(newBeer.stock),
          image_url: imageUrl,
          is_premium: newBeer.is_premium,
        })
        .eq("id", editingBeer.id);

      if (error) {
        console.error("Error updating beer:", error);
        toast.error("Failed to update product");
        return;
      }

      toast.success("Product updated successfully!", {
        description: `${newBeer.name} has been updated`,
      });

      // Refresh the list
      fetchBeers();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async (beerId: string, beerName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${beerName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("beers").delete().eq("id", beerId);

      if (error) {
        console.error("Error deleting beer:", error);
        toast.error("Failed to delete product");
        return;
      }

      toast.success("Product deleted successfully!");
      fetchBeers();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading products...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between px-6">
        <CardTitle className="text-center flex-1">Product Management</CardTitle>
        <Button onClick={() => setIsDialogOpen(true)} className="ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </CardHeader>
      <CardContent className="px-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beers.map((beer) => (
                <TableRow key={beer.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        {beer.image_url ? (
                          <img
                            src={beer.image_url}
                            alt={beer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{beer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {beer.alcohol_content
                            ? `${beer.alcohol_content}% ABV`
                            : ""}
                          {beer.volume ? ` • ${beer.volume}ml` : ""}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{beer.type}</TableCell>
                  <TableCell>${beer.price.toFixed(2)}</TableCell>
                  <TableCell>{beer.stock}</TableCell>
                  <TableCell>
                    {beer.stock === 0 ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : beer.stock < 10 ? (
                      <Badge variant="secondary" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="default">In Stock</Badge>
                    )}
                    {beer.is_premium && (
                      <Badge variant="outline" className="ml-2">
                        Premium
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(beer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(beer.id, beer.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl mx-auto">
            <DialogHeader className="text-center">
              <DialogTitle>
                {editingBeer ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                {editingBeer
                  ? "Update the product information below"
                  : "Fill in the details to add a new product to your inventory"}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="w-full justify-center">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="image">Image</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={newBeer.name}
                      onChange={(e) =>
                        setNewBeer((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Golden Ale"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Beer Type *</Label>
                    <Select
                      value={newBeer.type}
                      onValueChange={(value) =>
                        setNewBeer((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BEER_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newBeer.description}
                    onChange={(e) =>
                      setNewBeer((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe the taste, aroma, and characteristics of this beer..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newBeer.price}
                      onChange={(e) =>
                        setNewBeer((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newBeer.stock}
                      onChange={(e) =>
                        setNewBeer((prev) => ({
                          ...prev,
                          stock: e.target.value,
                        }))
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alcohol">Alcohol Content (%)</Label>
                    <Input
                      id="alcohol"
                      type="number"
                      step="0.1"
                      value={newBeer.alcohol_content}
                      onChange={(e) =>
                        setNewBeer((prev) => ({
                          ...prev,
                          alcohol_content: e.target.value,
                        }))
                      }
                      placeholder="5.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="volume">Volume (ml)</Label>
                    <Input
                      id="volume"
                      type="number"
                      value={newBeer.volume}
                      onChange={(e) =>
                        setNewBeer((prev) => ({
                          ...prev,
                          volume: e.target.value,
                        }))
                      }
                      placeholder="355"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="premium"
                    checked={newBeer.is_premium}
                    onChange={(e) =>
                      setNewBeer((prev) => ({
                        ...prev,
                        is_premium: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="premium">
                    Premium Product (requires subscription)
                  </Label>
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <div className="space-y-2 text-center">
                  <Label className="block">Product Image *</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer block"
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload an image or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 10MB (will be compressed automatically)
                      </p>
                    </label>
                  </div>
                </div>

                {imagePreview && (
                  <div className="space-y-2 text-center">
                    <Label className="block">Preview</Label>
                    <div className="w-full max-w-xs mx-auto">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border mx-auto"
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={editingBeer ? handleUpdateProduct : handleAddProduct}
                disabled={isSaving || isUploading}
              >
                {isUploading && "Uploading image..."}
                {!isUploading && isSaving && "Saving..."}
                {!isUploading &&
                  !isSaving &&
                  (editingBeer ? "Update Product" : "Add Product")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
