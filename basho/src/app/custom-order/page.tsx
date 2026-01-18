"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaFire, FaLeaf } from "react-icons/fa";

export default function CustomOrderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const i3Fallbacks = ["/images/i3.jpeg", "/images/i3.jpg", "/images/i3.png", "/images/img3.png", "/images/common.png"];
  const i4Fallbacks = ["/images/i4.jpeg", "/images/i4.jpg", "/images/i4.png", "/images/img4.png", "/images/common3.png"];
  const [i3Index, setI3Index] = useState(0);
  const [i4Index, setI4Index] = useState(0);
  const i3Src = i3Fallbacks[i3Index];
  const i4Src = i4Fallbacks[i4Index];
  const [customOrderForm, setCustomOrderForm] = useState({
    phone: "",
    description: "",
    notes: "",
    referenceImages: [] as string[],
  });

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasShownAuthAlert, setHasShownAuthAlert] = useState(false);
  const [customOrderPhotos, setCustomOrderPhotos] = useState<any[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);

  useEffect(() => {
    // Fetch custom order photos
    fetch('/api/custom-order-photos')
      .then((r) => r.json())
      .then((data) => {
        setCustomOrderPhotos(data);
      })
      .catch((error) => {
        console.error('Failed to fetch custom order photos:', error);
      })
      .finally(() => {
        setPhotosLoading(false);
      });
  }, []);

  const handleFormFieldInteraction = () => {
    if (status === "unauthenticated") {
      // Show alert & redirect only once per page session
      if (!hasShownAuthAlert) {
        setHasShownAuthAlert(true);
        alert("Please log in to request a custom order.");
        router.push("/auth");
      }
      return false;
    }
    return true;
  };

 

  const handleCustomOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleFormFieldInteraction()) return;
    
    if (!session?.user?.email || !session?.user?.name) {
      alert("Please log in to submit a custom order.");
      return;
    }
    setIsSubmitting(true);
    try {
      // convert selected files to data URLs for server-side Cloudinary upload
      const fileToDataUrl = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });

      const dataUrls = referenceFiles.length
        ? await Promise.all(referenceFiles.map((f) => fileToDataUrl(f)))
        : [];

      const payload = {
        name: session.user.name,
        email: session.user.email,
        phone: customOrderForm.phone,
        description: customOrderForm.description,
        notes: customOrderForm.notes,
        referenceImages: dataUrls,
      };

      const response = await fetch("/api/custom-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Custom order request submitted! We'll get back to you soon.");
        setCustomOrderForm({
          phone: "",
          description: "",
          notes: "",
          referenceImages: [],
        });
        setReferenceFiles([]);
      } else {
        alert("Failed to submit custom order. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting custom order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen py-16 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/images/i2.jpg)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {status === "loading" ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8E5022] mx-auto mb-4"></div>
              <p className="text-[#442D1C] font-semibold">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {/* How Custom Orders Work Flowchart */}
            <div className="mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold serif text-[#442D1C] mb-12 text-center"
          >
            How Custom Orders Work
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4"
          >
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div 
                className="w-24 h-24 bg-[#8E5022] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg"
              >
                1
              </motion.div>
              <h3 className="font-semibold serif text-[#442D1C] text-lg mb-2">Send Request</h3>
              <p className="text-[#652810] text-sm max-w-32">Fill out the form below with your requirements</p>
            </motion.div>

            {/* Arrow */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="hidden md:block text-[#8E5022] text-3xl"
            >
              →
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="md:hidden text-[#8E5022] text-3xl"
            >
              ↓
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div 
                className="w-24 h-24 bg-[#C85428] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg"
              >
                2
              </motion.div>
              <h3 className="font-semibold serif text-[#442D1C] text-lg mb-2">We Interact</h3>
              <p className="text-[#652810] text-sm max-w-32">Our artisans discuss details and provide pricing</p>
            </motion.div>

            {/* Arrow */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="hidden md:block text-[#8E5022] text-3xl"
            >
              →
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="md:hidden text-[#8E5022] text-3xl"
            >
              ↓
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div 
                className="w-24 h-24 bg-[#EDD8B4] rounded-full flex items-center justify-center text-[#442D1C] text-2xl font-bold mb-4 shadow-lg border-2 border-[#8E5022]"
              >
                3
              </motion.div>
              <h3 className="font-semibold serif text-[#442D1C] text-lg mb-2">You Agree</h3>
              <p className="text-[#652810] text-sm max-w-32">Approve the quote and finalize details</p>
            </motion.div>

            {/* Arrow */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="hidden md:block text-[#8E5022] text-3xl"
            >
              →
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="md:hidden text-[#8E5022] text-3xl"
            >
              ↓
            </motion.div>

            {/* Step 4 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div 
                className="w-24 h-24 bg-[#8E5022] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg"
              >
                4
              </motion.div>
              <h3 className="font-semibold serif text-[#442D1C] text-lg mb-2">Payment</h3>
              <p className="text-[#652810] text-sm max-w-32">Secure payment through our checkout</p>
            </motion.div>

            {/* Arrow */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="hidden md:block text-[#8E5022] text-3xl"
            >
              →
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="md:hidden text-[#8E5022] text-3xl"
            >
              ↓
            </motion.div>

            {/* Step 5 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div 
                className="w-24 h-24 bg-[#C85428] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg"
              >
                5
              </motion.div>
              <h3 className="font-semibold serif text-[#442D1C] text-lg mb-2">Order Placed</h3>
              <p className="text-[#652810] text-sm max-w-32">Your custom piece begins creation</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Custom Orders Gallery */}
        <div className="mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.7 }}
            className="text-4xl font-bold serif text-[#442D1C] mb-8 text-center"
          >
            Previous Custom Creations
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.9 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {photosLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2 + index * 0.1 }}
                  className="bg-white elegant-rounded-2xl p-6 border border-[#8E5022]/20"
                >
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {Array.from({ length: 2 }).map((_, imgIndex) => (
                      <div key={imgIndex} className="w-full h-32 md:h-40 bg-gray-200 animate-pulse elegant-rounded-lg"></div>
                    ))}
                  </div>
                  <div className="h-6 bg-gray-200 animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse"></div>
                </motion.div>
              ))
            ) : customOrderPhotos.length > 0 ? (
              customOrderPhotos.map((photo, orderIndex) => (
                <motion.div 
                  key={photo._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2 + orderIndex * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white elegant-rounded-2xl p-6 border border-[#8E5022]/20 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {photo.images.slice(0, 2).map((image: string, index: number) => (
                      <div key={index} className="relative bg-white elegant-rounded-lg">
                        <motion.img
                          src={image}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => {
                            setSelectedOrder(photo);
                            setSelectedImageIndex(index);
                          }}
                          className="w-full h-32 md:h-40 object-cover elegant-rounded-lg border-2 border-white cursor-pointer"
                          alt={`${photo.title} - ${index + 1}`}
                        />
                        {index === 1 && photo.images.length > 2 && (
                          <div 
                            className="absolute inset-0 bg-black/60 flex items-center justify-center elegant-rounded-lg cursor-pointer"
                            onClick={() => {
                              setSelectedOrder(photo);
                              setSelectedImageIndex(0);
                            }}
                          >
                            <span className="text-white font-semibold text-lg">
                              +{photo.images.length - 2} more
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <h3 className="font-semibold text-[#442D1C] mb-2 text-lg serif">{photo.title}</h3>
                  <p className="text-[#652810] text-sm">{photo.description}</p>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-[#652810] text-lg">No custom order photos available yet.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Image Modal */}
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="relative p-4 bg-white">
                  <img
                    src={selectedOrder.images[selectedImageIndex]}
                    alt={selectedOrder.title}
                    className="w-full h-auto max-h-[60vh] object-contain"
                  />
                  {selectedOrder.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : selectedOrder.images.length - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex((prev) => (prev < selectedOrder.images.length - 1 ? prev + 1 : 0))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        ›
                      </button>
                    </>
                  )}
                  {selectedOrder.images.length > 1 && (
                    <div className="mt-4 flex justify-center space-x-2">
                      {selectedOrder.images.map((_: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === selectedImageIndex ? 'bg-[#8E5022]' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-6 overflow-y-auto">
                  <h3 className="text-2xl font-bold serif text-[#442D1C] mb-2">{selectedOrder.name}</h3>
                  <p className="text-[#652810]">{selectedOrder.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Two-column layout: image on left, form on right */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 items-start mx-4 sm:mx-0">
          <div className="flex justify-center md:justify-start">
            <img src="/images/d.png" alt="Handcrafted Creations" className="w-full max-w-[260px] md:max-w-[280px] h-auto drop-shadow-xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.5 }}
            className="custom-form-card relative overflow-hidden"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8E5022]/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C85428]/5 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="absolute top-6 left-6 corner-icon flex items-center justify-center">
              <FaFire className="text-red-600" />
            </div>
            <div className="absolute top-6 right-6 corner-icon flex items-center justify-center">
              <FaLeaf className="text-green-600" />
            </div>

            <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 2.7 }}
            className="form-title mb-6 sm:mb-8 lg:mb-10 text-center relative z-10"
          >
            Request Your Custom Piece
          </motion.h2>

          {/* Authentication Status Display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2.8 }}
            className="user-info-box mb-6 text-center"
          >
            {status === "authenticated" ? (
              <>
                <p className="text-[#442D1C] font-semibold break-words max-w-xs mx-auto text-sm sm:text-base">
                  Logged in as:
                  <span className="text-[#8E5022] block sm:inline mt-1 sm:mt-0 break-words">
                    {session?.user?.email}
                  </span>
                </p>
                <p className="text-sm text-[#652810] mt-1">Your email and name will be used for this custom order request.</p>
              </>
            ) : (
              <>
                <p className="text-red-600 font-semibold">Login Required</p>
                <p className="text-sm text-red-500 mt-1">Please log in to submit a custom order request.</p>
              </>
            )}
          </motion.div>

            <form onSubmit={handleCustomOrderSubmit} className="space-y-6 sm:space-y-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 2.9 }}
              className="space-y-2 sm:space-y-3"
            >
              <div className="space-y-2 sm:space-y-3">
                <label className="text-[#442D1C] font-semibold text-base sm:text-lg serif block">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={customOrderForm.phone}
                    onFocus={() => handleFormFieldInteraction()}
                    onChange={(e) => setCustomOrderForm({ ...customOrderForm, phone: e.target.value })}
                    className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-[#8E5022] focus:outline-none transition-all duration-300 bg-white focus:bg-white shadow-sm focus:shadow-md focus:ring-4 focus:ring-[#8E5022]/10 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#8E5022]/5 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.3 }}
              className="space-y-2 sm:space-y-3"
            >
              <label className="text-[#442D1C] font-semibold text-base sm:text-lg serif block">Describe Your Vision</label>
              <div className="relative">
                <textarea
                  placeholder="Tell us about your dream pottery piece. Include details like size, shape, color preferences, intended use, and any special features..."
                  value={customOrderForm.description}
                  onFocus={() => handleFormFieldInteraction()}
                  onChange={(e) => setCustomOrderForm({ ...customOrderForm, description: e.target.value })}
                  className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-[#8E5022] focus:outline-none transition-all duration-300 h-32 sm:h-36 resize-none bg-white focus:bg-white shadow-sm focus:shadow-md focus:ring-4 focus:ring-[#8E5022]/10 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#8E5022]/5 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.5 }}
              className="space-y-2 sm:space-y-3"
            >
              <label className="text-[#442D1C] font-semibold text-base sm:text-lg serif block">Additional Notes <span className="text-gray-500 font-normal">(Optional)</span></label>
              <div className="relative">
                <textarea
                  placeholder="Any specific requirements, timeline preferences, or other details..."
                  value={customOrderForm.notes}
                  onFocus={() => handleFormFieldInteraction()}
                  onChange={(e) => setCustomOrderForm({ ...customOrderForm, notes: e.target.value })}
                  className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-[#8E5022] focus:outline-none transition-all duration-300 h-24 sm:h-28 resize-none bg-white focus:bg-white shadow-sm focus:shadow-md focus:ring-4 focus:ring-[#8E5022]/10 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#8E5022]/5 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.7 }}
              className="space-y-3 sm:space-y-4"
            >
              <label className="text-[#442D1C] font-semibold text-base sm:text-lg serif block">Reference Images <span className="text-gray-500 font-normal">(Optional)</span></label>
              <p className="text-[#652810] text-sm sm:text-base mb-3 sm:mb-4">Upload photos of pieces you like or sketches of your vision</p>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onClick={() => handleFormFieldInteraction()}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      const fileArray = Array.from(files);
                      setReferenceFiles(fileArray);
                      const urls = fileArray.map((file) => URL.createObjectURL(file));
                      setCustomOrderForm({ ...customOrderForm, referenceImages: urls });
                    }
                  }}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl focus:border-[#C46A2B] focus:outline-none transition-all duration-300 bg-gray-50 hover:bg-gray-100 focus:bg:white file:w-full sm:file:w-auto file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#C46A2B] file:text-white hover:file:bg-[#D98557] file:transition-colors file:cursor-pointer file:text-center"
                />
              </div>
              {customOrderForm.referenceImages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 mt-4 sm:mt-6"
                >
                  {customOrderForm.referenceImages.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="relative group bg-white rounded-xl"
                    >
                      <img
                        src={image}
                        className="w-full aspect-square object-cover rounded-lg sm:rounded-xl border-2 border-gray-200 shadow-sm group-hover:shadow-md transition-shadow duration-300"
                        alt={`Reference ${index + 1}`}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-300"></div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 3.9 }}
              className="text-center pt-6 sm:pt-8 lg:pt-10"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                onClick={() => handleFormFieldInteraction()}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-[#C46A2B] hover:bg-[#D98557] text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : null}
                <span>{isSubmitting ? 'Submitting…' : 'Submit Custom Order Request'}</span>
              </motion.button>
              <p className="text-gray-500 text-sm mt-4">We&apos;ll get back to you within 24-48 hours</p>
            </motion.div>
            </form>
          </motion.div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
