Components and interface specification for Shipspeak UI cockpit. The frontend user interface of Shipspeak is engineered using Next.js App Router, React 19, TypeScript, and the latest Tailwind CSS specification, enforcing a strict developer-first dark mode aesthetic inspired by Raycast Linear. 
Top navigation component:
The top navigation bar provides ambient system context while remaining non-intrusive. It mounts the Shipspeak brand identity alongside a single muted challenge badge indicating participation in the Wispr Flow No Hands Hackathon. The right cluster of the navigation bar hosts direct utility triggers and an interactive terminal CLI drawer toggle, a one-click JS zip deliverables bundle export button under a repository link pointing directly to the open source repository on GitHub. 
Input Control Center:
The primary user entry point is split into three functional modules:

1\. A segmented control preset track allows evaluators and judges to load three realistic scenarios with a single click: an authentication refactoring branch, a multi-agent AI pipeline, and a voice-first hackathon project.

2\. The voice brain DOM container encapsulates an interactive text area paired with our Web Audio API visualizer HUD. The visualizer initializes an audio context and analysis node upon user authorization, calculating FFT frequency bins and rendering 24 dynamic equalizer bars on an HTML canvas element. When input volume exceeds a silence threshold, an ambient glowing aura blooms around the container borders.
1. A collapsible Git diff draw provides an auxiliary input field with integrated syntax highlighting and file change counters, allowing developers to supply concrete code context alongside their spoken rationale.

Real-time bento grid deliverable generation results are presented across a responsive 2x2 bento grid. The pull request card features dual-mode inspection between high-level release specifications and raw GitHub Markdown, accompanied by a 0auth deep link launcher that constructs a pre-filled repository compare URLs.

The architecture card hosts our client-side Mermaid SVG rendering engine, which utilizes isolated dynamic GUIDs to prevent DOM identifier collisions during hot reloads, supplemented by pan and zoom modal inspection, multi-theme switching, and off-screen canvas PNG and SVG serialization. The video script card decomposes presentations into precise time intervals, pairing spoken dialogue with actionable screen recording directions. 
Social Postcard provides platform-tailored launch drafts for Twitter and LinkedIn with live character count verification. Every card incorporates an inline voice-to-text input bar allowing developers to execute granular in-place prompt refinements using Wispr Flow without regenerating adjacent artifacts.

