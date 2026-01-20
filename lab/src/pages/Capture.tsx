// src/pages/Capture.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Capture.css";

export default function Capture() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [savedImage, setSavedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Seleccionar archivo manualmente
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setSavedImage(null);
    setFilePreview(f ? URL.createObjectURL(f) : null);
  };

  // Capturar imagen desde OpenMV
  const handleTakePhoto = async () => {
    setLoading(true);
    try {
      const resp = await fetch("http://127.0.0.1:8000/capture_from_openmv/", {
        method: "POST",
      });
      const json = await resp.json();

      if (resp.ok && json.saved_as) {
        setSavedImage(json.saved_as);
        if (json.image_base64) {
          setFilePreview(`data:image/jpeg;base64,${json.image_base64}`);
        } else if (json.image_url) {
          setFilePreview(json.image_url);
        }
        alert("Foto capturada correctamente");
      } else {
        alert("Error capturando imagen: " + JSON.stringify(json));
      }
    } catch (error: any) {
      alert("No se pudo comunicar con la cámara: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Subir imagen al backend
  const handleUploadImage = async () => {
    if (!file && !savedImage) {
      return alert("Primero selecciona o toma una foto 📸");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("sample_id", id || "sin_id");

    if (file) {
      formData.append("file", file);
    } else if (savedImage) {
      formData.append("saved_image", savedImage);
    }

    try {
      const resp = await fetch("http://127.0.0.1:8000/upload_image/", {
        method: "POST",
        body: formData,
      });
      const json = await resp.json();

      if (resp.ok) {
        alert("Imagen subida correctamente");
        // 🚀 Redirigir al resultado
        navigate(`/result/${id}`);
      } else {
        alert("Error en el servidor: " + JSON.stringify(json));
      }
    } catch (error: any) {
      alert("Error subiendo la imagen: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Volver a tomar / cambiar imagen
  const handleRetake = () => {
    setFile(null);
    setFilePreview(null);
    setSavedImage(null);
  };

  return (
    <div className="space-y-6 rounded-2xl border bg-white p-6 shadow-md">
      <h1 className="text-2xl font-bold text-gray-800">Capturar muestra</h1>
      <p className="text-gray-600">
        ID de muestra: <strong>{id}</strong>
      </p>

      {!filePreview && (
        <div className="space-y-4">
          <button
            onClick={() => document.getElementById("file-input")?.click()}
            className="btn-primary w-full"
            disabled={loading}
          >
            Seleccionar Imagen
          </button>

          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={handleTakePhoto}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Tomando foto..." : "Tomar Foto con Cámara"}
          </button>
        </div>
      )}

      {filePreview && (
        <div className="space-y-4">
          <img
            src={filePreview}
            alt="preview"
            className="rounded-lg border h-64 w-full object-cover shadow-md"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={handleRetake} className="btn-secondary flex-1">
              Volver a tomar
            </button>

            <button
              onClick={handleUploadImage}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "Subiendo..." : "Subir Imagen"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
