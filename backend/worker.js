// ============================================
// Cloudflare Worker - Proxy pour API Groq
// ============================================

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_TRANSCRIPTION_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

// Rate limiting configuration
const RATE_LIMITS = {
	DAILY_LIMIT: 50,        // Max 50 requêtes par jour par IP
	MINUTE_LIMIT: 5,        // Max 5 requêtes par minute par IP
	MINUTE_WINDOW: 60       // Fenêtre de 60 secondes
};

// CORS headers
const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400',
};

/**
 * Vérifie et applique le rate limiting
 * @returns {object} { allowed: boolean, remaining: number, resetTime: number }
 */
async function checkRateLimit(request, env) {
	// Récupérer l'IP du client
	const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

	const now = Date.now();
	const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
	const currentMinute = Math.floor(now / 1000 / 60); // Timestamp en minutes

	// Clés pour KV
	const dailyKey = `ratelimit:daily:${ip}:${today}`;
	const minuteKey = `ratelimit:minute:${ip}:${currentMinute}`;

	try {
		// Vérifier limite quotidienne
		const dailyCount = await env.RATE_LIMIT_KV.get(dailyKey);
		const dailyRequests = dailyCount ? parseInt(dailyCount) : 0;

		if (dailyRequests >= RATE_LIMITS.DAILY_LIMIT) {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			tomorrow.setHours(0, 0, 0, 0);

			return {
				allowed: false,
				remaining: 0,
				resetTime: tomorrow.getTime(),
				message: `Limite quotidienne atteinte (${RATE_LIMITS.DAILY_LIMIT} requêtes/jour)`
			};
		}

		// Vérifier limite par minute
		const minuteCount = await env.RATE_LIMIT_KV.get(minuteKey);
		const minuteRequests = minuteCount ? parseInt(minuteCount) : 0;

		if (minuteRequests >= RATE_LIMITS.MINUTE_LIMIT) {
			const resetTime = (currentMinute + 1) * 60 * 1000;
			return {
				allowed: false,
				remaining: RATE_LIMITS.DAILY_LIMIT - dailyRequests,
				resetTime: resetTime,
				message: `Trop de requêtes. Maximum ${RATE_LIMITS.MINUTE_LIMIT} requêtes par minute`
			};
		}

		// Incrémenter les compteurs
		await env.RATE_LIMIT_KV.put(dailyKey, (dailyRequests + 1).toString(), {
			expirationTtl: 86400 // 24 heures
		});

		await env.RATE_LIMIT_KV.put(minuteKey, (minuteRequests + 1).toString(), {
			expirationTtl: RATE_LIMITS.MINUTE_WINDOW
		});

		return {
			allowed: true,
			remaining: RATE_LIMITS.DAILY_LIMIT - dailyRequests - 1,
			resetTime: null
		};

	} catch (error) {
		// En cas d'erreur KV, on laisse passer (fail-open)
		console.error('Rate limit check error:', error);
		return { allowed: true, remaining: -1, resetTime: null };
	}
}

export default {
	async fetch(request, env, ctx) {
		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: CORS_HEADERS
			});
		}

		// Only allow POST requests
		if (request.method !== 'POST') {
			return new Response('Method not allowed', {
				status: 405,
				headers: CORS_HEADERS
			});
		}

		// Vérifier le rate limiting
		const rateLimitResult = await checkRateLimit(request, env);

		if (!rateLimitResult.allowed) {
			return new Response(JSON.stringify({
				error: {
					type: 'rate_limit_exceeded',
					message: rateLimitResult.message,
					resetTime: rateLimitResult.resetTime
				}
			}), {
				status: 429,
				headers: {
					'Content-Type': 'application/json',
					'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
					'X-RateLimit-Reset': rateLimitResult.resetTime ? new Date(rateLimitResult.resetTime).toISOString() : '',
					'Retry-After': rateLimitResult.resetTime ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() : '60',
					...CORS_HEADERS
				}
			});
		}

		try {
			const contentType = request.headers.get('Content-Type') || '';

			if (contentType.includes('multipart/form-data')) {
				// Handle Audio Transcription (Whisper)
				const formData = await request.formData();
				const audioFile = formData.get('file');
				const model = formData.get('model') || 'whisper-large-v3';

				if (!audioFile) {
					return new Response(JSON.stringify({ error: 'No audio file provided' }), {
						status: 400,
						headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
					});
				}

				// Forward to Groq Whisper API
				const whisperFormData = new FormData();
				whisperFormData.append('file', audioFile);
				whisperFormData.append('model', model);
				if (formData.has('language')) whisperFormData.append('language', formData.get('language'));
				if (formData.has('prompt')) whisperFormData.append('prompt', formData.get('prompt'));

				const groqResponse = await fetch(GROQ_TRANSCRIPTION_URL, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${env.GROQ_API_KEY}`
					},
					body: whisperFormData
				});

				const data = await groqResponse.json();
				return new Response(JSON.stringify(data), {
					status: groqResponse.status,
					headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
				});

			} else {
				// Handle Chat Completion (JSON)
				const body = await request.json();

				if (!body.messages || !Array.isArray(body.messages)) {
					return new Response(JSON.stringify({ error: 'Invalid request body' }), {
						status: 400,
						headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
					});
				}

				const groqResponse = await fetch(GROQ_CHAT_URL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${env.GROQ_API_KEY}`
					},
					body: JSON.stringify({
						model: body.model || 'llama-3.3-70b-versatile',
						messages: body.messages,
						temperature: body.temperature || 0.8,
						max_tokens: body.max_tokens || 1024,
						top_p: body.top_p || 0.9
					})
				});

				const data = await groqResponse.json();
				return new Response(JSON.stringify(data), {
					status: groqResponse.status,
					headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
				});
			}

		} catch (error) {
			console.error('Worker error:', error);
			return new Response(JSON.stringify({
				error: 'Internal server error',
				message: error.message
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...CORS_HEADERS
				}
			});
		}
	}
};
