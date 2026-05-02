import type { IngestDocument } from "@aliasist/rag";

export const spaceCorpus: IngestDocument[] = [
  {
    source: "spacesist/corpus/nasa-overview",
    metadata: { topic: "nasa", kind: "agency-overview" },
    text:
      "NASA is the United States civil space agency, created in 1958 after the National Aeronautics and Space Act. Its work spans human spaceflight, robotic exploration, aeronautics, Earth science, heliophysics, astrophysics, planetary science, technology demonstrations, and education. NASA operates through centers including Johnson Space Center for human spaceflight operations, Kennedy Space Center for launch processing, Marshall Space Flight Center for propulsion and launch systems, Jet Propulsion Laboratory for many robotic planetary missions, Goddard Space Flight Center for Earth and space science missions, Ames Research Center, Langley Research Center, Glenn Research Center, Armstrong Flight Research Center, Stennis Space Center, and others. NASA often works with international agencies, universities, contractors, and commercial providers.",
  },
  {
    source: "spacesist/corpus/mercury-gemini-apollo",
    metadata: { topic: "human-spaceflight", kind: "history" },
    text:
      "Project Mercury proved that the United States could send humans into space and return them safely. Alan Shepard made the first U.S. human spaceflight in 1961, and John Glenn became the first American to orbit Earth in 1962. Project Gemini followed, testing rendezvous, docking, long-duration flight, and spacewalking skills needed for lunar missions. Apollo then carried astronauts to the Moon. Apollo 8 orbited the Moon in 1968. Apollo 11 landed Neil Armstrong and Buzz Aldrin on the Moon on July 20, 1969, while Michael Collins remained in lunar orbit. Apollo 13 suffered an oxygen tank explosion in 1970 and became a successful rescue mission. Apollo 17 in 1972 was the final crewed lunar landing of the Apollo era.",
  },
  {
    source: "spacesist/corpus/space-shuttle",
    metadata: { topic: "space-shuttle", kind: "program-history" },
    text:
      "The Space Shuttle program flew from 1981 to 2011 using reusable orbiters, solid rocket boosters, and an external tank. Shuttle missions launched satellites, serviced Hubble Space Telescope, carried Spacelab research, and assembled major parts of the International Space Station. The orbiters included Columbia, Challenger, Discovery, Atlantis, and Endeavour. Challenger was lost during launch in 1986, and Columbia was lost during reentry in 2003. Those accidents reshaped NASA safety culture, risk management, and return-to-flight processes. The shuttle was powerful and flexible, but expensive and complex; after retirement, NASA shifted low Earth orbit crew transport toward commercial providers.",
  },
  {
    source: "spacesist/corpus/iss",
    metadata: { topic: "iss", kind: "program" },
    text:
      "The International Space Station is a permanently crewed orbital laboratory assembled through cooperation among NASA, Roscosmos, ESA, JAXA, and CSA. Assembly began in 1998, and continuous human presence started in November 2000. The ISS supports microgravity research in biology, medicine, materials, fluid physics, combustion, Earth observation, technology demonstration, and human adaptation to space. It orbits roughly 400 kilometers above Earth and serves as a testbed for long-duration human spaceflight. Commercial cargo and crew vehicles have become a major part of ISS logistics, including SpaceX Dragon and Northrop Grumman Cygnus cargo services and SpaceX Crew Dragon for crew transport.",
  },
  {
    source: "spacesist/corpus/artemis-moon-to-mars",
    metadata: { topic: "artemis", kind: "program" },
    text:
      "Artemis is NASA's Moon-to-Mars exploration campaign. Its goals include returning astronauts to the lunar surface, building sustainable lunar exploration capabilities, developing the Gateway lunar-orbit platform, testing deep-space life support and operations, and preparing for eventual human missions to Mars. The Space Launch System rocket and Orion spacecraft are central NASA-owned exploration systems. Commercial Human Landing System providers support lunar landing architecture. Artemis I was an uncrewed Orion flight test around the Moon. Artemis II is planned as the first crewed Orion lunar flyby. Later Artemis missions target lunar surface operations, science, spacesuits, rovers, power systems, communications, and resource-use demonstrations.",
  },
  {
    source: "spacesist/corpus/robotic-planetary",
    metadata: { topic: "robotic-exploration", kind: "missions" },
    text:
      "NASA robotic exploration has visited planets, moons, asteroids, comets, and the outer solar system. Mariner, Viking, Voyager, Galileo, Cassini, New Horizons, Juno, OSIRIS-REx, and many Mars orbiters, landers, and rovers expanded scientific understanding of the solar system. Voyager 1 and Voyager 2 performed grand-tour flybys of outer planets and continue as interstellar probes. Cassini studied Saturn and its moons, including Titan and Enceladus. New Horizons flew past Pluto in 2015. OSIRIS-REx returned samples from asteroid Bennu. Robotic missions are designed around science questions, instruments, launch windows, power, communications, radiation, propulsion, and mission operations constraints.",
  },
  {
    source: "spacesist/corpus/mars",
    metadata: { topic: "mars", kind: "missions" },
    text:
      "NASA's Mars program uses orbiters, landers, rovers, and helicopters to study climate, geology, habitability, water history, and potential biosignatures. Viking landed in 1976. Pathfinder and Sojourner demonstrated lower-cost surface exploration in 1997. Spirit and Opportunity explored from 2004, with Opportunity lasting until 2018. Curiosity landed in Gale Crater in 2012 to study ancient habitable environments. Perseverance landed in Jezero Crater in 2021 to collect samples and search for evidence of ancient microbial life. Ingenuity demonstrated powered flight on Mars. Mars Reconnaissance Orbiter, Odyssey, MAVEN, and other spacecraft provide imaging, communications relay, and atmospheric science.",
  },
  {
    source: "spacesist/corpus/telescopes-astrophysics",
    metadata: { topic: "astronomy", kind: "missions" },
    text:
      "NASA astrophysics missions observe the universe across the electromagnetic spectrum. Hubble Space Telescope, launched in 1990, transformed astronomy through visible and ultraviolet observations and was serviced by shuttle astronauts. Chandra observes X-rays from high-energy objects. Spitzer observed infrared light. James Webb Space Telescope, launched in 2021, observes infrared light from early galaxies, star formation, exoplanet atmospheres, and dust-obscured regions. TESS searches for exoplanets around nearby stars. Roman Space Telescope is designed for wide-field infrared surveys, dark energy studies, and exoplanet microlensing. Space telescopes complement ground observatories by avoiding atmospheric distortion and absorption.",
  },
  {
    source: "spacesist/corpus/commercial-international",
    metadata: { topic: "partnerships", kind: "programs" },
    text:
      "Modern NASA programs rely heavily on commercial and international partnerships. Commercial Orbital Transportation Services and Commercial Resupply Services helped develop private cargo delivery to the ISS. Commercial Crew developed U.S. crew transport services to low Earth orbit, with SpaceX Crew Dragon becoming operational and Boeing Starliner developed as another provider. Commercial Lunar Payload Services buys delivery of science and technology payloads to the Moon. NASA also works with ESA, JAXA, CSA, and other agencies on missions including the ISS, Artemis, planetary science, Earth observation, and astrophysics. Partnerships distribute cost, capability, risk, and political support.",
  },
  {
    source: "spacesist/corpus/rendezvous-docking-eva",
    metadata: { topic: "spaceflight-operations", kind: "techniques" },
    text:
      "Rendezvous, docking, and extravehicular activity are core human-spaceflight techniques. Rendezvous means bringing two spacecraft to the same place and velocity in orbit through carefully timed burns and navigation updates. Docking is the physical joining of spacecraft through compatible mechanisms, guidance sensors, and alignment procedures. Gemini missions demonstrated rendezvous and docking skills that Apollo needed for lunar-orbit operations. Spacewalks, also called EVA or extravehicular activity, require life support, suits, tethers, procedures, tools, and careful timeline management. These skills remain central to ISS assembly, servicing, maintenance, and future lunar operations.",
  },
  {
    source: "spacesist/corpus/launch-vehicles-spacecraft",
    metadata: { topic: "spacecraft-systems", kind: "basics" },
    text:
      "A launch vehicle is the rocket that lifts payloads from Earth, while a spacecraft is the payload system that operates in space. Multi-stage rockets discard empty mass to keep accelerating efficiently. Common launch-system concepts include first and second stages, upper stages, fairings, guidance, avionics, propellant choice, thrust-to-weight ratio, and payload mass limits. Spacecraft can include a bus, propulsion, power, communications, computers, thermal control, attitude control, structures, instruments, docking hardware, and crew systems. Good explanations distinguish between the launcher, the spacecraft, and any lander, rover, capsule, or station module carried by the mission.",
  },
  {
    source: "spacesist/corpus/hubble-webb-comparison",
    metadata: { topic: "space-telescopes", kind: "comparison" },
    text:
      "Hubble Space Telescope and James Webb Space Telescope are both major observatories, but they serve different observational niches. Hubble primarily observes visible and ultraviolet light, with some near-infrared capability, and it was designed to be serviced in low Earth orbit by space shuttle crews. James Webb Space Telescope is optimized for infrared astronomy and operates near the Sun-Earth L2 region rather than in low Earth orbit. Webb studies early galaxies, star formation, dust-obscured regions, and exoplanet atmospheres with a large segmented mirror and a cold thermal environment. Questions about Webb versus Hubble usually hinge on wavelength, orbit, serviceability, mirror size, and science goals.",
  },
  {
    source: "spacesist/corpus/orion-sls-gateway",
    metadata: { topic: "artemis-architecture", kind: "systems" },
    text:
      "The Artemis exploration architecture combines several distinct systems. The Space Launch System, or SLS, is the heavy-lift launch vehicle designed to send Orion and deep-space payloads beyond low Earth orbit. Orion is the crew spacecraft that supports astronauts during launch, deep-space travel, and reentry. Gateway is a planned lunar-orbit outpost intended to support logistics, habitation, communications, and mission flexibility for lunar exploration. Human landing systems, surface suits, rovers, and power systems are separate elements that connect to the broader Moon-to-Mars campaign. Clear answers should separate the roles of SLS, Orion, Gateway, and lunar landers rather than treating Artemis as a single vehicle.",
  },
  {
    source: "spacesist/corpus/spaceflight-safety",
    metadata: { topic: "safety", kind: "principles" },
    text:
      "Spaceflight safety depends on engineering discipline, redundancy, testing, operational procedures, failure analysis, and an organizational culture that protects dissenting technical views. Major accidents including Apollo 1, Challenger, and Columbia showed how hardware flaws, schedule pressure, communication breakdowns, and normalization of deviance can combine into disaster. Space systems face vacuum, radiation, thermal cycling, vibration, micrometeoroids, high-energy propulsion, reentry heating, software complexity, and human factors. Good answers about spaceflight should distinguish confirmed facts from estimates, avoid presenting speculative timelines as certain, and explain uncertainty clearly.",
  },
  {
    source: "spacesist/corpus/earth-science-heliophysics",
    metadata: { topic: "science", kind: "missions" },
    text:
      "NASA is not only a deep-space agency; it also studies Earth and the Sun. Earth science missions observe weather, climate, oceans, land use, ice, fires, vegetation, atmospheric chemistry, and natural hazards. These datasets support research and public services. Heliophysics missions study the Sun, solar wind, magnetosphere, auroras, radiation belts, and space weather. Space weather can affect satellites, astronauts, GPS, radio communications, aviation, and power grids. Missions such as Parker Solar Probe, Solar Dynamics Observatory, and MMS help explain solar activity and its effects on Earth and near-Earth space.",
  },
  {
    source: "spacesist/corpus/how-to-answer-space-questions",
    metadata: { topic: "rag-policy", kind: "answering" },
    text:
      "When answering space questions, identify the program, mission, agency, vehicle, destination, and era if possible. If a question asks about current schedules, launches, crew assignments, budgets, or active mission status, say that live verification may be needed because those facts change. For historical questions, give dates and explain sequence. For technical questions, define terms such as orbit, delta-v, payload, launch vehicle, spacecraft bus, lander, rover, sample return, docking, rendezvous, reentry, escape velocity, radiation shielding, and life support. Use source chunks as grounding and avoid claiming a source says more than it contains.",
  },
];
