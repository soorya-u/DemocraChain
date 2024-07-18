import { useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

import { multiFormHeaders } from "@/constants/headers";

const Upload = ({ setLoader, notifySuccess, notifyError, setPdf }) => {
  const uploadToIPFS = async (file) => {
    if (file) {
      try {
        setLoader(true);
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          maxBodyLength: "Infinity",
          headers: multiFormHeaders,
        });

        const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

        setPdf(url);
        setLoader(false);
        notifySuccess("Cover Image Uploade Successfully");
      } catch (error) {
        console.log(error.message);
        setLoader(false);
        notifyError("Unable to upload image to Pinata");
      }
    }
  };

  const onDrop = useCallback(async (acceptedFile) => {
    await uploadToIPFS(acceptedFile[0]);
  }, []);

  const { getInputProps, getRootProps } = useDropzone({
    onDrop,
    maxSize: 500000000000,
  });
  return (
    <div {...getRootProps()} className="messageBox">
      <div className="fileUploadWrapper">
        <label htmlFor="file">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 337 337"
          >
            <circle
              strokeWidth="20"
              stroke="#fff"
              fill="none"
              r="158.5"
              cy="168.5"
              cx="168.5"
            ></circle>
            <path
              strokeLinecap="round"
              strokeWidth="25"
              stroke="#fff"
              d="M167.759 79V259"
            ></path>
            <path
              strokeLinecap="round"
              strokeWidth="25"
              stroke="#fff"
              d="M79 167.138H259"
            ></path>
          </svg>
          <span className="tooltip">Upload PDF Document</span>
        </label>
        <input {...getInputProps()} type="file" id="file" name="file" />
      </div>
    </div>
  );
};

export default Upload;