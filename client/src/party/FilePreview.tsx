import React from "react";
import "./FileUpload.scss";

export interface File {
  name: string;
  size: number;
  type: string;
  extension: string;
  content: ArrayBuffer;
}

const convertBytesToMB = (bytes) => (bytes / 1000000).toFixed(2);

interface FilePreviewProps {
  file: File;
  removeFileCb: (fileName: string) => void;
}
const FilePreview: React.FC<FilePreviewProps> = ({ file, removeFileCb }) => {
  const isImageFile = file.type.split("/")[0] === "image";
  return (
    <div className="FilePreviewContainer__preview">
      <div>
        {isImageFile ? (
          <img
            className="FilePreviewContainer__image"
            src={URL.createObjectURL(file)}
            alt={`file preview`}
          />
        ) : (
          <video width="100%" height="100%" controls={false} preload="metadata">
            <source src={URL.createObjectURL(file)} type="video/mp4" />
          </video>
        )}
        <div className="FilePreviewContainer__metadata">
          <div>
            <span>{convertBytesToMB(file.size)} mb</span>
          </div>
        </div>
        <button
          title="Delete this story"
          className="FilePreviewContainer__trash"
          onClickCapture={() => removeFileCb(file.name)}
        >
          🗑
        </button>
      </div>
    </div>
  );
};

export default FilePreview;
