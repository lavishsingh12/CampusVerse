"use client";

import React from "react";
import { PhotoProgressIndicator } from "./PhotoProgressIndicator";

interface ProfilePhotoViewerProps {
  photos: string[];
  currentPhotoIndex: number;
  onNextPhoto: () => void;
  onPrevPhoto: () => void;
  altText: string;
}

export function ProfilePhotoViewer({
  photos,
  currentPhotoIndex,
  onNextPhoto,
  onPrevPhoto,
  altText,
}: ProfilePhotoViewerProps) {
  

  const currentPhoto = photos[currentPhotoIndex] || photos[0];

  return (
    <div
      className="absolute inset-0 w-full h-full select-none overflow-hidden cursor-pointer"
      
    >
      <PhotoProgressIndicator
        total={photos.length}
        currentIndex={currentPhotoIndex}
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={`${currentPhoto}-${currentPhotoIndex}`}
        src={currentPhoto}
        alt={altText}
        draggable={false}
        className="w-full h-full object-cover object-center animate-fade-in pointer-events-none"
        loading="eager"
      />

      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
    </div>
  );
}