"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MdDelete, MdEdit, MdAdd, MdUpload, MdCloudUpload } from "react-icons/md";

interface ImageItem {
  _id: string;
  imageUrl: string;
  publicId: string;
  altText?: string;
  title?: string;
  description?: string;
  order: number;
  isActive: boolean;
}

interface HomePageContent {
  _id: string;
  heroSlideshow: ImageItem[];
  gsapSlider: ImageItem[];
  featuresSection: ImageItem[];
}

// Define image slots for each section
const IMAGE_SLOTS = {
  heroSlideshow: [
    { slot: 0, label: "Hero Slide 1", description: "Main hero image - appears first in rotation" },
    { slot: 1, label: "Hero Slide 2", description: "Second hero image" },
    { slot: 2, label: "Hero Slide 3", description: "Third hero image" },
    { slot: 3, label: "Hero Slide 4", description: "Fourth hero image" },
    { slot: 4, label: "Hero Slide 5", description: "Fifth hero image" },
    { slot: 5, label: "Hero Slide 6", description: "Sixth hero image" },
    { slot: 6, label: "Hero Slide 7", description: "Seventh hero image" },
  ],
  gsapSlider: [
    { slot: 0, label: "GSAP Slider 1", description: "First circular slider image" },
    { slot: 1, label: "GSAP Slider 2", description: "Second circular slider image" },
    { slot: 2, label: "GSAP Slider 3", description: "Third circular slider image" },
    { slot: 3, label: "GSAP Slider 4", description: "Fourth circular slider image" },
    { slot: 4, label: "GSAP Slider 5", description: "Fifth circular slider image" },
    { slot: 5, label: "GSAP Slider 6", description: "Sixth circular slider image" },
    { slot: 6, label: "GSAP Slider 7", description: "Seventh circular slider image" },
    { slot: 7, label: "GSAP Slider 8", description: "Eighth circular slider image" },
    { slot: 8, label: "GSAP Slider 9", description: "Ninth circular slider image" },
  ],
  featuresSection: [
    { slot: 0, label: "Feature 1 - Workshops", description: "Image for Hands-on Workshops feature" },
    { slot: 1, label: "Feature 2 - Custom Creations", description: "Image for Custom Creations feature" },
    { slot: 2, label: "Feature 3 - Quality", description: "Image for Refined Quality feature" },
    { slot: 3, label: "Feature 4 - Materials", description: "Image for Natural & Safe Materials feature" },
  ],
};

