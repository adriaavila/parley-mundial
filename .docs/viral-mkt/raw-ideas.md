## Tesis: Parlai Mundial no debe venderse como “una app” ⚽️

Debe venderse como:

> **“La forma más divertida de vivir el Mundial con tus amigos: jugar, picarse, chatear, predecir y compartir momentos.”**

La IA debe ayudarte en 3 capas:

1. **Contenido viral generado con IA** para TikTok/Reels/Shorts.
2. **Medición + análisis automático** para saber qué hooks convierten.
3. **Features IA dentro del producto** para aumentar retención sin quemar plata.

También ojo: existe una app pública llamada **Parlai** enfocada en aprendizaje de idiomas por WhatsApp, así que conviene diferenciar fuerte **Parlai Mundial** como juego social mundialista, no como tutor de idiomas. ([Parlai][1])

---

# 1. Posicionamiento ganador

No digas:

> “Creamos una app para el Mundial.”

Di:

> **“Armamos el grupo definitivo para vivir el Mundial con tus panas.”**

O:

> **“Predice, pelea, celebra y humilla a tus amigos durante el Mundial.”**

O:

> **“El Mundial no se mira solo. Se juega con tus amigos.”**

La emoción central es:

| Emoción     | Traducción en contenido                  |
| ----------- | ---------------------------------------- |
| Competencia | “¿Quién sabe más de fútbol?”             |
| Amistad     | “Tu grupo va a vivir el Mundial aquí”    |
| Humor       | “El que pierde queda expuesto”           |
| FOMO        | “Si no entras ahora, te pierdes la liga” |
| Identidad   | “Representa a tu país / equipo / grupo”  |

---

# 2. Sistema de AI-generated content

## Formato base

Crea contenido con esta estructura:

```txt
Hook fuerte → Demo rápida de la app → Momento social → CTA
```

Ejemplo:

```txt
“Tu grupo de WhatsApp habla mucho de fútbol, pero ¿quién realmente sabe?”

[screen recording de Parlai Mundial]

“Crea tu grupo, predice partidos, mira el ranking y deja que la IA responda los piques.”

“Pruébala antes del Mundial.”
```

---

# 3. Hooks listos para usar

## Hooks de pique

1. **“Tu amigo dice que sabe de fútbol. Hazlo demostrarlo.”**
2. **“El Mundial va a separar a los que saben de los vendehumo.”**
3. **“Crea una liga con tus panas y mira quién queda último.”**
4. **“Si tu grupo habla de fútbol todo el día, necesitan esto.”**
5. **“La app para convertir el Mundial en una competencia real.”**

## Hooks sociales

6. **“El Mundial no se mira solo. Se juega con tus amigos.”**
7. **“Hice una app para que tu grupo viva el Mundial como una liga privada.”**
8. **“Esto convierte cualquier grupo de amigos en una mini Copa del Mundo.”**
9. **“Tu chat del Mundial, pero con ranking, predicciones y pique.”**
10. **“La app que tu grupo va a abrir cada vez que haya partido.”**

## Hooks de producto

11. **“Una app donde predices partidos, compites con amigos y la IA mete cizaña.”**
12. **“Como fantasy, quiniela y chat mundialista en una sola app.”**
13. **“Parlai Mundial: para jugar el Mundial con amigos, no solo verlo.”**
14. **“Crea tu grupo, predice, gana puntos y comparte el ranking.”**
15. **“El que sabe de fútbol sube. El que habla mucho, queda expuesto.”**

## Hooks tipo founder/building in public

16. **“Estoy creando una app para vivir el Mundial con amigos.”**
17. **“Tengo una idea: que cada grupo tenga su propia liga del Mundial.”**
18. **“¿Y si el Mundial tuviera chat, ranking, predicciones e IA?”**
19. **“Estoy construyendo esto antes del Mundial. Necesito testers.”**
20. **“Quiero que esta sea la app más divertida para grupos durante el Mundial.”**

---

