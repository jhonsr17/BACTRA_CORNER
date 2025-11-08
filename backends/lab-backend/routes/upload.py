from fastapi import APIRouter, File, UploadFile
import uuid, os

router = APIRouter()

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload_image/")
async def upload_image(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    filename = f"{file_id}.jpg"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(await file.read())

    return {"status": "success", "file_id": file_id, "path": path}
