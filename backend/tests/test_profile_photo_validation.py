import io
import unittest

from fastapi import HTTPException, UploadFile
from PIL import Image

from app.api.v1.profile_photos import validate_image_upload


def jpeg_bytes() -> bytes:
    output = io.BytesIO()
    Image.new("RGB", (32, 32), color=(90, 30, 140)).save(output, format="JPEG")
    return output.getvalue()


class ProfilePhotoValidationTests(unittest.IsolatedAsyncioTestCase):
    async def test_accepts_wps_named_file_when_contents_are_jpeg(self) -> None:
        upload = UploadFile(filename="wps-export.wps", file=io.BytesIO(jpeg_bytes()))

        image_bytes, extension = await validate_image_upload(upload)

        self.assertTrue(image_bytes.startswith(b"\xff\xd8\xff"))
        self.assertEqual(extension, "jpg")

    async def test_rejects_non_image_content_regardless_of_extension(self) -> None:
        upload = UploadFile(filename="renamed.jpg", file=io.BytesIO(b"%PDF-1.7 document"))

        with self.assertRaises(HTTPException) as raised:
            await validate_image_upload(upload)

        self.assertEqual(raised.exception.status_code, 400)

    async def test_reuses_upload_file_without_truncating_existing_bytes(self) -> None:
        upload = UploadFile(filename="repeat.jpg", file=io.BytesIO(jpeg_bytes()))

        first = await validate_image_upload(upload)
        second = await validate_image_upload(upload)

        self.assertTrue(first[0].startswith(b"\xff\xd8\xff"))
        self.assertTrue(second[0].startswith(b"\xff\xd8\xff"))
        self.assertEqual(first[1], "jpg")
        self.assertEqual(second[1], "jpg")


if __name__ == "__main__":
    unittest.main()