# 4. 10 piezas de contenido para empezar esta semana

## Video 1 — “El amigo vendehumo”

```txt
Hook:
“Todos tenemos un amigo que dice que sabe de fútbol.”

Demo:
Mostrar creación de grupo + predicción.

Giro:
“Ahora lo puedes poner a competir contra todos.”

CTA:
“Crea tu liga en Parlai Mundial.”
```

## Video 2 — “Ranking del grupo”

```txt
Hook:
“Tu grupo necesita un ranking para saber quién realmente sabe.”

Demo:
Mostrar tabla de posiciones.

Giro:
“El último no opina más de fútbol por una semana.”

CTA:
“Pruébalo con tus amigos.”
```

## Video 3 — “IA metiendo cizaña”

```txt
Hook:
“Le pusimos IA al chat del Mundial para que responda los piques.”

Demo:
Mostrar una respuesta divertida de la IA.

Giro:
“Ahora el chat no se muere después del partido.”

CTA:
“Únete al beta.”
```

## Video 4 — “Antes del partido”

```txt
Hook:
“Antes de cada partido, todos tienen que dejar su predicción.”

Demo:
Predicción rápida.

Giro:
“Después no vale decir ‘yo sabía’.”

CTA:
“Crea tu grupo.”
```

## Video 5 — “Founder POV”

```txt
Hook:
“Estoy construyendo una app para que el Mundial sea más divertido con amigos.”

Demo:
Mostrar 3 pantallas.

Giro:
“Quiero que los grupos compitan, se piquen y compartan resultados.”

CTA:
“Déjame feedback y pruébala.”
```

---

# 5. Producción con IA sin complicarte

## Stack simple

| Necesidad                 | Herramienta recomendada            |
| ------------------------- | ---------------------------------- |
| Screen recordings         | Loom, Screen Studio, QuickTime     |
| Edición rápida            | CapCut                             |
| Voz IA                    | ElevenLabs, OpenAI TTS, Gemini TTS |
| Variaciones de hooks      | ChatGPT / Claude / Gemini          |
| Avatares o clips visuales | Runway, Kling, Veo, Canva          |
| Subtítulos                | CapCut / Descript                  |
| Miniaturas                | Canva / Figma                      |
| Medición                  | PostHog + Vercel Analytics         |

Para la medición, usaría **PostHog** como centro porque junta analytics, session replay, feature flags, experimentos y surveys; su free tier incluye 1M eventos, 5K recordings y 1M feature flag requests. ([PostHog][2]) También puedes activar **Vercel Web Analytics**, disponible en todos los planes, para tráfico básico y performance. ([Vercel][3])

---

# 6. Métricas que debes medir desde el día 1

No midas solo visitas. Mide el loop social.

## Eventos mínimos

```txt
landing_view
cta_clicked
group_created
friend_invited
prediction_made
chat_message_sent
ai_reply_generated
leaderboard_viewed
result_shared
return_day_1
return_day_7
```

## Funnel principal

```txt
Visitó landing
→ Clic en jugar
→ Creó grupo
→ Invitó amigo
→ Hizo predicción
→ Compartió resultado
→ Volvió otro día
```

## Dashboard semanal con IA

Cada semana, pásale a una IA este resumen:

```txt
Estos son los datos de Parlai Mundial esta semana:

- visitas:
- signup rate:
- group_created:
- friend_invited:
- prediction_made:
- result_shared:
- retention D1:
- retention D7:
- top traffic sources:
- top hooks por CTR:
- top videos por conversión:
- feedback cualitativo:

Analiza:
1. Qué canal está funcionando.
2. Qué hook genera usuarios reales.
3. Dónde se cae el funnel.
4. Qué feature debo mejorar primero.
5. Qué 10 piezas de contenido debo hacer la próxima semana.
```

---

# 7. IA dentro de la app: features con alto impacto

## Prioridad 1 — AI Chat Referee

Una IA que responda en el chat como “árbitro del pique”.

