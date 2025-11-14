export function requestLogger(req, res, next) {
    const start = Date.now();
    // Tangkap response finish untuk dapat status & durasi
    res.on("finish", () => {
        const duration = Date.now() - start;
        const { method, originalUrl: url, ip, headers } = req;
        const status = res.statusCode;
        const color = status >= 500 ? "\x1b[31m" : // red
            status >= 400 ? "\x1b[33m" : // yellow
                status >= 300 ? "\x1b[36m" : // cyan
                    status >= 200 ? "\x1b[32m" : // green
                        "\x1b[37m"; // white
        // Bersihkan IP (ambil X-Forwarded-For atau fallback)
        const clientIp = headers["x-forwarded-for"]?.split(",")[0]?.trim() || ip || "unknown";
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, "0");
        const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        const paddedMethod = method.padEnd(6);
        const paddedUrl = url.length > 30 ? url.substring(0, 27) + "..." : url.padEnd(30);
        console.log(`${color}📥 [${timestamp}] ${paddedMethod} ${paddedUrl} → ${status} (${clientIp}) ${duration}ms\x1b[0m`);
    });
    next();
}
//# sourceMappingURL=reqlog-middleware.js.map