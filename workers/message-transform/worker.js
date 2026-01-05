/**
 * Message Transform Worker
 * Uses Cloudflare Workers AI to transform messages into random styles
 */

const STYLES = [
  {
    name: "Shakespeare",
    prompt: "Rewrite this message in Shakespearean English with thee, thou, hath, and dramatic flair. Keep the core meaning. Be brief."
  },
  {
    name: "Pirate",
    prompt: "Rewrite this message as a pirate would say it, with arrrs, matey, and nautical terms. Keep the core meaning. Be brief."
  },
  {
    name: "Yoda",
    prompt: "Rewrite this message in Yoda's speech pattern, with inverted sentence structure. Keep the core meaning. Be brief."
  },
  {
    name: "Corporate",
    prompt: "Rewrite this message in excessive corporate jargon with synergy, leverage, and circle back. Keep the core meaning. Be brief."
  },
  {
    name: "Poet",
    prompt: "Rewrite this message as a short rhyming poem. Keep the core meaning. Be brief, 4-6 lines max."
  },
  {
    name: "Noir Detective",
    prompt: "Rewrite this message in the style of a 1940s noir detective narration. Keep the core meaning. Be brief."
  },
  {
    name: "Surfer",
    prompt: "Rewrite this message as a laid-back surfer dude would say it. Keep the core meaning. Be brief."
  },
  {
    name: "Victorian",
    prompt: "Rewrite this message in formal Victorian English with utmost propriety. Keep the core meaning. Be brief."
  }
];

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { message } = await request.json();

      if (!message || message.trim().length === 0) {
        return new Response(JSON.stringify({ error: "Message required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Pick a random style
      const style = STYLES[Math.floor(Math.random() * STYLES.length)];

      // Call Cloudflare Workers AI
      const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
          {
            role: "system",
            content: style.prompt
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 256,
      });

      return new Response(JSON.stringify({
        original: message,
        transformed: response.response,
        style: style.name
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
