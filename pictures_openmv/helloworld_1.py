import sensor, time, os

# === Configuración de la cámara ===
sensor.reset()
sensor.set_pixformat(sensor.JPEG)     # Captura en formato JPEG
sensor.set_framesize(sensor.VGA)      # Resolución 640x480
sensor.skip_frames(time=2000)         # Espera a que la cámara se estabilice
clock = time.clock()

# === Carpeta de almacenamiento ===
FOLDER = "/pictures_openmv"

# Crear carpeta si no existe
try:
    os.mkdir(FOLDER)
    print("Carpeta creada:", FOLDER)
except OSError:
    print("Carpeta ya existe:", FOLDER)

# === Captura automática ===
INTERVALO = 5  # segundos entre fotos
ultimo_tiempo = time.ticks_ms()

while True:
    clock.tick()
    img = sensor.snapshot()

    # Verifica si ya pasaron INTERVALO segundos
    if time.ticks_diff(time.ticks_ms(), ultimo_tiempo) >= INTERVALO * 1000:
        # Genera un ID único con el tiempo actual
        id_unico = str(time.ticks_ms())
        filename = "%s/%s.jpg" % (FOLDER, id_unico)
        img.save(filename)
        print("📸 Foto guardada:", filename)
        ultimo_tiempo = time.ticks_ms()