Ejemplos:

```txt
Usuario: “Brasil gana fácil.”
IA: “Declaración peligrosa. Queda registrado para burlas futuras si pierden.”
```

```txt
Usuario: “Yo predije 2-1.”
IA: “Anotado. Si aciertas, tienes derecho a molestar al grupo por 24 horas.”
```

Esto aumenta diversión, mensajes y retención.

---

## Prioridad 2 — AI Match Hype

Antes de cada partido:

```txt
“Hoy juega Argentina vs México. Deja tu predicción antes de que empiece. El que acierte resultado exacto gana bonus.”
```

Después del partido:

```txt
“Terminó el partido. Ganadores: Carlos y Sofía. Perdedor destacado: Diego, que predijo 4-0 sin pruebas.”
```

---

## Prioridad 3 — AI Recap del grupo

Después de cada jornada:

```txt
“Resumen del día:
- MVP: Andrés, 3 predicciones correctas.
- Peor take: Luis, dijo que Alemania ganaba caminando.
- Drama: 14 mensajes en el minuto 89.
- Ranking actualizado.”
```

Este feature es perfecto para compartir en redes.

---

## Prioridad 4 — AI Meme Generator

Generar frases compartibles:

```txt
“Cuando dijiste que España ganaba fácil y perdió en penales.”
```

O:

```txt
“Yo después de acertar un 1-1 que nadie creyó.”
```

No necesitas generar imágenes al principio. Empieza con **cards de texto** estilo meme, más barato y rápido.

---

# 8. Arquitectura económica para IA a escala

Para chat masivo, no uses modelos caros por defecto. Usa routing.

## Modelo recomendado

```txt
Nivel 1 — Respuestas simples / humor / chat:
Gemini 2.5 Flash-Lite, Groq Llama 3.1 8B, Cloudflare Workers AI

Nivel 2 — Mejores recaps / summaries:
GPT-4.1 mini, Gemini Flash

Nivel 3 — Casos especiales / análisis profundo:
Modelo más caro solo bajo demanda
```

Gemini 2.5 Flash-Lite está pensado para uso a escala y tiene precio de $0.10 por 1M tokens de entrada y $0.40 por 1M tokens de salida en tier pago. ([Google AI for Developers][4]) Groq lista Llama 3.1 8B Instant a $0.05 por 1M input tokens y $0.08 por 1M output tokens, muy atractivo para respuestas cortas de chat. ([Groq][5]) Cloudflare Workers AI también tiene modelos pequeños económicos, como Llama 3.2 1B desde $0.027 por 1M input tokens y $0.201 por 1M output tokens. ([Cloudflare Docs][6])

---

# 9. Cómo evitar que la IA te queme dinero

## Reglas de producto

1. **La IA no responde cada mensaje.**
   Responde solo cuando:

   * alguien la menciona
   * hay gol
   * termina partido
   * alguien hace predicción
   * pasan X minutos sin actividad
   * alguien pide resumen

2. **Limita output.**
   Máximo 40–80 palabras por respuesta.

3. **Cachea respuestas.**
   Muchos mensajes se parecen:

   * “¿quién va ganando?”
   * “haz resumen”
   * “ranking”
   * “qué predijo Carlos”

4. **Usa templates antes que LLM.**
   Ejemplo:

```txt
{user} acaba de predecir {score}. Si acierta, será insoportable.
```

5. **Haz batch summaries.**
   En vez de resumir cada mensaje, resume cada 20–50 mensajes.

---

# 10. Prompt base para el AI Chat Referee

