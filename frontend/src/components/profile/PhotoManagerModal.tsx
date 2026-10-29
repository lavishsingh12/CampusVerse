"use client";

import React, { useEffect, useRef, useState } from "react";
import { PHOTO_CATALOG } from "../../data/mockUserProfile";
import { CloseIcon, TrashIcon, PlusIcon, CheckIcon } from "../common/Icons";
import type { ProfilePhotoSelection } from "../../lib/profile";

interface PhotoManagerModalProps {
  photos: { id: number; url: string }[];
  isOpen: boolean;
  onClose: () => void;
  onSavePhotos: (updatedPhotos: ProfilePhotoSelection[]) => Promise<void>;
}

export function PhotoManagerModal({
  photos: initialPhotos,
  isOpen,
  onClose,
  onSavePhotos,
}: PhotoManagerModalProps) {
  const [photos, setPhotos] = useState<ProfilePhotoSelection[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const filePickerRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraCapture, setCameraCapture] = useState<File | null>(null);
  const [cameraCapturePreview, setCameraCapturePreview] = useState<string | null>(null);
  const cameraRequestIdRef = useRef(0);
  const previewUrlsRef = useRef(new Set<string>());

  React.useEffect(() => {
    if (isOpen) {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
      setPhotos(initialPhotos.map((photo) => ({
        kind: "existing",
        photoId: photo.id,
        url: photo.url,
      })));
    } else {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    }
    setFeedbackMessage(null);
  }, [initialPhotos, isOpen]);

  React.useEffect(() => () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    if (cameraVideoRef.current && cameraStream) {
      cameraVideoRef.current.srcObject = cameraStream;
    }
  }, [cameraOpen, cameraStream]);

  const stopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraStream(null);
    if (cameraVideoRef.current) cameraVideoRef.current.srcObject = null;
  };

  useEffect(() => {
    if (!isOpen) {
      cameraRequestIdRef.current += 1;
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
      setCameraStream(null);
      setCameraOpen(false);
      setCameraCapture(null);
      if (cameraCapturePreview) URL.revokeObjectURL(cameraCapturePreview);
      setCameraCapturePreview(null);
    }
  }, [isOpen, cameraStream, cameraCapturePreview]);

  useEffect(() => () => {
    cameraRequestIdRef.current += 1;
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
  }, []);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3200);
  };

  const photoUrl = (photo: ProfilePhotoSelection) =>
    photo.kind === "upload" ? photo.previewUrl : photo.url;

  const validateImageFile = async (file: File): Promise<string | null> => {
    if (file.size > 8 * 1024 * 1024) return "Images must be 8 MB or smaller.";
    const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const isJpeg = signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
    const isPng =
      signature[0] === 0x89 &&
      signature[1] === 0x50 &&
      signature[2] === 0x4e &&
      signature[3] === 0x47 &&
      signature[4] === 0x0d &&
      signature[5] === 0x0a &&
      signature[6] === 0x1a &&
      signature[7] === 0x0a;
    const isWebp =
      signature[0] === 0x52 &&
      signature[1] === 0x49 &&
      signature[2] === 0x46 &&
      signature[3] === 0x46 &&
      signature[8] === 0x57 &&
      signature[9] === 0x45 &&
      signature[10] === 0x42 &&
      signature[11] === 0x50;
    if (!isJpeg && !isPng && !isWebp) {
      return `${file.name} does not contain a supported JPEG, PNG, or WebP image. WPS documents must first be exported as JPEG or PNG.`;
    }
    try {
      if (typeof window !== "undefined" && "createImageBitmap" in window) {
        const bitmap = await createImageBitmap(file);
        bitmap.close();
      } else {
        const objectUrl = URL.createObjectURL(file);
        try {
          await new Promise<void>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve();
            image.onerror = () => reject(new Error("Invalid image"));
            image.src = objectUrl;
          });
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      }
      return null;
    } catch (error) {
      return error instanceof Error && error.name === "InvalidStateError"
        ? "The selected file could not be decoded as an image."
        : "The selected file could not be decoded as an image.";
    }
  };

  const handleFileSelection = async (fileList: FileList | File[] | null) => {
    const selectedFiles = fileList ? Array.from(fileList) : [];
    const signatures = new Set(
      photos
        .filter((photo): photo is Extract<ProfilePhotoSelection, { kind: "upload" }> => photo.kind === "upload")
        .map(({ file }) => `${file.name}:${file.size}:${file.lastModified}`)
    );
    const additions: ProfilePhotoSelection[] = [];
    let issue: string | null = null;

    for (const file of selectedFiles) {
      if (photos.length + additions.length >= 6) {
        issue = "Maximum limit of 6 photos reached.";
        break;
      }

      const validationError = await validateImageFile(file);
      if (validationError) {
        issue = validationError;
        continue;
      }

      const signature = `${file.name}:${file.size}:${file.lastModified}`;
      if (signatures.has(signature)) {
        issue = `${file.name} is already selected.`;
        continue;
      }

      signatures.add(signature);
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);
      additions.push({ kind: "upload", file, previewUrl });
    }

    if (additions.length > 0) setPhotos((current) => [...current, ...additions]);
    if (issue) showFeedback(issue);
  };

  const startCamera = async () => {
    const requestId = ++cameraRequestIdRef.current;
    setCameraError(null);
    setCameraCapture(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraOpen(true);
      setCameraError("Live camera capture is not supported in this browser. Use Add Photos to choose an image.");
      return;
    }

    stopCamera();
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      if (cameraRequestIdRef.current !== requestId) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      cameraStreamRef.current = stream;
      setCameraStream(stream);
    } catch (error) {
      setCameraError(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access or use Add Photos instead."
          : error instanceof DOMException && error.name === "NotFoundError"
            ? "No camera was found on this device. Use Add Photos to choose an image."
            : "Could not start the camera. Check browser permissions or use Add Photos instead."
      );
    }
  };

  const captureCameraPhoto = () => {
    const video = cameraVideoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError("The live camera preview is not ready yet. Please wait and try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Could not capture an image from this camera.");
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError("Could not capture an image from this camera.");
        return;
      }
      const capturedFile = new File(
        [blob],
        `campusverse-camera-${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );
      setCameraCapture(capturedFile);
      setCameraCapturePreview(URL.createObjectURL(capturedFile));
      stopCamera();
    }, "image/jpeg", 0.92);
  };

  const confirmCameraPhoto = async () => {
    if (!cameraCapture) return;
    if (photos.length >= 6) {
      setCameraError("Maximum limit of 6 photos reached.");
      return;
    }

    const previewUrl = cameraCapturePreview ?? URL.createObjectURL(cameraCapture);
    if (!cameraCapturePreview) setCameraCapturePreview(previewUrl);
    setSaving(true);
    setFeedbackMessage(null);
    try {
      await onSavePhotos([
        ...photos,
        { kind: "upload", file: cameraCapture, previewUrl },
      ]);
      setCameraCapture(null);
      URL.revokeObjectURL(previewUrl);
      setCameraCapturePreview(null);
      setCameraOpen(false);
      setCameraError(null);
      onClose();
    } catch (error) {
      showFeedback(error instanceof Error ? error.message : "Could not upload the captured photo.");
    } finally {
      setSaving(false);
    }
  };

  const closeCamera = () => {
    cameraRequestIdRef.current += 1;
    stopCamera();
    setCameraOpen(false);
    setCameraCapture(null);
    if (cameraCapturePreview) URL.revokeObjectURL(cameraCapturePreview);
    setCameraCapturePreview(null);
    setCameraError(null);
  };

  // Move photo left
  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...photos];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setPhotos(updated);
  };

  // Move photo right
  const handleMoveRight = (index: number) => {
    if (index === photos.length - 1) return;
    const updated = [...photos];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setPhotos(updated);
  };

  // Set as Main photo (moves to index 0)
  const handleSetMain = (index: number) => {
    if (index === 0) return;
    const updated = [...photos];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    setPhotos(updated);
    showFeedback("Main photo updated!");
  };

  // Remove photo
  const handleRemovePhoto = (index: number) => {
    if (photos.length <= 2) {
      showFeedback("Minimum 2 photos are required for your campus profile.");
      return;
    }
    const removed = photos[index];
    if (removed.kind === "upload") {
      URL.revokeObjectURL(removed.previewUrl);
      previewUrlsRef.current.delete(removed.previewUrl);
    }
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    showFeedback("Photo removed.");
  };

  const handleAddCatalogPhoto = (url: string) => {
    if (photos.length >= 6) {
      showFeedback("Maximum limit of 6 photos reached.");
      return;
    }
    if (photos.some((photo) => photoUrl(photo) === url)) {
      showFeedback("This photo is already in your gallery.");
      return;
    }
    setPhotos([...photos, { kind: "url", url }]);
    showFeedback("Photo added to gallery!");
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedbackMessage(null);
    try {
      await onSavePhotos(photos);
      onClose();
    } catch (error) {
      showFeedback(error instanceof Error ? error.message : "Could not save photos. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Photos from catalog not yet in user photos
  const availableToAdd = PHOTO_CATALOG.filter(
    (url) => !photos.some((photo) => photoUrl(photo) === url)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[85dvh] rounded-t-[28px] sm:rounded-[28px] bg-[#121424] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.08] shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Manage Photos</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {photos.length} of 6 photos • Minimum 2 required
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo manager"
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div role="status" className="px-5 py-2 bg-gradient-to-r from-[#9B42F6]/20 to-[#E93C9A]/20 border-b border-[#B365FC]/30 text-xs text-slate-200 font-medium flex items-center justify-between">
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-5 space-y-6">
          {/* Current Photos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Gallery (Reorder &amp; Main)
              </span>
              <span className="text-xs font-semibold text-[#B365FC]">
                {photos.length}/6 slots used
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
              {photos.map((photo, idx) => {
                const url = photoUrl(photo);
                const isMain = idx === 0;
                return (
                  <div
                    key={photo.kind === "existing" ? `photo-${photo.photoId}` : `${photo.kind}-${url}`}
                    className={`relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 border transition-all ${isMain
                      ? "border-[#B365FC] ring-2 ring-[#B365FC]/30 shadow-lg"
                      : "border-white/10 hover:border-white/20"
                      }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Profile photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Badge: Main or Slot Number */}
                    <div className="absolute top-2 left-2">
                      {isMain ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#B365FC] text-white text-[10px] font-bold shadow-md uppercase tracking-wider">
                          Main
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-slate-300 text-[10px] font-medium border border-white/10">
                          #{idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Delete button (disabled if <= 2 photos) */}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      disabled={photos.length <= 2}
                      aria-label={`Remove photo ${idx + 1}`}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${photos.length <= 2
                        ? "bg-black/40 text-slate-500 cursor-not-allowed"
                        : "bg-black/60 hover:bg-rose-500 text-white backdrop-blur-md"
                        }`}
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>

                    {/* Bottom controls overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between gap-1">
                      {/* Move Left */}
                      <button
                        type="button"
                        onClick={() => handleMoveLeft(idx)}
                        disabled={idx === 0}
                        aria-label="Move photo left"
                        className="px-2 py-1 rounded bg-white/10 text-white text-[11px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20"
                      >
                        ←
                      </button>

                      {/* Set as Main */}
                      {!isMain && (
                        <button
                          type="button"
                          onClick={() => handleSetMain(idx)}
                          className="px-2 py-1 rounded bg-[#B365FC]/30 hover:bg-[#B365FC]/50 text-white text-[10px] font-semibold truncate border border-[#B365FC]/40"
                        >
                          Make Main
                        </button>
                      )}

                      {/* Move Right */}
                      <button
                        type="button"
                        onClick={() => handleMoveRight(idx)}
                        disabled={idx === photos.length - 1}
                        aria-label="Move photo right"
                        className="px-2 py-1 rounded bg-white/10 text-white text-[11px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20"
                      >
                        →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Photos Section */}
          {photos.length < 6 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Add Photos ({6 - photos.length} slots left)
                </span>
              </div>

              <input
                ref={filePickerRef}
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp,.wps"
                multiple
                className="hidden"
                onChange={(event) => {
                  void handleFileSelection(event.currentTarget.files);
                  event.currentTarget.value = "";
                }}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => filePickerRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-[#B365FC] text-white text-xs font-semibold hover:bg-[#a14ce9] transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Photos
                </button>
                <button
                  type="button"
                  onClick={() => void startCamera()}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-200 text-xs font-semibold hover:bg-white/10 transition-colors"
                >
                  Take Photo
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Choose JPEG, PNG, or WebP images up to 8 MB each. WPS documents must be exported as JPEG or PNG.
              </p>

              {cameraOpen && (
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3 space-y-3">
                  {cameraError && (
                    <p role="alert" className="text-xs text-amber-200">{cameraError}</p>
                  )}
                  {cameraCapturePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cameraCapturePreview}
                      alt="Captured photo preview"
                      className="w-full max-h-72 rounded-xl object-contain bg-black"
                    />
                  ) : cameraStream ? (
                    <video
                      ref={cameraVideoRef}
                      autoPlay
                      playsInline
                      muted
                      aria-label="Live camera preview"
                      className="w-full max-h-72 rounded-xl object-contain bg-black"
                    />
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {cameraCapture ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (cameraCapturePreview) URL.revokeObjectURL(cameraCapturePreview);
                            setCameraCapture(null);
                            setCameraCapturePreview(null);
                            void startCamera();
                          }}
                          className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-200"
                        >
                          Retake
                        </button>
                        <button
                          type="button"
                          onClick={() => void confirmCameraPhoto()}
                          className="px-4 py-2 rounded-xl bg-[#B365FC] text-xs font-semibold text-white"
                        >
                          Use Photo
                        </button>
                      </>
                    ) : cameraStream ? (
                      <button
                        type="button"
                        onClick={captureCameraPhoto}
                        className="px-4 py-2 rounded-xl bg-[#B365FC] text-xs font-semibold text-white"
                      >
                        Capture Photo
                      </button>
                    ) : cameraError ? (
                      <button
                        type="button"
                        onClick={() => filePickerRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white"
                      >
                        Choose a Photo Instead
                      </button>
                    ) : (
                      <p className="text-xs text-slate-400">Starting camera…</p>
                    )}
                    <button
                      type="button"
                      onClick={closeCamera}
                      className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300"
                    >
                      Close Camera
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2.5">
                {availableToAdd.slice(0, 6 - photos.length).map((url, i) => (
                  <button
                    key={`available-${i}`}
                    type="button"
                    onClick={() => handleAddCatalogPhoto(url)}
                    className="relative group rounded-xl overflow-hidden aspect-[4/5] border border-dashed border-white/20 hover:border-[#B365FC] transition-all bg-slate-900"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="Available catalog photo"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#B365FC] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <PlusIcon className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Done button */}
        <div className="px-5 py-3 border-t border-white/[0.08] bg-[#0E101D] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-400">
            {photos.length < 2 ? "Requires min 2 photos" : `${photos.length} photos ready`}
          </span>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || photos.length < 2}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>Save Photos</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
