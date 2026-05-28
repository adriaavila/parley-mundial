/**
 * Parleyia daily promotions content generator.
 * Run this script to generate social media posts and WhatsApp notifications.
 *
 * Usage:
 *   node scratch/generate_daily_promotions.cjs
 *   node scratch/generate_daily_promotions.cjs --date=2026-06-01
 */

const fs = require("fs");
const path = require("path");

// Target Date: 2026-06-11T20:00:00Z (Estadio Azteca Kickoff)
const KICKOFF_DATE = new Date("2026-06-11T20:00:00Z");
const APP_URL = "https://parlai-mundial.vercel.app/";

const PROMOS = {
  15: {
    teaser: "Inauguración en el Estadio Azteca: México vs Sudáfrica. ¿Se repite el golazo de Tshabalala del 2010 o México hace respetar la localía?",
    fact: "El Estadio Azteca se convertirá en el primer estadio en albergar tres partidos inaugurales de la Copa del Mundo (1970, 1986, 2026)."
  },
  14: {
    teaser: "USA vs Paraguay en el SoFi Stadium de Los Ángeles. El local se estrena frente a la garra guaraní. ¿Podrá Paraguay dar la sorpresa?",
    fact: "Estados Unidos y Paraguay no se enfrentan en un Mundial desde Uruguay 1930, donde los norteamericanos vencieron 3-0."
  },
  13: {
    teaser: "Brasil vs Marruecos en Nueva York/Nueva Jersey. Una de las semifinalistas revelación de 2022 contra el pentacampeón del mundo. ¡Partidazo total!",
    fact: "Marruecos hizo historia en 2022 al ser el primer equipo africano en llegar a una semifinal de Copa del Mundo."
  },
  12: {
    teaser: "Colombia debutará contra Uzbekistán en Ciudad de México. La fiebre amarilla regresa al Estadio Azteca. ¿Qué dice tu marcador exacto?",
    fact: "Uzbekistán debuta por primera vez en su historia en una fase final de la Copa del Mundo en este 2026."
  },
  11: {
    teaser: "Argentina vs Argelia en Kansas City. La albiceleste inicia la defensa del campeonato del mundo. ¿Cuántos goles meterá la Scaloneta en su debut?",
    fact: "Argentina llega como defensora del título tras coronarse campeona en Qatar 2022 en la mítica final contra Francia."
  },
  10: {
    teaser: "España vs Cabo Verde en Atlanta. La furia roja contra uno de los combinados africanos con más velocidad y sorpresas. ¿Goleada o empate?",
    fact: "Cabo Verde es una de las naciones más pequeñas en clasificar al Mundial de 48 equipos en Norteamérica."
  },
  9: {
    teaser: "Países Bajos vs Japón en Dallas. Duelo táctico europeo vs asiático. Los subcampeones neerlandeses vs los veloces samuráis azules. ¿A quién le vas?",
    fact: "Japón ha derrotado a potencias como Alemania y España en fases de grupos de mundiales recientes."
  },
  8: {
    teaser: "Alemania vs Curaçao en Houston. La tetracampeona del mundo inicia su camino frente a la gran sorpresa caribeña de CONCACAF. ¿Habrá milagro?",
    fact: "Curaçao logró una clasificación histórica superando tres rondas de eliminación en el Caribe."
  },
  7: {
    teaser: "Portugal vs Congo RD en Houston. ¿Será este el último gran baile de Cristiano Ronaldo en la cita mundialista?",
    fact: "Cristiano Ronaldo es el único jugador en la historia en haber anotado en 5 mundiales distintos."
  },
  6: {
    teaser: "Inglaterra vs Croacia en Dallas. Reedición de la semifinal de Rusia 2018. ¿El fútbol vuelve a casa o Modric y los suyos lo hacen de nuevo?",
    fact: "Croacia ha llegado al podio en 3 de los últimos 6 mundiales en los que ha participado."
  },
  5: {
    teaser: "Uruguay vs Arabia Saudita en Miami. Bielsa y la celeste buscando imponer su intensidad física desde el primer minuto en Florida.",
    fact: "Uruguay fue el primer campeón del mundo en 1930 y busca reverdecer laureles en suelo estadounidense."
  },
  4: {
    teaser: "Ecuador vs Costa de Marfil en Filadelfia. Duelo de potencia pura y despliegue físico entre Sudamérica y África. ¿Quién se lleva los 3 puntos?",
    fact: "Ecuador logró una de sus mejores clasificaciones en eliminatorias CONMEBOL con una gran generación joven."
  },
  3: {
    teaser: "Francia vs Senegal en Nueva York. ¡Partidazo con historia! ¿Se repetirá la legendaria hazaña de los Leones de la Teranga en el 2002?",
    fact: "Senegal derrotó a la campeona defensora Francia en el partido inaugural del Mundial de Corea-Japón 2002."
  },
  2: {
    teaser: "Canadá vs Bosnia en Toronto. El coanfitrión debuta ante su gente en un BMO Field que será una caldera. ¿Pesa la localía canadiense?",
    fact: "Canadá participará en su tercer mundial de la historia (tras 1986 y 2022) y el primero como país organizador."
  },
  1: {
    teaser: "¡MAÑANA COMIENZA EL MUNDIAL! Se acaba el tiempo. México vs Sudáfrica abre la fiesta en el Azteca. Las ligas se cierran al pitazo.",
    fact: "Esta será la Copa del Mundo más grande de la historia con 48 selecciones y 104 partidos en total."
  },
  0: {
    teaser: "¡HOY COMIENZA EL MUNDIAL! Últimas horas para unirte a ligas de amigos y pronosticar los partidos. El pitazo inicial está a minutos.",
    fact: "El balón rodará en el Estadio Azteca para iniciar el torneo de fútbol más espectacular del planeta."
  }
};

