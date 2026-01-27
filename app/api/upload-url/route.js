import aws from "aws-sdk";

const s3 = new aws.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { fileName, fileType } = req.query;
  if (!fileName || !fileType) {
    res.status(400).json({ error: "Missing fileName or fileType" });
    return;
  }
  // Validate file type and size (client should also validate)
  if (!["image/jpeg", "image/png"].includes(fileType)) {
    res.status(400).json({ error: "Only JPG or PNG allowed" });
    return;
  }
  // (Optional: Add server-side size check if file size is sent)
  const url = await s3.getSignedUrlPromise("putObject", {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
  });
  res.status(200).json({ uploadUrl: url });
}
