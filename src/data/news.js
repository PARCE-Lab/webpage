// Newest first. `summary` is the shorter wording shown on the home page;
// it falls back to `title` when omitted. The News page also shows `category`
// (Lab, Publication, Award, People, Event), the `body` paragraphs, an optional
// `image` + `imageAlt`, and `links` ({ label, to }; internal paths or full URLs).
export const news = [
  {
    date: 'October 2026',
    category: 'Lab',
    title: 'PARCE-LAB launches its website.',
    body: [
      'The new PARCE-LAB website brings together the lab’s research thrusts, publications, team, facilities, and opportunities to get involved.',
      'News, publications, and member profiles will be updated regularly as the lab grows.',
    ],
    links: [
      { label: 'Meet the team', to: '/people' },
      { label: 'Publications', to: '/publications' },
    ],
  },
  {
    date: 'August 2026',
    category: 'Lab',
    title: 'PARCE-LAB launches at Virginia Commonwealth University.',
    body: [
      'The Planning, Autonomy, and Reliable Control for Embodied-Systems Lab (PARCE-LAB) opens in the Department of Mechanical and Nuclear Engineering at Virginia Commonwealth University, led by Assistant Professor Gustavo A. Cardona.',
      'The lab develops specification-driven autonomy, connecting temporal logic, optimization, and physically aware control, with applications in multi-robot systems and robots that work alongside people.',
    ],
    links: [
      { label: 'Our research', to: '/research' },
      { label: 'Join PARCE-LAB', to: '/join' },
    ],
  },
  {
    date: '2026',
    category: 'Publication',
    title: 'Journal article on seamless physical human–humanoid interaction.',
    body: [
      '“Toward Seamless Physical Human-Humanoid Interaction: Insights from Control, Intent, and Modeling with a Vision for What Comes Next,” by G. A. Cardona, S. Kumbhar, and P. Artemiadis, appears in the Journal of Intelligent & Robotic Systems.',
      'The article examines control, human intent, and modeling for physical collaboration between people and humanoid robots, and sets out directions for future work in the area.',
    ],
    image: '/assets/images/figures/human-humanoid-collaboration.jpg',
    imageAlt: 'Human and humanoid robot collaborating in a physical manipulation task',
    links: [
      { label: 'Publications', to: '/publications' },
      { label: 'Physical human–robot interaction research', to: '/research#interaction' },
    ],
  },
  {
    date: '2025',
    category: 'Award',
    title:
      'Gustavo receives the Lehigh University Outstanding Dissertation Award in Mechanical Engineering and the Elizabeth V. Stout Dissertation Award.',
    summary: 'Gustavo receives two dissertation awards from Lehigh University.',
    body: [
      'Gustavo A. Cardona received two awards from Lehigh University for his Ph.D. dissertation in Mechanical Engineering: the Outstanding Dissertation Award in Mechanical Engineering and the Elizabeth V. Stout Dissertation Award.',
    ],
    links: [{ label: 'Principal investigator', to: '/people' }],
  },
];