// Parse arguments
let targetDate = new Date();
const dateArg = process.argv.find(arg => arg.startsWith("--date="));
if (dateArg) {
  const dateStr = dateArg.split("=")[1];
  targetDate = new Date(dateStr + "T12:00:00");
}

// Calculate days remaining
const timeDiff = KICKOFF_DATE.getTime() - targetDate.getTime();
const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

console.log(`=========================================`);
console.log(`PARLEYIA - GENERADOR DE CONTENIDO DIARIO`);
console.log(`Fecha analizada: ${targetDate.toLocaleDateString("es-ES")}`);
console.log(`Días para el Mundial: ${daysRemaining}`);
console.log(`=========================================\n`);

let promo = PROMOS[daysRemaining];

if (!promo) {
  if (daysRemaining > 15) {
    console.log(`Aún faltan más de 15 días (${daysRemaining} días).`);
    console.log(`Usando la plantilla por defecto de cuenta regresiva lejana:\n`);
    promo = {
      teaser: `¡Cada vez falta menos para el Mundial 2026! Prepara tu grupo de amigos en ParlAI.`,
      fact: "Este mundial tendrá tres países anfitriones por primera vez en la historia: México, Estados Unidos y Canadá."
    };
  } else {
    console.log(`El mundial ya comenzó hace ${-daysRemaining} días.`);
    console.log(`Te sugerimos entrar a ver el ranking en vivo en ${APP_URL}`);
    process.exit(0);
  }
}

// 1. Twitter / X Copy (Max 280 chars)
const twitterHeader = daysRemaining > 1
  ? `🗓️ Faltan ${daysRemaining} días para el Mundial 2026.\n`
  : daysRemaining === 1
    ? `🚨 ¡SOLO FALTA 1 DÍA para el Mundial!\n`
    : `🔥 ¡HOY EMPIEZA EL MUNDIAL! ⚽\n`;

const twitterBody = `${promo.teaser}\n\n`;
const twitterFooter = `Crea tu liga gratis en segundos y compite: ${APP_URL} 🏆 #Mundial2026 #Quiniela`;

let twitterPost = `${twitterHeader}${twitterBody}${twitterFooter}`;
if (twitterPost.length > 280) {
  // Truncate/shorten to fit if necessary
  const shortBody = promo.teaser.slice(0, 120) + "...";
  twitterPost = `${twitterHeader}${shortBody}\n\nCrea tu liga gratis: ${APP_URL} 🏆 #Mundial2026`;
}

// 2. WhatsApp Copy (Allows formatting, bold/italics, and emojis)
const whatsappPost = `*🏆 PARLEYIA · LA JUGADA MUNDIALERA* ⚽

${daysRemaining > 1 ? `⏳ _¡Faltan solo *${daysRemaining} días* para el pitazo inicial!_` : daysRemaining === 1 ? `🚨 *_¡FALTA 1 DÍA!_*` : `🔥 *_¡HOY EMPIEZA EL MUNDIAL!_*`}

${promo.teaser}

💡 *¿Sabías qué?*
_${promo.fact}_

Arma tu quiniela de forma 100% gratuita con tus panas o compañeros de oficina. Se crea en 10 segundos y se comparte por WhatsApp con 1 toque.

👉 *Únete o crea tu liga aquí:* ${APP_URL}

#Mundial2026 #Parleyia #Futbol`;

// 3. Telegram Copy (Markdown-friendly)
const telegramPost = `*🏆 PARLEYIA · LA JUGADA MUNDIALERA* ⚽

${daysRemaining > 1 ? `⏳ _¡Faltan solo *${daysRemaining} días* para el pitazo inicial!_` : daysRemaining === 1 ? `🚨 *_¡FALTA 1 DÍA!_*` : `🔥 *_¡HOY EMPIEZA EL MUNDIAL!_*`}

${promo.teaser}

💡 *¿Sabías qué?*
_${promo.fact}_

Arma tu quiniela de forma 100% gratuita con tus panas o compañeros de oficina. Se crea en 10 segundos y se comparte por WhatsApp con 1 toque.

👉 *Únete o crea tu liga aquí:* ${APP_URL}`;

// Output the copy
console.log(`📱 [TWITTER / X COPY]`);
console.log(`-----------------------------------------`);
console.log(twitterPost);
console.log(`Character count: ${twitterPost.length}\n`);

console.log(`🟢 [WHATSAPP BROADCAST COPY]`);
console.log(`-----------------------------------------`);
console.log(whatsappPost);
console.log(`\n🔵 [TELEGRAM CHANNEL COPY]`);
console.log(`-----------------------------------------`);
console.log(telegramPost);

// Save generated content to scratch for reference
const outputPath = path.join(__dirname, "daily_promo_output.txt");
const outputText = `FECHA: ${targetDate.toLocaleDateString("es-ES")}\nDIAS RESTANTES: ${daysRemaining}\n\n[TWITTER]\n${twitterPost}\n\n[WHATSAPP]\n${whatsappPost}\n\n[TELEGRAM]\n${telegramPost}\n`;
fs.writeFileSync(outputPath, outputText, "utf8");
console.log(`\n💾 Contenido guardado en ${outputPath}`);
