import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import z from "zod";
import { env } from "@/env";
import { r2 } from "./client";

const uploadFileToStorageInput = z.object({
	folder: z.enum(["images", "downloads"]).default("downloads"),
	fileName: z.string(),
	contentType: z.string(),
	contentStream: z.instanceof(Readable),
});

type UploadFileToStorageInput = z.input<typeof uploadFileToStorageInput>;

export async function uploadFileToStorage(input: UploadFileToStorageInput) {
	const { fileName, contentType, contentStream, folder } =
		uploadFileToStorageInput.parse(input);

	const uniqueFileName = `${folder}/${randomUUID()}-${fileName}`;

	const upload = new Upload({
		client: r2,
		params: {
			Key: uniqueFileName,
			Bucket: env.CLOUDFLARE_BUCKET,
			Body: contentStream,
			ContentType: contentType,
		},
	});

	await upload.done();

	return {
		key: uniqueFileName,
		url: new URL(uniqueFileName, env.CLOUDFLARE_URL_PUBLIC).toString(),
	};
}
