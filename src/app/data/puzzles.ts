export interface PuzzleData {
  id: string;
  title: string;
  language: 'en' | 'pt';
  difficulty: 'easy' | 'medium' | 'hard';
  size: string;
  gridStr: string[];
  acrossClues: Record<number, string>;
  downClues: Record<number, string>;
}

export const PUZZLES_DB: PuzzleData[] = [
  // --- ENGLISH PUZZLES ---
  // EASY PUZZLES (7x7)
  {
    id: 'en-easy-1',
    title: 'The Staircase',
    language: 'en',
    difficulty: 'easy',
    size: '7x7',
    gridStr: [
      "CATS###",
      "HOUSE##",
      "ANTICS#",
      "TEA#RUN",
      "#SPRINT",
      "##EAGLE",
      "###STEP"
    ],
    acrossClues: {
      1: "Felines",
      5: "Where you live",
      6: "Playful tricks",
      7: "Hot drink",
      8: "Jog quickly",
      9: "Short race",
      11: "Majestic bird",
      12: "Stair part"
    },
    downClues: {
      1: "Talk",
      2: "One",
      3: "Tut",
      4: "Sea",
      5: "His",
      8: "Rest",
      9: "Sag",
      10: "Net"
    }
  },
  {
    id: 'en-easy-2',
    title: 'Morning Routine',
    language: 'en',
    difficulty: 'easy',
    size: '7x7',
    gridStr: [
      "BED####",
      "ALARM##",
      "TOAST##",
      "HATS#UP",
      "##COFFEE",
      "###DRESS",
      "####SUN#"
    ],
    acrossClues: {
      1: "Place to sleep",
      4: "Morning sound",
      6: "Breakfast bread",
      7: "Headwear",
      8: "Direction",
      9: "Morning brew",
      11: "Put on clothes",
      12: "Daytime star"
    },
    downClues: {
      1: "Bathe",
      2: "Eat",
      3: "Dot",
      4: "Ash",
      5: "Mop",
      8: "Use",
      9: "Car",
      10: "Fun"
    }
  },

  // MEDIUM PUZZLES (9x9)
  {
    id: 'en-medium-1',
    title: 'The Gridiron',
    language: 'en',
    difficulty: 'medium',
    size: '9x9',
    gridStr: [
      "BLACK####",
      "ROUTES###",
      "INVENTORS",
      "CK###RUIN",
      "KEYS#ANTS",
      "##PLANETS",
      "###OCEANS",
      "###RINGS#",
      "###TENT##"
    ],
    acrossClues: {
      1: "Dark color",
      6: "Paths to take",
      7: "Creators of new things",
      9: "Destroy",
      10: "Unlocks doors",
      11: "Picnic bugs",
      12: "Earth and Mars",
      13: "Large bodies of water",
      14: "Jewelry for fingers",
      15: "Camping shelter"
    },
    downClues: {
      1: "Building block",
      2: "Look",
      3: "Aunt",
      4: "Cue",
      5: "Ten",
      8: "Orange",
      10: "Keep",
      11: "Ant",
      12: "Port",
      13: "Oar"
    }
  },
  {
    id: 'en-medium-2',
    title: 'Space Exploration',
    language: 'en',
    difficulty: 'medium',
    size: '9x9',
    gridStr: [
      "MARS#####",
      "ORBIT####",
      "ROCKETS##",
      "STARS#SUN",
      "###MOON##",
      "###VENUS#",
      "####COMET",
      "#####STAR",
      "#####DUST"
    ],
    acrossClues: {
      1: "Red planet",
      4: "Path around a star",
      6: "Space vehicles",
      7: "Night sky lights",
      8: "Daytime star",
      9: "Earth's satellite",
      10: "Second planet",
      11: "Icy body",
      12: "Twinkle twinkle",
      13: "Space dirt"
    },
    downClues: {
      1: "More",
      2: "Art",
      3: "Rib",
      4: "Oar",
      5: "Ten",
      6: "Rot",
      9: "Mug",
      10: "Vet"
    }
  },

  // HARD PUZZLES (11x11)
  {
    id: 'en-hard-1',
    title: 'The Labyrinth',
    language: 'en',
    difficulty: 'hard',
    size: '11x11',
    gridStr: [
      "CHALLENGE##",
      "HURDLES####",
      "OBSTACLES##",
      "PUZZLE#MAZE",
      "###RIDDLES#",
      "###ENIGMA##",
      "####MYSTERY",
      "#####SECRET",
      "#####HIDDEN",
      "######CODE#",
      "######CLUE#"
    ],
    acrossClues: {
      1: "Difficult task",
      4: "Things to jump over",
      6: "Things in the way",
      7: "Brain teaser",
      8: "Labyrinth",
      9: "Tricky questions",
      10: "Puzzle",
      11: "Unknown thing",
      12: "Not known",
      13: "Concealed",
      14: "Cipher",
      15: "Hint"
    },
    downClues: {
      1: "Chop",
      2: "Hub",
      3: "Art",
      4: "Hut",
      5: "Use",
      6: "Oat",
      9: "Rye",
      10: "Emu"
    }
  },

  // --- PORTUGUESE PUZZLES ---
  // EASY PUZZLES (7x7)
  {
    id: 'pt-easy-1',
    title: 'Animais',
    language: 'pt',
    difficulty: 'easy',
    size: '7x7',
    gridStr: [
      "GATO###",
      "CASA###",
      "BOLO###",
      "PIA#SOL",
      "##LIVRO",
      "###MESA",
      "###BOLA"
    ],
    acrossClues: {
      1: "Felino doméstico",
      4: "Onde moramos",
      5: "Doce de aniversário",
      6: "Onde se lava a louça",
      7: "Estrela do dia",
      8: "Objeto de leitura",
      9: "Móvel com pernas",
      10: "Objeto redondo para jogar"
    },
    downClues: {
      1: "Vertical 1",
      2: "Vertical 2",
      3: "Vertical 3",
      4: "Vertical 4",
      8: "Vertical 5",
      9: "Vertical 6",
      10: "Vertical 7"
    }
  },
  {
    id: 'pt-easy-2',
    title: 'Cores',
    language: 'pt',
    difficulty: 'easy',
    size: '7x7',
    gridStr: [
      "AZUL###",
      "ROSA###",
      "VERDE##",
      "COR#PAO",
      "##PRETO",
      "###DOCE",
      "####CHA"
    ],
    acrossClues: {
      1: "Cor do céu",
      4: "Cor da flor",
      5: "Cor da grama",
      6: "Tonalidade",
      7: "Alimento de padaria",
      8: "Cor da noite",
      9: "Açucarado",
      10: "Bebida quente"
    },
    downClues: {
      1: "Vertical 1",
      2: "Vertical 2",
      3: "Vertical 3",
      4: "Vertical 4",
      8: "Vertical 5",
      9: "Vertical 6",
      10: "Vertical 7"
    }
  },

  // MEDIUM PUZZLES (9x9)
  {
    id: 'pt-medium-1',
    title: 'Natureza',
    language: 'pt',
    difficulty: 'medium',
    size: '9x9',
    gridStr: [
      "ARVORE###",
      "FLORES###",
      "PLANTA###",
      "SOL#LUA##",
      "###AGUA##",
      "###TERRA#",
      "####VENTO",
      "#####FOGO",
      "#####MAR#"
    ],
    acrossClues: {
      1: "Planta grande com tronco",
      4: "Parte colorida da planta",
      5: "Vegetal",
      6: "Astro rei",
      7: "Satélite natural",
      8: "Líquido essencial",
      9: "Solo, planeta",
      10: "Ar em movimento",
      11: "Chama, calor",
      12: "Oceano"
    },
    downClues: {
      1: "Vertical 1",
      2: "Vertical 2",
      3: "Vertical 3",
      4: "Vertical 4",
      5: "Vertical 5",
      8: "Vertical 6",
      9: "Vertical 7",
      10: "Vertical 8"
    }
  },

  // HARD PUZZLES (11x11)
  {
    id: 'pt-hard-1',
    title: 'Universo',
    language: 'pt',
    difficulty: 'hard',
    size: '11x11',
    gridStr: [
      "ASTRONOMIA#",
      "GALAXIAS###",
      "ESTRELAS###",
      "LUA#PLANETA",
      "###COMETAS#",
      "###METEORO#",
      "####SISTEMA",
      "#####ESPACO",
      "#####COSMOS",
      "######ORBIT",
      "######SOL##"
    ],
    acrossClues: {
      1: "Estudo dos astros",
      4: "Conjuntos de estrelas",
      6: "Pontos brilhantes no céu",
      7: "Satélite da Terra",
      8: "Corpo celeste que orbita estrela",
      9: "Corpos de gelo e poeira",
      10: "Estrela cadente",
      11: "Conjunto de elementos",
      12: "Vazio sideral",
      13: "O universo",
      14: "Trajetória",
      15: "Nossa estrela"
    },
    downClues: {
      1: "Vertical 1",
      2: "Vertical 2",
      3: "Vertical 3",
      4: "Vertical 4",
      5: "Vertical 5",
      9: "Vertical 6",
      10: "Vertical 7",
      11: "Vertical 8"
    }
  }
];
