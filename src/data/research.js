// Research thrusts shown on the Research page (in order). `id` is the anchor
// used by links such as /research#formal from the Home page cards. `short` labels
// the thrust's hub in the keyword graph at the bottom of the Research page.
export const thrusts = [
  {
    id: 'formal',
    short: 'Formal methods',
    title: 'Formal specification and synthesis',
    image: '/assets/images/figures/weighted-stl-syntax-tree.png',
    alt: 'Weighted signal temporal logic syntax tree',
    caption: 'Weighted temporal-logic structure used to encode priorities and satisfaction choices.',
    text: 'We use temporal logic to express complex, time-dependent task requirements, safety rules, and human preferences in a precise mathematical language. Our synthesis methods translate those specifications into plans and controllers with checkable guarantees, helping autonomous systems explain what was achieved, what was relaxed, and why.',
    tags: ['Signal temporal logic', 'Weighted STL', 'Controller synthesis', 'Formal guarantees'],
  },
  {
    id: 'planning',
    short: 'Scalable planning',
    title: 'Scalable planning and decision-making',
    image: '/assets/images/figures/heterogeneous-team-plan.png',
    alt: 'A sequence of plans for a heterogeneous multi-robot team transporting resources',
    caption: 'Heterogeneous robot and resource trajectories generated from temporal-logic missions.',
    text: 'We formulate planning and coordination problems as structured mixed-integer optimization problems. The goal is to scale specification-driven autonomy to heterogeneous teams, robotic swarms, modular systems, and logistics applications while accounting for uncertainty, resource constraints, and conflicting objectives.',
    tags: ['Mixed-integer optimization', 'Multi-robot systems', 'Uncertainty', 'Partial satisfaction'],
  },
  {
    id: 'interaction',
    short: 'Physical HRI',
    title: 'Safe and adaptive physical human–robot interaction',
    image: '/assets/images/figures/human-humanoid-collaboration.jpg',
    alt: 'Human and humanoid robot performing a collaborative physical manipulation task',
    caption: 'Physical co-manipulation between a human partner and a humanoid robot.',
    portrait: true,
    text: 'Physical collaboration requires more than collision avoidance. Robots must interpret human intent, share loads, regulate contact forces, and adapt their role without compromising safety. We develop unified methods that connect formal task context to compliant, physically aware control for humanoids and other interactive robots.',
    tags: ['Human–humanoid interaction', 'Shared autonomy', 'Impedance control', 'Safety shields'],
  },
  {
    id: 'aerial',
    short: 'Coupled & aerial',
    title: 'Physically coupled and aerial robotic systems',
    image: '/assets/images/figures/catenary-robot.jpg',
    alt: 'Two quadrotors using a suspended cable to manipulate a box',
    caption: 'The catenary robot uses two quadrotors and a cable for cooperative non-prehensile manipulation.',
    text: 'Our work also studies teams of robots whose dynamics are coupled through cables, payloads, and contact. These systems provide a foundation for understanding force sharing, coordination, uncertainty, and control in more complex embodied collaborations.',
    tags: ['Aerial manipulation', 'Adaptive control', 'Coupled dynamics', 'Cooperative transportation'],
  },
];

// Links between keywords of different thrusts, drawn in the keyword graph.
// `a` and `b` must match tags above exactly; `why` is shown when either is selected.
export const keywordLinks = [
  { a: 'Weighted STL', b: 'Partial satisfaction', why: 'Weights decide which requirements to relax when not all of them can be met.' },
  { a: 'Controller synthesis', b: 'Mixed-integer optimization', why: 'Temporal-logic missions are synthesized into plans by solving mixed-integer programs.' },
  { a: 'Signal temporal logic', b: 'Multi-robot systems', why: 'Team missions are written as temporal-logic specifications.' },
  { a: 'Formal guarantees', b: 'Safety shields', why: 'Shields enforce formally specified safety rules during physical interaction.' },
  { a: 'Uncertainty', b: 'Adaptive control', why: 'Adaptive controllers keep coordinated robots on task despite model uncertainty.' },
  { a: 'Multi-robot systems', b: 'Cooperative transportation', why: 'Cable-coupled quadrotors are a physically coupled multi-robot team.' },
  { a: 'Coupled dynamics', b: 'Impedance control', why: 'Force sharing through cables and payloads informs compliant control with human partners.' },
];
