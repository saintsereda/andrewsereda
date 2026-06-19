// Cloudflare Worker — глобальний лічильник унікальних відвідувачів.
//
// Як працює:
//   GET  → просто повертає поточне число (для тих, хто вже заходив).
//   POST → +1 і повертає нове число (новий унікальний відвідувач).
//
// Потрібна KV-прив'язка зі змінною KV (див. інструкцію в кінці розмови).

export default {
  async fetch(request, env) {
    // Дозволяємо сайту звертатися до Worker'а з іншого домену (CORS).
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Прелітний запит браузера.
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    // Поточне значення лічильника (0, якщо ще не існує).
    let count = parseInt(await env.KV.get("count"), 10) || 0;

    // Збільшуємо лише на POST — коли заходить новий унікальний відвідувач.
    if (request.method === "POST") {
      count += 1;
      await env.KV.put("count", String(count));
    }

    return new Response(JSON.stringify({ count }), {
      headers: { "Content-Type": "application/json", ...cors },
    });
  },
};
