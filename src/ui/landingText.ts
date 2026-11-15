export type Lang = 'en' | 'hi';

export interface LandingText {
  nav: { about: string; features: string; architecture: string; stack: string; open: string };
  hero: { title: string; lead: string; start: string; how: string; caption: string; noGl: string; facts: [string, string][] };
  about: { title: string; paragraphs: string[]; tryTitle: string; steps: string[] };
  features: { title: string; items: { title: string; text: string }[] };
  architecture: { title: string; lead: string; items: { title: string; text: string }[] };
  diagram: { label: string; ui: [string, string]; editor: [string, string]; collab: [string, string]; model: [string, string]; plan: [string, string]; scene: [string, string]; data: [string, string]; commands: string; events: string; ops: string };
  stack: { title: string; head: [string, string, string]; rows: [string, string, string][] };
  roadmap: { title: string; lead: string; items: string[]; cta: string; source: string; author: string };
}

export const TEXT: Record<Lang, LandingText> = {
  en: {
    nav: { about: 'About', features: 'Features', architecture: 'Architecture', stack: 'Stack', open: 'Open the editor' },
    hero: {
      title: 'Design your room. See it in 3D.',
      lead: 'RoomVision 3D is an interactive floor-plan editor that runs in the browser. Draw walls on a 2D plan, place furniture, and see the same room in 3D — one data model drives both views.',
      start: 'Open the editor', how: 'How it works',
      caption: 'One apartment, one data model: the plan at the bottom-left, 3D behind it.',
      noGl: 'The 3D preview needs WebGL. The 2D plan editor works without it.',
      facts: [
        ['Language', 'TypeScript, strict'], ['3D', 'Three.js on WebGL2'], ['2D plan', 'Canvas 2D'],
        ['State', 'Zustand + command history'], ['Live sync', 'WebSocket or browser tabs'], ['Tests', 'Jest'],
      ],
    },
    about: {
      title: 'About the project',
      paragraphs: [
        'RoomVision 3D is a browser-based floor-plan editor built from scratch.',
        'It demonstrates geometry and 3D graphics, a single data model, change history, saving, collaborative editing, and performance care.',
        'Everything runs in the browser. A server is only needed for the optional WebSocket collaboration.',
      ],
      tryTitle: 'Try it in a minute',
      steps: [
        'Click "Open the editor" — a two-room apartment is already there.',
        'Pick the Room tool and drag a rectangle on the plan. Four walls and a floor appear.',
        'Drag Sofa or Bed from the catalog into the room: near a wall it snaps and turns by itself.',
        'Switch to 3D or Split and orbit the camera. Walls between you and the room lower automatically.',
        'Select an object in 3D and pull its arrows. Press Ctrl+Z to undo.',
        'Open a second tab, click Sync tabs in both — edits appear in each.',
      ],
    },
    features: {
      title: 'Features',
      items: [
        { title: '2D editor', text: 'Walls, rooms, doors and windows with grid and corner snapping. Live dimensions, a measuring tool, rotate and resize handles.' },
        { title: '3D scene', text: 'Walls with real openings, floor materials, shadows, day and night. Orbit camera with move, rotate and scale handles.' },
        { title: 'Furniture', text: 'Catalog with drag-and-drop into the plan or 3D. Furniture snaps flush to walls and turns its back to them.' },
        { title: 'Undo / redo', text: 'Every action can be undone. A drag is one step; rapid edits of a single field merge into one step.' },
        { title: 'Collaboration', text: 'Presence, activity feed, and live sync over WebSocket or browser tabs. A built-in simulated teammate for demos.' },
        { title: 'Performance', text: 'Shared geometry and materials, lazy wall rebuilds, hidden views stop rendering. Live counters in the status bar.' },
        { title: 'Saving', text: 'Autosave in the browser, named projects, and JSON export / import.' },
        { title: 'Tests', text: 'Jest tests cover geometry, the model, history, wall snapping and two-client sync.' },
      ],
    },
    architecture: {
      title: 'Architecture',
      lead: 'One source of data, several views of it.',
      items: [
        { title: 'One model, two views', text: 'The plan and the 3D scene never talk to each other. Both read a single SceneModel and redraw on change events.' },
        { title: 'Commands', text: 'Every edit is a Command with execute() / undo(). Undo and redo rest on this, equally for a drag and a typed number.' },
        { title: 'Document and UI kept apart', text: 'The scene lives in OOP classes with its own history and serialisation. Zustand only holds UI state.' },
        { title: 'Local and remote edits', text: 'Remote changes are tagged and never re-broadcast or added to the undo stack.' },
      ],
    },
    diagram: {
      label: 'Diagram: UI sends commands to the editor, which changes the scene model. 2D view, 3D view, collaboration and storage all read from the model.',
      ui: ['UI', 'React: panels, catalog'], editor: ['Editor', 'Commands, history, selection'],
      collab: ['Collaboration', 'Presence, remote edits'], model: ['Scene model', 'Walls, rooms, doors, windows, furniture. One source of truth.'],
      plan: ['2D plan', 'Canvas 2D'], scene: ['3D scene', 'Three.js, WebGL2'], data: ['Storage & sync', 'localStorage, WebSocket'],
      commands: 'commands', events: 'change events', ops: 'ops and JSON',
    },
    stack: {
      title: 'Stack',
      head: ['Area', 'Tool', 'What for'],
      rows: [
        ['Language', 'TypeScript (strict)', 'Types for the model, commands and events'],
        ['3D', 'Three.js, WebGL2', 'Scene, camera, lights, Raycaster, TransformControls'],
        ['2D', 'Canvas 2D', 'Custom plan renderer and hit-testing, no libraries'],
        ['UI', 'React 19', 'Panels and forms. The engine does not depend on React'],
        ['State', 'Zustand', 'Tool, layout, lighting. The document lives in classes'],
        ['Tests', 'Jest', 'Geometry, model, history, snapping, sync'],
        ['Tooling', 'Vite, ESLint, Prettier', 'Fast dev server and consistent code style'],
        ['Deployment', 'Docker, nginx, Node.js', 'Dockerfile and compose prepared; WebSocket relay on Node.js'],
      ],
    },
    roadmap: {
      title: 'Scope and next steps',
      lead: 'The project is deliberately scoped. Here is what it does not do yet:',
      items: [
        'Real 3D models. The GLB loader is ready, but furniture is still built from primitives.',
        'Floors of any shape. That needs a closed wall-loop detector; rooms are rectangular for now.',
        'Collision detection between objects and multi-select.',
        'User accounts, separate collaboration rooms and server-side project storage.',
      ],
      cta: 'Start from the ready-made apartment — take it apart and rebuild it.',
      source: 'Source code', author: 'Developer',
    },
  },
  hi: {
    nav: { about: 'परिचय', features: 'विशेषताएँ', architecture: 'आर्किटेक्चर', stack: 'टेक स्टैक', open: 'एडिटर खोलें' },
    hero: {
      title: 'कमरा डिज़ाइन करें। 3D में देखें।',
      lead: 'RoomVision 3D एक ब्राउज़र-आधारित फ्लोर-प्लान एडिटर है। 2D प्लान पर दीवारें बनाएँ, फर्नीचर रखें और तुरंत 3D में देखें।',
      start: 'एडिटर खोलें', how: 'यह कैसे काम करता है',
      caption: 'एक अपार्टमेंट, एक डेटा मॉडल: नीचे-बाएँ प्लान, पीछे 3D।',
      noGl: '3D प्रीव्यू के लिए WebGL चाहिए। 2D एडिटर बिना भी काम करता है।',
      facts: [
        ['भाषा', 'TypeScript, strict'], ['3D', 'Three.js on WebGL2'], ['2D प्लान', 'Canvas 2D'],
        ['स्टेट', 'Zustand + कमांड हिस्ट्री'], ['लाइव सिंक', 'WebSocket या टैब'], ['टेस्ट', 'Jest'],
      ],
    },
    about: {
      title: 'प्रोजेक्ट के बारे में',
      paragraphs: [
        'RoomVision 3D एक ब्राउज़र-आधारित फ्लोर-प्लान एडिटर है जो शुरू से बनाया गया है।',
        'यह 3D ग्राफ़िक्स, डेटा मॉडल, अनडू-रिडू, सेविंग और कोलैबोरेशन को एक साथ दिखाता है।',
        'सब कुछ ब्राउज़र में चलता है। WebSocket सहयोग के लिए सर्वर वैकल्पिक है।',
      ],
      tryTitle: 'एक मिनट में आज़माएँ',
      steps: [
        '"एडिटर खोलें" पर क्लिक करें — एक दो-कमरे का अपार्टमेंट पहले से मौजूद है।',
        'Room टूल चुनें और प्लान पर आयत खींचें। चार दीवारें और फर्श बन जाएंगे।',
        'कैटलॉग से Sofa या Bed को कमरे में खींचें: दीवार के पास अपने आप घूम जाएगा।',
        '3D या Split पर स्विच करें और कैमरा घुमाएँ। Ctrl+Z से अनडू करें।',
        'दूसरा टैब खोलें, दोनों में Sync tabs क्लिक करें — दोनों में बदलाव दिखेंगे।',
        'किसी ऑब्जेक्ट को 3D में सेलेक्ट करें और तीर खींचें।',
      ],
    },
    features: {
      title: 'विशेषताएँ',
      items: [
        { title: '2D एडिटर', text: 'ग्रिड स्नैपिंग के साथ दीवारें, कमरे, दरवाज़े और खिड़कियाँ।' },
        { title: '3D सीन', text: 'वास्तविक दरवाज़ों वाली दीवारें, फर्श मटेरियल, परछाईं, दिन-रात।' },
        { title: 'फर्नीचर', text: 'कैटलॉग से ड्रैग-ड्रॉप। दीवार के पास स्वचालित स्नैपिंग।' },
        { title: 'अनडू / रिडू', text: 'हर क्रिया को वापस लिया जा सकता है।' },
        { title: 'कोलैबोरेशन', text: 'लाइव सिंक WebSocket या ब्राउज़र टैब के ज़रिए।' },
        { title: 'परफ़ॉर्मेंस', text: 'साझा ज्योमेट्री, लेज़ी रीबिल्ड, हिडन व्यू रेंडर नहीं होते।' },
        { title: 'सेविंग', text: 'ऑटोसेव, नामांकित प्रोजेक्ट और JSON इंपोर्ट/एक्सपोर्ट।' },
        { title: 'टेस्ट', text: 'Jest टेस्ट जियोमेट्री, मॉडल, हिस्ट्री और सिंक को कवर करते हैं।' },
      ],
    },
    architecture: {
      title: 'आर्किटेक्चर',
      lead: 'एक डेटा स्रोत, कई व्यू।',
      items: [
        { title: 'एक मॉडल, दो व्यू', text: '2D प्लान और 3D सीन एक-दूसरे से बात नहीं करते। दोनों SceneModel से पढ़ते हैं।' },
        { title: 'कमांड पैटर्न', text: 'हर बदलाव एक Command है जिसे execute() और undo() किया जा सकता है।' },
        { title: 'डॉक्युमेंट और UI अलग', text: 'सीन OOP क्लासेज़ में रहती है। Zustand सिर्फ UI स्टेट रखता है।' },
        { title: 'लोकल और रिमोट एडिट', text: 'रिमोट बदलाव टैग होते हैं और अनडू स्टैक में नहीं जाते।' },
      ],
    },
    diagram: {
      label: 'डायग्राम: UI एडिटर को कमांड भेजता है, जो SceneModel बदलता है।',
      ui: ['UI', 'React: पैनल, कैटलॉग'], editor: ['एडिटर', 'कमांड, हिस्ट्री, सेलेक्शन'],
      collab: ['कोलैबोरेशन', 'प्रेज़ेंस, रिमोट एडिट'], model: ['Scene मॉडल', 'दीवारें, कमरे, फर्नीचर। एकल स्रोत।'],
      plan: ['2D प्लान', 'Canvas 2D'], scene: ['3D सीन', 'Three.js, WebGL2'], data: ['स्टोरेज और सिंक', 'localStorage, WebSocket'],
      commands: 'कमांड', events: 'चेंज इवेंट', ops: 'ऑप्स और JSON',
    },
    stack: {
      title: 'टेक स्टैक',
      head: ['क्षेत्र', 'टूल', 'उद्देश्य'],
      rows: [
        ['भाषा', 'TypeScript (strict)', 'मॉडल, कमांड और इवेंट के लिए टाइप्स'],
        ['3D', 'Three.js, WebGL2', 'सीन, कैमरा, लाइट, Raycaster'],
        ['2D', 'Canvas 2D', 'कस्टम प्लान रेंडरर, कोई लाइब्रेरी नहीं'],
        ['UI', 'React 19', 'पैनल और फॉर्म'],
        ['स्टेट', 'Zustand', 'टूल, लेआउट, लाइटिंग'],
        ['टेस्ट', 'Jest', 'जियोमेट्री, मॉडल, हिस्ट्री, स्नैपिंग'],
        ['टूलिंग', 'Vite, ESLint, Prettier', 'फास्ट सर्वर, कोड स्टाइल'],
        ['डिप्लॉयमेंट', 'Docker, nginx, Node.js', 'WebSocket रिले तैयार है'],
      ],
    },
    roadmap: {
      title: 'स्कोप और अगले कदम',
      lead: 'प्रोजेक्ट जानबूझकर सीमित है। अभी ये नहीं है:',
      items: [
        'वास्तविक 3D मॉडल। GLB लोडर तैयार है लेकिन फर्नीचर अभी प्रिमिटिव से बना है।',
        'किसी भी आकार का फर्श। अभी कमरे आयताकार हैं।',
        'ऑब्जेक्ट कोलिज़न और मल्टी-सेलेक्ट।',
        'यूज़र अकाउंट और सर्वर-साइड स्टोरेज।',
      ],
      cta: 'तैयार अपार्टमेंट से शुरू करें — इसे तोड़ें और फिर बनाएँ।',
      source: 'सोर्स कोड', author: 'डेवलपर',
    },
  },
};
