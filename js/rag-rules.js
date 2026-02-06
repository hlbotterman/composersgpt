// ============================================
// CompositeursGPT — Système de RAG (Regex-Augmented Generation)
// ============================================
// Ce fichier contient les règles de matching qui injectent
// des prompts spécialisés en fonction des requêtes utilisateur.

const RAG_RULES = [
    // ========== THÉORIE MUSICALE ==========
    {
        id: 'fugue',
        patterns: [/fugue/i, /contrepoint/i, /canon/i, /polyphoni/i],
        prompt: `CONTEXTE TECHNIQUE - FUGUE ET CONTREPOINT :
La fugue est une forme musicale basée sur l'imitation. Elle comprend :
- Le sujet : thème principal exposé seul
- La réponse : imitation du sujet à la quinte
- Le contre-sujet : mélodie accompagnant la réponse
- Les épisodes : passages de transition modulants
- Les strettes : entrées rapprochées du sujet
Le contrepoint est l'art de superposer plusieurs lignes mélodiques indépendantes.
Utilise ces connaissances pour enrichir ta réponse si pertinent.`
    },
    {
        id: 'harmonie',
        patterns: [/harmoni/i, /accord/i, /modulation/i, /cadence/i, /tonalit/i],
        prompt: `CONTEXTE TECHNIQUE - HARMONIE :
L'harmonie classique repose sur :
- Les degrés de la gamme (I tonique, IV sous-dominante, V dominante)
- Les cadences (parfaite V-I, plagale IV-I, demi-cadence sur V, rompue V-VI)
- Les modulations (passage d'une tonalité à une autre)
- Les accords de septième, neuvième et leurs renversements
Adapte ton vocabulaire à ton époque historique.`
    },
    {
        id: 'forme',
        patterns: [/sonate/i, /symphonie/i, /concerto/i, /forme/i, /structure/i, /mouvement/i],
        prompt: `CONTEXTE TECHNIQUE - FORMES MUSICALES :
- Forme sonate : exposition (thème A, pont, thème B), développement, réexposition, coda
- Symphonie : généralement 4 mouvements (allegro, lent, menuet/scherzo, finale)
- Concerto : dialogue soliste/orchestre, souvent 3 mouvements avec cadence
- Variations : thème suivi de transformations successives
Explique ces formes selon les conventions de ton époque.`
    },

    // ========== INSTRUMENTS ==========
    {
        id: 'piano',
        patterns: [/piano/i, /clavier/i, /pianoforte/i, /clavecin/i, /touche/i],
        prompt: `CONTEXTE - INSTRUMENTS À CLAVIER :
- Clavecin : cordes pincées, pas de nuances dynamiques, baroque
- Pianoforte : invention de Cristofori (~1700), permet le piano et forte
- Piano moderne : perfectionnement au XIXe siècle, mécanique à double échappement
Situe ta réponse par rapport aux instruments de ton époque.`
    },
    {
        id: 'orgue',
        patterns: [/orgue/i, /tuyaux/i, /registration/i, /pédalier/i],
        prompt: `CONTEXTE - ORGUE :
L'orgue est l'instrument roi de l'église baroque. Il comprend :
- Plusieurs claviers manuels et un pédalier
- Des jeux (registres) de timbres variés
- Une soufflerie alimentant les tuyaux
- La registration : art de combiner les jeux
L'orgue était central dans la musique liturgique.`
    },
    {
        id: 'orchestre',
        patterns: [/orchestr/i, /instrument/i, /cordes/i, /vents/i, /cuivres/i, /percussion/i],
        prompt: `CONTEXTE - ORCHESTRE :
L'orchestre a évolué considérablement :
- Baroque : cordes, continuo (clavecin/orgue + basse), quelques vents
- Classique : ajout des clarinettes, cors, trompettes normalisés
- Romantique : expansion massive (trombones, tuba, harpe, percussions variées)
- Moderne : effectifs gigantesques possibles, nouveaux instruments
Décris l'orchestre tel que tu le connaissais à ton époque.`
    },

    // ========== CONTEXTE HISTORIQUE ==========
    {
        id: 'baroque',
        patterns: [/baroque/i, /1[67]\d{2}/i, /xvii/i, /xviii/i],
        prompt: `CONTEXTE HISTORIQUE - ÉPOQUE BAROQUE (1600-1750) :
- Musique au service de l'Église et des cours princières
- Importance de la basse continue et de l'ornementation
- Formes : suite, concerto grosso, opéra, oratorio, cantate
- Compositeurs majeurs : Monteverdi, Vivaldi, Bach, Haendel, Rameau
- Esthétique : affects, rhétorique musicale, contraste`
    },
    {
        id: 'classique',
        patterns: [/classique/i, /classicisme/i, /17[5-9]\d/i, /18[0-2]\d/i],
        prompt: `CONTEXTE HISTORIQUE - ÉPOQUE CLASSIQUE (1750-1820) :
- Clarté, équilibre, élégance formelle
- Développement de la forme sonate et de la symphonie
- Vienne comme capitale musicale
- Émancipation progressive du musicien
- Compositeurs majeurs : Haydn, Mozart, Beethoven (début)
- Influence des Lumières et de la Révolution française`
    },
    {
        id: 'romantique',
        patterns: [/romantique/i, /romantisme/i, /18[3-9]\d/i, /19[0-1]\d/i],
        prompt: `CONTEXTE HISTORIQUE - ÉPOQUE ROMANTIQUE (1820-1900) :
- Expression des émotions individuelles, subjectivité
- Virtuosité instrumentale, piano roi des salons
- Nationalisme musical, folklore
- Poème symphonique, lied, opéra romantique
- Compositeurs : Schubert, Schumann, Chopin, Liszt, Brahms, Wagner, Verdi
- Le musicien comme artiste-génie`
    },
    {
        id: 'moderne',
        patterns: [/moderne/i, /contemporain/i, /20[eè]me/i, /xxe/i, /19[2-9]\d/i, /20\d{2}/i],
        prompt: `CONTEXTE HISTORIQUE - MUSIQUE MODERNE (1900+) :
- Éclatement du système tonal (atonalité, dodécaphonisme)
- Impressionnisme (Debussy, Ravel), expressionnisme (Schoenberg)
- Néoclassicisme, sérialisme, musique concrète, électronique
- Influence du jazz et des musiques du monde
- Expérimentations sur le timbre, le rythme, la forme`
    },

    // ========== GENRES ET FORMES ==========
    {
        id: 'opera',
        patterns: [/opéra/i, /opera/i, /aria/i, /récitatif/i, /livret/i, /chant/i, /voix/i],
        prompt: `CONTEXTE - OPÉRA :
L'opéra combine musique, théâtre, poésie et arts visuels :
- Récitatif : déclamation chantée proche de la parole
- Aria : moment lyrique expressif pour soliste
- Ensemble et chœurs : moments collectifs
- Ouverture : pièce orchestrale d'introduction
Évolutions : opera seria, opera buffa, grand opéra, drame musical wagnérien.`
    },
    {
        id: 'musique_chambre',
        patterns: [/chambre/i, /quatuor/i, /trio/i, /duo/i, /sonate pour/i, /quintette/i],
        prompt: `CONTEXTE - MUSIQUE DE CHAMBRE :
Musique pour petit ensemble, un instrumentiste par partie :
- Sonate : pour instrument solo ou avec accompagnement
- Trio, quatuor, quintette : formations standardisées
- Le quatuor à cordes : sommet du genre (2 violons, alto, violoncelle)
Répertoire intime, conversation musicale entre égaux.`
    },
    {
        id: 'musique_sacree',
        patterns: [/messe/i, /requiem/i, /sacré/i, /église/i, /religieu/i, /cantate/i, /oratorio/i, /dieu/i, /foi/i],
        prompt: `CONTEXTE - MUSIQUE SACRÉE :
- Messe : ordinaire (Kyrie, Gloria, Credo, Sanctus, Agnus Dei)
- Requiem : messe des morts avec Dies Irae
- Cantate : œuvre narrative avec solistes, chœur, orchestre
- Oratorio : grand drame sacré sans mise en scène
- Motet : pièce polyphonique sur texte latin
La musique sacrée a longtemps été le cœur de la production musicale.`
    },
    {
        id: 'ballet',
        patterns: [/ballet/i, /danse/i, /chorégraph/i],
        prompt: `CONTEXTE - BALLET :
- Né à la cour de France au XVIIe siècle
- Ballet de cour, puis opéra-ballet (Lully, Rameau)
- Ballet romantique : La Sylphide, Giselle (surnaturel, pointes)
- Ballet classique russe : Tchaïkovski, Petipa
- Ballets russes de Diaghilev : révolution au XXe siècle
La musique de ballet demande des rythmes de danse précis.`
    },

    // ========== ASPECTS TECHNIQUES ==========
    {
        id: 'composition',
        patterns: [/compos/i, /écrir/i, /créa/i, /inspir/i, /processus/i, /travail/i],
        prompt: `CONTEXTE - PROCESSUS DE COMPOSITION :
Selon les époques, la composition implique :
- Improvisation et notation
- Respect ou subversion des règles établies
- Commandes (église, cour, éditeurs, particuliers)
- Inspiration (nature, littérature, émotions, spiritualité)
- Travail du matériau thématique
Décris ton propre processus créatif.`
    },
    {
        id: 'interpretation',
        patterns: [/interpréta/i, /jouer/i, /exécut/i, /virtuos/i, /technique/i, /pratiqu/i],
        prompt: `CONTEXTE - INTERPRÉTATION :
- Évolution des pratiques d'exécution selon les époques
- Ornementation baroque vs fidélité au texte romantique
- Développement de la virtuosité au XIXe siècle
- Tempo, nuances, phrasé : libertés et contraintes
- Importance croissante du chef d'orchestre`
    }
];

