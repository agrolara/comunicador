import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  HeartHandshake,
  Lightbulb,
  MessageCircle,
  Clock,
  Volume2,
  ShieldAlert,
  Puzzle,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { tts } from '../services/tts';

export default function ModelingGuideView() {
  const [copied, setCopied] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const tips = [
    {
      id: 1,
      category: 'fundamentos',
      title: '1. Modela sin examinar ("Cero exámenes")',
      desc: 'Evita decir preguntas de examen como "¿Dónde está el agua? Tócala para ver si te acuerdas". En lugar de eso, úsalo tú mismo en situaciones reales cotidianas.',
      example: 'Ejemplo: "Tengo sed, voy a tomar AGUA" (mientras tocas el pictograma de AGUA y tomas tu vaso). Tu hijo aprende observando cómo te comunicas.',
      badge: 'Regla de Oro'
    },
    {
      id: 2,
      category: 'fundamentos',
      title: '2. La Regla del "+1" (Zona de Desarrollo)',
      desc: 'Modela un nivel justo por encima de lo que tu hijo expresa actualmente. Si aún no combina, tú modelas oraciones de dos palabras.',
      example: 'Ejemplo: Si tu hijo toca "GALLETA", tú modelas "QUIERO GALLETA" o "MÁS GALLETA". Si ya dice dos palabras, modela tres: "YO QUIERO GALLETA".',
      badge: 'Expansión de Lenguaje'
    },
    {
      id: 3,
      category: 'fundamentos',
      title: '3. El comunicador es su VOZ, nunca un premio o castigo',
      desc: 'Jamás le retires el comunicador como consecuencia de una rabieta ("te portaste mal, te quito la tablet"). Quitarle el comunicador equivale a taparle la boca a un niño.',
      example: 'Principio clínico: La comunicación es un derecho humano incondicional. En momentos de frustración es cuando más necesita su comunicador para pedir CALMA o PAUSA.',
      badge: 'Derecho Humano'
    },
    {
      id: 4,
      category: 'fundamentos',
      title: '4. Comunicación Multimodal (Todo suma)',
      desc: 'Señalar con el dedo, llevarte de la mano, gestos faciales, vocalizaciones y pictogramas son formas válidas de comunicarse. No obligues a repetir en la tablet si ya te indicó lo que quiere.',
      example: 'Estrategia: Acepta su gesto con cariño y añade valor modelando en la tablet: "¡Ah, me señalas la pelota! PELOTA, vamos a jugar". La CAA acelera la aparición del habla oral.',
      badge: 'Evidencia Científica'
    },
    {
      id: 5,
      category: 'estrategias',
      title: '5. La Regla de los 10 a 15 Segundos (Pausa Expectante)',
      desc: 'Los niños no verbales o neurodivergentes necesitan más tiempo para procesar auditivamente, planificar el movimiento motor de su mano y tocar la pantalla.',
      example: 'Técnica: Pregunta o haz una pausa, inclínate hacia adelante con mirada cálida y cuenta mentalmente despacio hasta 15 antes de repetir o intervenir.',
      badge: 'Procesamiento Motor'
    },
    {
      id: 6,
      category: 'estrategias',
      title: '6. Ingeniería Ambiental (Crear la Oportunidad)',
      desc: 'Si todo está al alcance del niño, no tendrá necesidad de comunicarse. Organiza el entorno para generar motivos naturales de interacción.',
      example: 'Ejemplo: Guarda sus juguetes favoritos o snacks en frascos transparentes que él pueda ver pero no abrir solo. Así tendrá una razón genuina para pedir "ABRIR" o "AYUDA".',
      badge: 'Motivación Natural'
    },
    {
      id: 7,
      category: 'estrategias',
      title: '7. Sabotaje Amistoso y Lúdico',
      desc: 'Crea pequeñas situaciones inesperadas y divertidas que rompan la rutina para provocar la comunicación espontánea.',
      example: 'Ejemplo: Sírvele cereal sin cuchara, jugo en un vaso vacío, o dale una zapatilla de adulto. Esto le provoca reaccionar con pictogramas como "FALTA", "AYUDA", "NO" o "MIRA".',
      badge: 'Juego Comunicativo'
    },
    {
      id: 8,
      category: 'estrategias',
      title: '8. Atribución Positiva de Significado',
      desc: 'Si presiona un pictograma por aparente curiosidad o error motor (ej: presiona "TRISTE" mientras sonríe), no digas "te equivocaste". Dale siempre significado a su acción.',
      example: 'Respuesta recomendada: "¿TRISTE? ¿Te sientes triste o querías decirme otra cosa?". De esta forma aprende que cada símbolo produce una reacción en el mundo exterior.',
      badge: 'Causa y Efecto'
    },
    {
      id: 9,
      category: 'estructura',
      title: '9. Clave Fitzgerald Modificada (Colores Semánticos)',
      desc: 'Esta aplicación utiliza el estándar internacional de colores para ordenar el pensamiento: Amarillo = Sujeto/Personas, Verde = Verbos/Acciones, Naranja = Cosas/Comida, Azul = Emociones, Rosa = Social.',
      example: 'Beneficio: Ayuda al cerebro a ordenar gramaticalmente la frase de izquierda a derecha (¿Quién? + ¿Qué hace? + ¿Qué cosa?).',
      badge: 'Sintaxis Visual'
    },
    {
      id: 10,
      category: 'estructura',
      title: '10. Constancia en Todos los Entornos (La voz va contigo)',
      desc: 'Un comunicador guardado en la mochila no sirve. Debe estar encendido y disponible en la mesa del almuerzo, en el auto, en el colegio y en la plaza.',
      example: 'Si un niño con habla oral lleva su voz a todas partes, un niño usuario de CAA debe tener su tablet o teléfono siempre al alcance de sus manos.',
      badge: 'Generalización'
    }
  ];

  const filteredTips = selectedFilter === 'all' 
    ? tips 
    : tips.filter(t => t.category === selectedFilter);

  const handleReadTip = (tip) => {
    tts.playChime('pop');
    tts.speak(`${tip.title}. ${tip.desc} ${tip.example}`);
  };

  const handleCopyGuide = () => {
    const textToCopy = `GUÍA DE MODELADO CAA - ESTA ES MI VOZ SIN LÍMITES\n` +
      `Consejos para Padres y Terapeutas:\n\n` +
      tips.map(t => `${t.title}\n• ${t.desc}\n• ${t.example}\n`).join('\n');
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      tts.playChime('success');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white p-5 md:p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center shrink-0">
            <HelpCircle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">Guía Clínica de Modelado CAA</h2>
            <p className="text-xs md:text-sm text-rose-100 font-medium">
              Estrategias basadas en evidencia (Aided Language Stimulation) para el hogar y la escuela
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyGuide}
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-rose-900 rounded-2xl font-black text-xs cursor-pointer shadow-xs hover:bg-rose-50 active:scale-95 transition-all self-stretch sm:self-auto justify-center"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? '¡Guía Copiada!' : 'Copiar Resumen para Familia / PIE'}</span>
        </button>
      </div>

      {/* Intro Card */}
      <div className="bg-white border-2 border-rose-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-rose-700">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-black text-slate-800 text-base md:text-lg">
            ¿Qué es el Modelado o Estimulación del Lenguaje Asistido (ELA / ALS)?
          </h3>
        </div>
        <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
          Modelar significa que <strong>tú como padre, madre, fonoaudiólogo o educador usas el comunicador mientras hablas con tu hijo en voz alta</strong>. Un niño no verbal no puede aprender a comunicarse si solo le pedimos que "toque la pantalla"; necesita sumergirse en el lenguaje viendo a las personas que ama usar los pictogramas naturalmente todos los días.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer whitespace-nowrap transition-all ${selectedFilter === 'all' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          Todos los 10 Consejos
        </button>
        <button
          onClick={() => setSelectedFilter('fundamentos')}
          className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer whitespace-nowrap transition-all ${selectedFilter === 'fundamentos' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          1. Principios Fundamentales
        </button>
        <button
          onClick={() => setSelectedFilter('estrategias')}
          className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer whitespace-nowrap transition-all ${selectedFilter === 'estrategias' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          2. Estrategias en el Hogar
        </button>
        <button
          onClick={() => setSelectedFilter('estructura')}
          className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer whitespace-nowrap transition-all ${selectedFilter === 'estructura' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          3. Estructura y Generalización
        </button>
      </div>

      {/* 10 Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTips.map((tip) => (
          <div
            key={tip.id}
            onClick={() => handleReadTip(tip)}
            className="p-5 bg-white border-2 border-slate-200 hover:border-rose-300 rounded-3xl shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between space-y-3 select-none group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  {tip.badge}
                </span>
                <span className="text-slate-300 group-hover:text-rose-500 transition-colors">
                  <Volume2 className="w-4 h-4" />
                </span>
              </div>

              <h4 className="font-black text-slate-800 text-base leading-snug">
                {tip.title}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {tip.desc}
              </p>

              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/60 text-xs text-amber-900 font-medium">
                {tip.example}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-rose-600">
              <span>Toca esta tarjeta para escucharla en voz alta</span>
              <span>🔊</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