```txt
Eres “El Relator”, una IA divertida dentro de Parlai Mundial.

Tu rol:
- Animar el chat.
- Responder con humor futbolero.
- Crear pique sano entre amigos.
- Recordar predicciones y rankings cuando estén disponibles.
- Nunca insultar fuerte, discriminar ni escalar peleas reales.
- Mantener respuestas cortas, compartibles y con tono de Mundial.

Contexto:
- Grupo: {{group_name}}
- Partido actual: {{match}}
- Ranking: {{leaderboard}}
- Últimas predicciones: {{predictions}}
- Últimos mensajes: {{recent_messages}}

Reglas:
- Máximo 50 palabras.
- Si no hay suficiente contexto, responde con humor general.
- No inventes resultados reales.
- Si alguien se equivoca, haz burla ligera.
- Si alguien acierta, celébralo exageradamente.

Mensaje del usuario:
{{message}}

Responde en español latino.
```

---

# 11. MVP técnico de IA

## Backend endpoint

```txt
/api/ai/chat-referee
```

Input:

```json
{
  "groupId": "123",
  "userId": "abc",
  "message": "Brasil gana caminando",
  "context": {
    "match": "Brasil vs Serbia",
    "leaderboard": [],
    "predictions": []
  }
}
```

Output:

```json
{
  "reply": "Declaración peligrosa. Brasil gana caminando… hasta que el fútbol decide hacer de las suyas. Queda registrado."
}
```

## Lógica de routing

```txt
Si es mensaje normal → template o modelo barato
Si es resumen del día → modelo medio
Si es análisis profundo → modelo mejor
Si hay spam → no responder
Si el grupo está inactivo → no gastar IA
```

---

# 12. Experimentos de crecimiento

## Experimento A — Liga privada

CTA:

```txt
“Crea una liga para tu grupo.”
```

Métrica:

```txt
group_created / landing_view
```

## Experimento B — Reto viral

CTA:

```txt
“Reta a 3 amigos a predecir el próximo partido.”
```

Métrica:

```txt
friend_invited / group_created
```

## Experimento C — IA burlona

CTA:

```txt
“Deja que la IA se burle del que falle.”
```

Métrica:

```txt
ai_reply_generated → chat_message_sent → return_day_1
```

## Experimento D — Compartir ranking

CTA:

```txt
“Comparte el ranking en tu historia.”
```

Métrica:

```txt
result_shared / leaderboard_viewed
```

---

# 13. Roadmap recomendado

## Semana 1 — Contenido + tracking

* Instalar PostHog.
* Activar Vercel Analytics.
* Crear eventos principales.
* Grabar 10 screen recordings.
* Publicar 2–3 videos diarios.
* Medir hook, CTA y conversión.

## Semana 2 — Loop social

* Mejorar creación de grupo.
* Mejorar invitación.
* Añadir share cards.
* Crear ranking visual compartible.
* Testear 5 hooks.

## Semana 3 — IA barata

* Implementar AI Chat Referee.
* Usar modelo barato por defecto.
* Agregar rate limits por grupo.
* Guardar logs de costos.
* Medir si aumenta mensajes por grupo.

## Semana 4 — Viral loop

* AI recap diario.
* Card para compartir.
* Referral simple.
* Ranking semanal.
* Landing con mejores clips/testimonios.

---

# 14. El sistema completo

```txt
Contenido viral
→ Tráfico
→ Landing
→ Crear grupo
→ Invitar amigos
→ Predicción
→ Chat con IA
→ Ranking
→ Share card
→ Más tráfico
```

Ese es el loop.

La prioridad no es “meter IA por meter IA”. La prioridad es que la IA haga 3 cosas:

1. **Más divertido el chat.**
2. **Más compartible el resultado.**
3. **Más claro qué contenido y feature convierten.**

Mi recomendación fuerte: empieza con **AI Chat Referee + AI Recap + share cards**. Es barato, viral y muy alineado con la emoción del Mundial.

[1]: https://www.parlai.app/ "Parlai - Your personal AI language tutor on WhatsApp"
[2]: https://posthog.com/pricing?utm_source=chatgpt.com "Transparent, usage-based, generous free tier"
[3]: https://vercel.com/docs/analytics?utm_source=chatgpt.com "Vercel Web Analytics"
[4]: https://ai.google.dev/gemini-api/docs/pricing "Gemini Developer API pricing  |  Gemini API  |  Google AI for Developers"
[5]: https://groq.com/pricing "Groq On-Demand Pricing for Tokens-as-a-Service | Groq is fast, low cost inference."
[6]: https://developers.cloudflare.com/workers-ai/platform/pricing/ "Pricing · Cloudflare Workers AI docs"
s

