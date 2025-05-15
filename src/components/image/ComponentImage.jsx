import React, { useState, useEffect } from "react";

const ComponentImage = ({ content, width = 200, height = "auto" }) => {
  const [imageSrc, setImageSrc] = useState();

  useEffect(() => {
    // Decode base64 image content if provided
    if (content) {
      setImageSrc(`data:image/jpeg;base64,${content}`); // Assuming the content is base64 encoded
    }
  }, [content]);

  return imageSrc ? (
    <img
      src={imageSrc}
      alt="Option"
      style={{ width, height, borderRadius: "10px" }}
    />
  ) : (
    <p>Loading image...</p>
  );
};

export default ComponentImage;
