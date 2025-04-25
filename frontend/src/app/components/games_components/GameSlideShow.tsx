"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "@/app/styles/gamedetail.module.css";
import { Button, Grid } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export type VideoScreenshot = {
  id: string;
  src: string;
};

type Props = {
  videos: VideoScreenshot[];
  screenshots: VideoScreenshot[];
};

const GameSlideShow = ({ videos, screenshots }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const [screenSize, setScreenSize] = useState("normal");

  const mediaWidth =
    screenSize === "small" ? 330 : screenSize === "tiny" ? 280 : 700;
  const mediaHeight =
    screenSize === "small" ? 220 : screenSize === "tiny" ? 170 : 380;

  const scrollAmount = mediaWidth + 20;

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current && containerRef.current) {
        const isOverflow =
          contentRef.current.scrollWidth > containerRef.current.clientWidth;
        setIsOverflowing(isOverflow);
      }
    };

    const handleResize = () => {
      if (window.innerWidth < 400) {
        setScreenSize("tiny");
      } else if (window.innerWidth < 700) {
        setScreenSize("small");
      } else {
        setScreenSize("normal");
      }
    };

    handleResize();
    checkOverflow();

    window.addEventListener("resize", handleResize);
    window.addEventListener("resize", checkOverflow);
    return () => {
      window.removeEventListener("resize", checkOverflow);
      window.removeEventListener("resize", handleResize);
    };
  }, [screenSize]);

  const scrollLeft = () => {
    if (contentRef.current) {
      contentRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (contentRef.current) {
      contentRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <Grid className={styles.carousel_wrapper}>
      {isOverflowing && (
        <Button
          onClick={scrollLeft}
          id={styles.slide_show_left_arrow}
          sx={{
            paddingRight: "20px",
            "&:hover": {
              backgroundColor: "inherit",
              boxShadow: "none",
            },
          }}
        >
          <ArrowBackIosNewIcon />
        </Button>
      )}
      <Grid id={styles.slide_show_container} ref={containerRef}>
        <Grid
          ref={contentRef}
          id={styles.slide_show_box}
          sx={{ justifyContent: !isOverflowing ? "center" : "flex-start" }}
        >
          {videos.map((video) => (
            <iframe
              key={video.id}
              src={video.src}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              height={mediaHeight}
              width={mediaWidth}
              style={{ flexShrink: 0 }}
            />
          ))}
          {screenshots.map((screenshot) => (
            <Image
              key={screenshot.id}
              src={"https://" + screenshot.src.replace("t_thumb", "t_original")}
              alt="Screenshot"
              height={mediaHeight}
              width={mediaWidth}
            />
          ))}
        </Grid>
      </Grid>
      {isOverflowing && (
        <Button
          onClick={scrollRight}
          sx={{
            paddingRight: "20px",
            "&:hover": {
              backgroundColor: "inherit",
              boxShadow: "none",
            },
          }}
          id={styles.slide_show_right_arrow}
        >
          <ArrowForwardIosIcon />
        </Button>
      )}
    </Grid>
  );
};

export default GameSlideShow;
