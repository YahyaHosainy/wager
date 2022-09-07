import React, { useRef, useState } from "react";
import ButtonWithLoader from "../layout/buttons/ButtonWithLoader";
import FilePreview from "./FilePreview";
import "./FileUpload.scss";

const DEFAULT_MAX_FILE_SIZE_IN_BYTES = 15000000;

const convertNestedObjectToArray = (nestedObj) =>
  Object.keys(nestedObj).map((key) => nestedObj[key]);

interface FileUploadProps {
  label: string;
  updateFilesCb: (files: any) => void;
  maxFileSizeInBytes?: number;
  multiple?: boolean;
  accept: string;
}
const FileUpload: React.FC<FileUploadProps> = ({
  label,
  updateFilesCb,
  maxFileSizeInBytes = DEFAULT_MAX_FILE_SIZE_IN_BYTES,
  multiple,
  accept,
}) => {
  const fileInputField = useRef(null);
  const [files, setFiles] = useState({});

  const handleUploadBtnClick = () => {
    fileInputField.current.click();
  };

  const addNewFiles = (newFiles) => {
    for (const file of newFiles) {
      if (file.size <= maxFileSizeInBytes) {
        if (!multiple) {
          return { file };
        }
        files[file.name] = file;
      }
    }
    return { ...files };
  };

  const callUpdateFilesCb = (files) => {
    const filesAsArray = convertNestedObjectToArray(files);
    updateFilesCb(filesAsArray);
  };

  const handleNewFileUpload = (e) => {
    const { files: newFiles } = e.target;
    if (newFiles.length) {
      const updatedFiles = addNewFiles(newFiles);
      setFiles(updatedFiles);
      callUpdateFilesCb(updatedFiles);
    }
  };

  const removeFile = (fileName) => {
    delete files[fileName];
    setFiles({ ...files });
    callUpdateFilesCb({ ...files });
  };

  return (
    <>
      <div className="FileUploadContainer">
        <label className="FileUploadContainer__input-label">{label}</label>
        <p className="FileUploadContainer__drop-text">
          Drag and drop files here or
        </p>
        <ButtonWithLoader onClick={handleUploadBtnClick}>
          <span> Browse {multiple ? "files" : "a file"}</span>
        </ButtonWithLoader>
        <input
          className="FileUploadContainer__form-field"
          type="file"
          ref={fileInputField}
          onChange={handleNewFileUpload}
          title=""
          value=""
          accept={accept}
          multiple={multiple}
        />
      </div>
      <div className="FilePreviewContainer">
        {Object.keys(files).length > 0 && <h4>Files to be uploaded</h4>}
        <div className="FilePreviewContainer__preview-list">
          {Object.keys(files).map((fileName) => {
            return (
              <FilePreview
                key={fileName}
                file={files[fileName]}
                removeFileCb={removeFile}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default FileUpload;
