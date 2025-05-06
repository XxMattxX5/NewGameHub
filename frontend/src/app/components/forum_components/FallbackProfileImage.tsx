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

export default function FallbackProfileImage({
  src,
  alt = "Profile picture",
  width = 30,
  height = 30,
  className = "",
}: Props) {
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
}
