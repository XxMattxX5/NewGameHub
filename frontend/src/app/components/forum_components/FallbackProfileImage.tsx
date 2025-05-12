"use client";
import react, { useState, useEffect } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
};

/**
 * FallbackProfileImage Component
 *
 * This component displays a user profile image with automatic fallback handling.
 * If the provided `src` fails to load (e.g., due to a broken URL), a default
 * placeholder image is shown instead.
 *
 */

const FallbackProfileImage = ({
  src,
  alt = "Profile picture",
  width = 30,
  height = 30,
  className = "",
}: Props) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      className={className}
      onError={() => setImgSrc("/images/blank-profile-picture.png")}
    />
  );
};

export default FallbackProfileImage;
