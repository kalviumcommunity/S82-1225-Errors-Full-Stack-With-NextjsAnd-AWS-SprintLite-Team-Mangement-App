import S3Uploader from "../../components/S3Uploader";

export default function S3UploadDemoPage() {
  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">S3 Secure Upload Demo</h1>
      <p className="mb-4 text-gray-600">
        Upload a JPG or PNG file (max 2MB) directly to your S3 bucket using a presigned URL.
      </p>
      <S3Uploader />
      <div className="mt-8 text-sm text-gray-500">
        <p>
          After upload, check your S3 bucket (<code>{process.env.AWS_BUCKET_NAME}</code>) for the
          file.
        </p>
        <p>For security, only image/jpeg and image/png are allowed. Max size: 2MB.</p>
      </div>
    </div>
  );
}
