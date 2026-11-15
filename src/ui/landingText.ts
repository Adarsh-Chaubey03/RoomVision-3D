export type Lang = 'en' | 'hi';

export interface LandingText {
  nav: { about: string; features: string; howItWorks: string; open: string };
  hero: {
    titleLine1: string;
    titleLine2: string;
    titleAccent: string;
    lead: string;
    start: string;
    explore: string;
    noGl: string;
  };
  features: {
    title: string;
    items: { icon: string; title: string; text: string }[];
  };
  howItWorks: {
    title: string;
    steps: { title: string; text: string }[];
    cta: string;
  };
  footer: { copy: string; linkedin: string; github: string };
}

export const TEXT: Record<Lang, LandingText> = {
  en: {
    nav: { about: 'About', features: 'Features', howItWorks: 'How It Works', open: 'Open Editor' },
    hero: {
      titleLine1: 'Design Your Room.',
      titleLine2: 'See It in ',
      titleAccent: '3D.',
      lead: 'A web-based floor-plan editor to design rooms in 2D, place furniture, and instantly see a realistic 3D view of your space.',
      start: 'Start Designing →',
      explore: 'Explore Features',
      noGl: '3D preview requires WebGL. The 2D editor works without it.',
    },
    features: {
      title: 'Features',
      items: [
        { icon: 'grid',      title: 'Interactive 2D Floor Planner',   text: 'Draw walls, create rooms, add doors and windows with precise control.' },
        { icon: 'cube',      title: 'Real-Time 3D Visualization',     text: 'See your design in a detailed 3D view instantly with realistic lighting.' },
        { icon: 'sofa',      title: 'Furniture Placement',            text: 'Choose from a furniture catalog and place items easily in your room.' },
        { icon: 'move',      title: 'Smart Object Transformations',   text: 'Move, rotate and resize objects with intuitive controls.' },
        { icon: 'undo',      title: 'Undo and Redo',                  text: 'Try changes freely and go back or forward anytime.' },
        { icon: 'save',      title: 'Save and Load Designs',          text: 'Keep your work in the browser and load it again later to continue editing.' },
      ],
    },
    howItWorks: {
      title: 'How It Works',
      steps: [
        { title: 'Create Your Room',   text: 'Draw walls and define room dimensions using the 2D editor.' },
        { title: 'Furnish Your Space', text: 'Place, move, rotate and customize furniture.' },
        { title: 'Visualize in 3D',   text: 'Explore your completed room using the interactive 3D viewer.' },
      ],
      cta: 'Open Editor',
    },
    footer: { copy: '© 2026 Adarsh Chaubey. All rights reserved.', linkedin: 'LinkedIn', github: 'GitHub' },
  },
  hi: {
    nav: { about: 'परिचय', features: 'विशेषताएँ', howItWorks: 'कैसे काम करता है', open: 'एडिटर खोलें' },
    hero: {
      titleLine1: 'कमरा डिज़ाइन करें।',
      titleLine2: '3D में ',
      titleAccent: 'देखें।',
      lead: 'एक वेब-आधारित फ्लोर-प्लान एडिटर — 2D में कमरे बनाएँ, फर्नीचर रखें और तुरंत 3D में देखें।',
      start: 'डिज़ाइन शुरू करें →',
      explore: 'विशेषताएँ देखें',
      noGl: '3D प्रीव्यू के लिए WebGL चाहिए। 2D एडिटर बिना भी काम करता है।',
    },
    features: {
      title: 'विशेषताएँ',
      items: [
        { icon: 'grid', title: '2D फ्लोर प्लानर',        text: 'दीवारें बनाएँ, कमरे और दरवाज़े जोड़ें।' },
        { icon: 'cube', title: 'रीयल-टाइम 3D',           text: 'तुरंत 3D में देखें।' },
        { icon: 'sofa', title: 'फर्नीचर प्लेसमेंट',       text: 'कैटलॉग से चुनें और रखें।' },
        { icon: 'move', title: 'ऑब्जेक्ट ट्रांसफ़ॉर्म',    text: 'मूव, रोटेट, रीसाइज़ करें।' },
        { icon: 'undo', title: 'अनडू और रिडू',             text: 'कभी भी वापस जाएँ।' },
        { icon: 'save', title: 'सेव और लोड',              text: 'ब्राउज़र में सेव करें।' },
      ],
    },
    howItWorks: {
      title: 'कैसे काम करता है',
      steps: [
        { title: 'कमरा बनाएँ',      text: '2D एडिटर से दीवारें और आयाम तय करें।' },
        { title: 'फर्नीचर लगाएँ',    text: 'फर्नीचर रखें, घुमाएँ और कस्टमाइज़ करें।' },
        { title: '3D में देखें',     text: 'इंटरैक्टिव 3D व्यूअर में पूरा कमरा देखें।' },
      ],
      cta: 'एडिटर खोलें',
    },
    footer: { copy: '© 2026 Adarsh Chaubey. सर्वाधिकार सुरक्षित।', linkedin: 'LinkedIn', github: 'GitHub' },
  },
};