export default function HomePageManagement() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<
    "heroSlideshow" | "gsapSlider" | "featuresSection"
  >("heroSlideshow");
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
  const [editData, setEditData] = useState({ altText: "", title: "", description: "" });

  useEffect(() => {
    if (!session) {
      router.push("/auth");
    } else {
      fetchContent();
    }
  }, [session, router]);

  const fetchContent = async () => {
    try {
      const response = await fetch("/api/admin/homepage");
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error("Error fetching content:", error);
      setNotification({
        message: "Failed to fetch home page content",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("section", selectedSection);
    formData.append("order", selectedSlot.toString());

    try {
      const response = await fetch("/api/admin/homepage/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || "Upload failed");
      }

      setContent(result.content);
      setNotification({
        message: `Image uploaded to ${IMAGE_SLOTS[selectedSection as keyof typeof IMAGE_SLOTS][selectedSlot].label}!`,
        type: "success",
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setNotification({
        message: `Upload failed: ${error.message}`,
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string, publicId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await fetch(
        `/api/admin/homepage?section=${selectedSection}&imageId=${imageId}&publicId=${publicId}`,
        { method: "DELETE" }
      );

      const updatedContent = await response.json();
      setContent(updatedContent);
      setNotification({
        message: "Image deleted successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      setNotification({
        message: "Failed to delete image",
        type: "error",
      });
    }
  };

  const handleUpdateImage = async (imageId: string) => {
    try {
      const response = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: selectedSection,
          imageId,
          updates: editData,
        }),
      });

      const updatedContent = await response.json();
      setContent(updatedContent);
      setEditingImage(null);
      setEditData({ altText: "", title: "", description: "" });
      setNotification({
        message: "Image updated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating image:", error);
      setNotification({
        message: "Failed to update image",
        type: "error",
      });
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const slots = IMAGE_SLOTS[selectedSection as keyof typeof IMAGE_SLOTS];
  const currentImages = content ? (content[selectedSection] || []) : [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Home Page Image Management</h1>
        <p className="text-gray-600 mb-8">Upload and manage images for different sections of your homepage</p>

        {notification && (
          <div className={`fixed top-20 right-4 z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg`}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 text-white hover:text-gray-200 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex gap-4 mb-8 border-b bg-white rounded-t-lg shadow">
          {(
            [
              "heroSlideshow",
              "gsapSlider",
              "featuresSection",
            ] as const
          ).map((section) => (
            <button
              key={section}
              onClick={() => {
                setSelectedSection(section);
                setSelectedSlot(0);
              }}
              className={`px-6 py-3 font-semibold transition-colors border-b-4 ${
                selectedSection === section
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {section === "heroSlideshow"
                ? "🎬 Hero Slideshow"
                : section === "gsapSlider"
                ? "🎡 GSAP Slider"
                : "✨ Features Section"}
            </button>
          ))}
        </div>

        {/* Slot Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Image Slot to Update</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((slotInfo) => {
              const hasImage = currentImages.some((img) => img.order === slotInfo.slot);
              return (
                <button
                  key={slotInfo.slot}
                  onClick={() => setSelectedSlot(slotInfo.slot)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedSlot === slotInfo.slot
                      ? "border-amber-600 bg-amber-50"
                      : hasImage
                      ? "border-green-400 bg-green-50 hover:border-green-500"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <div className="font-semibold text-sm">{slotInfo.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{slotInfo.description}</div>
                  {hasImage && <div className="text-xs text-green-600 mt-2 font-semibold">✓ Image exists</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Slot Info and Upload */}
        {slots[selectedSlot] && (
          <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-amber-600">
            <h3 className="text-2xl font-bold text-amber-600 mb-2">{slots[selectedSlot].label}</h3>
            <p className="text-gray-600 mb-6">{slots[selectedSlot].description}</p>

            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Image to Upload
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                  disabled={uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400 whitespace-nowrap font-semibold"
              >
                <MdCloudUpload className="w-5 h-5" />
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        )}

        {/* Current Image Display */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Current Image for {slots[selectedSlot]?.label}</h2>
          
          {currentImages.filter((img) => img.order === selectedSlot).length > 0 ? (
            <div>
              {currentImages
                .filter((img) => img.order === selectedSlot)
                .map((image) => (
                  <div key={image._id} className="space-y-4">
                    {/* Image Preview */}
                    <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden bg-gray-200">
                      <Image
                        src={image.imageUrl}
                        alt={image.altText || "Uploaded image"}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Image Info */}
                    {editingImage?._id === image._id ? (
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                          <input
                            type="text"
                            placeholder="Alt Text"
                            value={editData.altText}
                            onChange={(e) =>
                              setEditData({ ...editData, altText: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        {selectedSection === "gsapSlider" && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                              <input
                                type="text"
                                placeholder="Title"
                                value={editData.title}
                                onChange={(e) =>
                                  setEditData({ ...editData, title: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea
                                placeholder="Description"
                                value={editData.description}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    description: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                rows={2}
                              />
                            </div>
                          </>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateImage(image._id)}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-semibold transition-colors"
                          >
                            ✓ Save Changes
                          </button>
                          <button
                            onClick={() => {
                              setEditingImage(null);
                              setEditData({ altText: "", title: "", description: "" });
                            }}
                            className="flex-1 px-3 py-2 bg-gray-400 text-white rounded text-sm hover:bg-gray-500 font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p className="text-sm"><strong>Alt Text:</strong> {image.altText || "N/A"}</p>
                        {(selectedSection === "gsapSlider" || selectedSection === "featuresSection") && (
                          <>
                            {image.title && (
                              <p className="text-sm"><strong>Title:</strong> {image.title}</p>
                            )}
                            {image.description && (
                              <p className="text-sm"><strong>Description:</strong> {image.description}</p>
                            )}
                          </>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                          <button
                            onClick={() => {
                              setEditingImage(image);
                              setEditData({
                                altText: image.altText || "",
                                title: image.title || "",
                                description: image.description || "",
                              });
                            }}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-semibold"
                          >
                            <MdEdit /> Edit Info
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteImage(image._id, image.publicId)
                            }
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 font-semibold"
                          >
                            <MdDelete /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-100 rounded-lg">
              <MdAdd className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                No image uploaded for this slot yet. Upload your first image!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