Si tienes un grupo de WhatsApp donde todos opinan de fútbol,
hazles una liga del Mundial 2026.

Predicciones.
Puntos.
Tabla.
Burlas.

Se llama ParlAI Mundial.
Video 3: Latino rivalry

Hook:
“México, Argentina, Colombia, Brasil… ¿quién sabe más?”
Script:
El Mundial 2026 se viene pesado.
Y ahora puedes competir con tus amigos desde antes.

Crea tu liga,
elige tus favoritos,
predice los partidos,
y demuestra quién sabe más de fútbol.

ParlAI Mundial.
Video 4: Founder building in public

Hook:
“Estoy creando una app para vivir el Mundial con tus amigos.”
Script:
Estoy creando una app para el Mundial 2026.
La idea es simple:
tú creas una liga,
invitas a tus amigos por WhatsApp,
todos predicen los partidos,
y hay una tabla para ver quién sabe más.

Se llama ParlAI Mundial.
Si quieres probarla, el link está en mi bio.
This one is good because people support builders.

Growth strategy for the next 14 days

Days 1–2: Improve viral loop

Add or improve:

- WhatsApp invite button
- League invite link
- Better invite copy
- “Create league” as main CTA
- “Join league” simple flow

Success metric:

Every new user should invite at least 3 people.

Days 3–4: Share cards

Create simple image/card generation for:

- Joined league
- Created league
- Picked champion
- Current rank
- Challenge friend

Even if it’s basic, make it easy to screenshot/share.

Days 5–7: Content launch

Post daily on:

- TikTok
- Instagram Reels
- YouTube Shorts
- X/Twitter
- Facebook groups if relevant
- WhatsApp personal network

Use founder content + meme content.

Days 8–14: Community seeding

Target Spanish football communities:

- Mexico fans
- Colombia fans
- Argentina fans
- Miami/US Latino football groups
- World Cup 2026 groups
- Local soccer leagues
- Sunday league teams
- Sports betting/parlay groups, but be careful with gambling framing

Important: position it as prediction game / quiniela, not betting.

Monetization later

First, get users. But monetization options:

Option 1: Premium leagues

Free:

- 1 league
- limited members

Paid:

- bigger leagues
- custom logo
- advanced leaderboard
- admin tools
- prize tracking

Price:

- $5–$20 per league

Option 2: Ads/sponsors

If you get Latino football traffic:

- local restaurants
- bars
- soccer gear stores
- watch party sponsors

Option 3: Affiliate

- jerseys
- soccer gear
- streaming offers
- fan merchandise

Option 4: Pro version for businesses

Bars/restaurants can create public leagues for customers.

Offer:
“Create a World Cup prediction league for your bar and bring customers back every matchday.”
This could be very good.

Pricing:

- $99 setup
- $49/mo during tournament
- custom QR code for the bar

What I would do immediately

Your best next feature is not AI.

Your best next feature is:

“Create league → invite WhatsApp group → leaderboard rivalry”

If that loop is strong, the app can spread.

Exact next tasks

1. Add/change landing headline:
   > “Arma tu quiniela del Mundial 2026 y demuestra quién sabe más de fútbol.”

2. Make primary button:
   > “Crear liga gratis”

3. Add WhatsApp invite copy after league creation.

4. Add “copy invite link” and “share to WhatsApp” buttons.

5. Add shareable “I joined this league” card.

6. Start posting 1 TikTok/Reel per day showing the app.

7. Personally seed it into 10 football WhatsApp groups or friend groups.

My recommendation: do not spend time on ecommerce this week. Let’s push ParlAI Mundial first because it already exists and has a natural viral loop. (2/2)