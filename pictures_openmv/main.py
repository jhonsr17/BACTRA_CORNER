import sensor, time, pyb, ustruct

sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)
sensor.skip_frames(time=2000)

usb = pyb.USB_VCP()
led = pyb.LED(1)
i = 0

print("📸 Cámara lista para capturar y enviar fotos...")

while True:
    if usb.isconnected():
        img = sensor.snapshot()
        led.on()
        buff = img.compress(quality=85)  # Compresión manual desde RGB565
        size = ustruct.pack("<L", len(buff))
        usb.write(size)
        usb.write(buff)
        led.off()
        print("✅ Foto enviada #", i)
        i += 1
        time.sleep(5)
    else:
        time.sleep(2)