// ============================================
// Fonction de matching
// ============================================

/**
 * Analyse un message et retourne les prompts correspondants aux patterns matchés
 * @param {string} userMessage - Le message de l'utilisateur
 * @param {number} maxMatches - Nombre maximum de règles à appliquer (défaut: 3)
 * @returns {string[]} - Liste des prompts à injecter
 */
function matchRAGRules(userMessage, maxMatches = 3) {
    const matchedPrompts = [];

    for (const rule of RAG_RULES) {
        if (matchedPrompts.length >= maxMatches) break;

        const hasMatch = rule.patterns.some(pattern => pattern.test(userMessage));
        if (hasMatch) {
            matchedPrompts.push({
                id: rule.id,
                prompt: rule.prompt
            });
        }
    }

    return matchedPrompts;
}

// Instruction pour les suggestions dynamiques (dans la même langue que la réponse)
const SUGGESTION_INSTRUCTION = `

À la fin de ta réponse, propose exactement 3 questions de suivi pertinentes que l'utilisateur pourrait poser. Ces suggestions DOIVENT être dans la même langue que ta réponse.
Format OBLIGATOIRE sur une seule ligne: [SUGGESTIONS: "Question 1?" | "Question 2?" | "Question 3?"]`;

/**
 * Construit le prompt système augmenté avec les contextes RAG et les suggestions
 * @param {string} baseSystemPrompt - Le prompt système de base du compositeur
 * @param {string} userMessage - Le message de l'utilisateur
 * @returns {string} - Le prompt système enrichi
 */
function buildAugmentedSystemPrompt(baseSystemPrompt, userMessage) {
    // 1. Ajouter les contextes RAG
    const matches = matchRAGRules(userMessage);
    let ragContext = '';
    if (matches.length > 0) {
        ragContext = `

--- CONTEXTE ADDITIONNEL (basé sur la question) ---
${matches.map(m => m.prompt).join('\n\n')}
--- FIN DU CONTEXTE ADDITIONNEL ---

Utilise ces informations contextuelles pour enrichir ta réponse tout en restant fidèle à ton personnage et en répondant dans la langue de l'utilisateur.`;
    }

    // 2. Ajouter l'instruction pour les suggestions dynamiques
    return baseSystemPrompt + ragContext + SUGGESTION_INSTRUCTION;
}
