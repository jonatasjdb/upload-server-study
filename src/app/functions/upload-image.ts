import { Readable } from "node:stream";
import z from "zod";
import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { uploadFileToStorage } from "@/infra/storage/upload-file-to-storage";

const uploadImageInput = z.object({
	fileName: z.string(),
	contentType: z.string(),
	contentStream: z.instanceof(Readable),
});

type UploadImageInput = z.input<typeof uploadImageInput>;

const allowedMimeTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

export async function uploadImage(input: UploadImageInput) {
	const { fileName, contentType, contentStream } =
		uploadImageInput.parse(input);

	if (!allowedMimeTypes.includes(contentType)) {
		// throw Object.assign(new Error("Invalid Format"), { statusCode: 400 });
		throw new Error("Invalid");
	}

	const { url, key } = await uploadFileToStorage({
		fileName,
		contentType,
		contentStream,
	});

	await db.insert(schema.uploads).values({
		name: fileName,
		remoteKey: key,
		remoteUrl: url,
	});

	return true;
}
