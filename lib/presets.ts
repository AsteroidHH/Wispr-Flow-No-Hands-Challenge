import { Preset } from './types';

export const JUDGE_PRESETS: Preset[] = [
  {
    id: 'auth-refactor',
    name: 'Auth Refactor',
    tagline: 'OAuth2 PKCE + Redis session revocation',
    iconName: 'ShieldCheck',
    voiceTranscript: `Alright, quick brain dump on the auth refactor branch. Basically we finally ripped out the legacy cookie-based session store that was blowing up our serverless cold starts. Replaced it with an OAuth2 PKCE flow backed by Redis for active token revocation. 

The biggest thing is we moved session validation to edge middleware. When a request hits the edge, we check the HMAC signature on the short-lived JWT, and we only hit Redis if the token has the revocation flag or is older than 5 minutes. 

Watch out for breaking changes though: I had to change the payload structure in \`user_metadata\` — deprecated \`user.legacy_id\` and now everything requires \`user.sub\` formatted as a UUIDv4. Also any downstream service checking \`req.headers['x-session-id']\` needs to switch to standard \`Authorization: Bearer\` tokens or it will 401 immediately. Added automated retry handling for redis failover to read replicas.`,
    gitDiff: `diff --git a/middleware.ts b/middleware.ts
index 4a8b12f..9e2c431 100644
--- a/middleware.ts
+++ b/middleware.ts
@@ -12,8 +12,12 @@ export async function middleware(req: NextRequest) {
-  const session = await getCookieSession(req);
-  if (!session || !session.valid) {
-    return NextResponse.redirect('/login');
-  }
+  const token = req.headers.get('authorization')?.replace('Bearer ', '');
+  if (!token) return new NextResponse('Unauthorized', { status: 401 });
+  
+  const verification = await verifyEdgeJwt(token);
+  if (!verification.valid) {
+    return new NextResponse('Invalid or Revoked Token', { status: 401 });
+  }
+  return NextResponse.next();
 }
diff --git a/lib/auth/redis.ts b/lib/auth/redis.ts
new file mode 100644
--- /dev/null
+++ b/lib/auth/redis.ts
@@ -0,0 +1,18 @@
+import { Redis } from '@upstash/redis';
+
+export const redis = new Redis({
+  url: process.env.UPSTASH_REDIS_REST_URL!,
+  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
+});
+
+export async function isTokenRevoked(jti: string): Promise<boolean> {
+  const revoked = await redis.get(\`revoked:\${jti}\`);
+  return Boolean(revoked);
+}`,
    deliverables: {
      pullRequest: {
        title: 'feat(auth): migrate to OAuth2 PKCE with edge JWT verification and Redis revocation',
        commitMessage: 'feat(auth): implement OAuth2 PKCE flow with Redis token revocation and edge validation',
        summary: 'Deprecates the stateful cookie session store in favor of an OAuth2 PKCE architecture with low-latency edge JWT verification and Upstash Redis for instant session revocation.',
        keyChanges: [
          'Moved session verification from origin node server into edge middleware with HMAC signature checks',
          'Integrated Upstash Redis cluster to track revoked JTI tokens with 5-minute TTL caching',
          'Standardized authentication header to `Authorization: Bearer <token>` across all protected route handlers',
          'Added automatic fallback to secondary read-replicas during transient Redis connectivity blips'
        ],
        breakingChanges: [
          '`user_metadata.legacy_id` is removed. All consumers must use `user_metadata.sub` (UUIDv4).',
          'Custom `x-session-id` request header is no longer parsed. Requests without standard Bearer token return HTTP 401.'
        ]
      },
      architecture: {
        title: 'OAuth2 PKCE & Edge Session Architecture',
        mermaidCode: `flowchart TD
  Client["Client App (Browser/Native)"] -->|"1. Auth Request (PKCE Challenge)"| Edge["Next.js Edge Middleware"]
  Edge -->|"2. Check HMAC Signature"| FastPath{"Valid JWT?"}
  FastPath -->|"No"| Deny["401 Unauthorized"]
  FastPath -->|"Yes"| Cache{"Token > 5m or Flagged?"}
  Cache -->|"No"| Origin["Upstream Origin API"]
  Cache -->|"Yes"| Redis[("Upstash Redis Revocation Store")]
  Redis -->|"Revoked"| Deny
  Redis -->|"Active"| Origin
  Origin -->|"Response"| Client`,
        description: 'Two-tier verification model: Edge fast-path verifies cryptographic signatures within 2ms; Redis is queried only for aging or flagged sessions.'
      },
      videoScript: {
        title: '2-Minute Technical Walkthrough: Zero-Latency Auth Overhaul',
        totalDuration: '02:00',
        segments: [
          {
            timestamp: '00:00 - 00:20',
            stage: 'Hook & Problem Statement',
            audio: 'Our old session cookies were taking 300 milliseconds on serverless cold starts. Today, we are shipping a zero-latency auth overhaul using OAuth2 PKCE and edge verification.',
            visualCue: 'Screen capture showing latency graph dropping from 340ms to 8ms in Datadog/Vercel analytics.'
          },
          {
            timestamp: '00:20 - 00:55',
            stage: 'The Edge Architecture',
            audio: 'Instead of hitting our central database for every single image and route query, our edge middleware checks the JWT signature in 2 milliseconds. But here is the trick: how do you revoke tokens instantly if they are cached?',
            visualCue: 'Pan over Mermaid architecture diagram highlighting the Edge Middleware to Redis fast-path decision tree.'
          },
          {
            timestamp: '00:55 - 01:35',
            stage: 'Live Demo & Revocation Test',
            audio: 'Watch this. I am triggering a password reset on this test device. The backend pushes the token JTI directly to Upstash Redis. Within 12 milliseconds globally, the edge middleware blocks the subsequent request with a 401.',
            visualCue: 'Terminal view running curl test: first request 200 OK, trigger revoke command, immediate 401 Unauthorized.'
          },
          {
            timestamp: '01:35 - 02:00',
            stage: 'Migration Notes & Wrap Up',
            audio: 'Note for backend teams: swap your x-session-id headers for standard Bearer tokens. Check the PR description for the UUIDv4 migration guide. Links are in the description below!',
            visualCue: 'Scroll through the GitHub PR description highlighting breaking change warnings in red/amber.'
          }
        ]
      },
      socialPost: {
        twitter: {
          content: `We just eliminated 300ms from our serverless cold starts by replacing cookie sessions with OAuth2 PKCE + Edge JWT verification.

⚡ Edge HMAC checks (2ms)
🛡️ Upstash Redis active revocation (<15ms globally)
🚫 Ripped out stateful DB session queries

Breaking change: switch to Bearer tokens! 🧵👇`,
          charCount: 278,
          hashtags: ['#webdev', '#nextjs', '#redis', '#serverless', '#buildinpublic']
        },
        linkedin: {
          hook: 'How we cut serverless latency by 97% without sacrificing instant session revocation:',
          body: 'For months, our database spent 35% of its CPU cycles answering one repetitive question: "Is this session cookie valid?"\n\nWhen scaling serverless endpoints, stateful session lookups become your single biggest bottleneck. Today, we merged our OAuth2 PKCE refactor.\n\nHere is how the new architecture works:\n1. Edge Fast-Path: Next.js edge middleware verifies JWT HMAC signatures in under 2ms.\n2. Targeted Revocation: We only query Upstash Redis if the token exceeds 5 minutes or carries an elevated privilege flag.\n3. Zero Database Hits: Normal browsing generates zero database read operations for auth.',
          takeaways: [
            'Don\'t hit a relational DB on every HTTP request just to verify identity.',
            'Tier your revocation checks based on token age and privilege tier.',
            'Edge cryptographic validation gives you the speed of stateless with the safety of stateful.'
          ],
          callToAction: 'Check out the full PR breakdown and architecture flowchart below!'
        }
      }
    }
  },
  {
    id: 'ai-agent-pipeline',
    name: 'AI Agent Pipeline',
    tagline: 'Multi-agent RAG with semantic router & vector fallback',
    iconName: 'Cpu',
    voiceTranscript: `Okay, recording the overview for the multi-agent RAG pipeline PR. The problem we were hitting was that single-prompt agents were choking whenever a query required both real-time SQL analytics and deep unstructured document search. 

So what we did: we introduced a semantic supervisor router using small embedding classifications. The router inspects the incoming user intent and fans out to specialized sub-agents — an SQL coder agent that queries Snowflake, and a Vector search agent that hits Pinecone.

The biggest upgrade here is our fallback circuit breaker. If the vector retrieval confidence score drops below 0.72, the pipeline automatically spins up an exploratory web search agent to ground the answer instead of hallucinating. 

Also added streaming chunk reconciliation so the client UI sees token streaming immediately from whichever agent responds first, while the supervisor aggregates citations in the background. Token consumption is down 40% because the SQL agent never gets the bloated RAG context.`,
    gitDiff: `diff --git a/lib/agents/supervisor.ts b/lib/agents/supervisor.ts
new file mode 100644
--- /dev/null
+++ b/lib/agents/supervisor.ts
@@ -0,0 +1,24 @@
+import { routeIntent } from './router';
+import { sqlAgent } from './sqlAgent';
+import { vectorAgent } from './vectorAgent';
+
+export async function runOrchestrator(query: string, ctx: AgentContext) {
+  const route = await routeIntent(query);
+  
+  if (route.domain === 'ANALYTICS_SQL') {
+    return sqlAgent.execute({ query, schema: ctx.schema });
+  }
+  
+  const vectorResult = await vectorAgent.search({ query, topK: 5 });
+  if (vectorResult.confidenceScore < 0.72) {
+    return fallbackWebSearchAgent.execute({ query, partial: vectorResult });
+  }
+  return vectorResult;
+}`,
    deliverables: {
      pullRequest: {
        title: 'feat(agents): introduce semantic supervisor routing with sub-agent fan-out and search circuit breaker',
        commitMessage: 'feat(pipeline): implement semantic orchestrator for SQL and Vector multi-agent delegation',
        summary: 'Replaces the monolithic single-agent prompt architecture with a hierarchical multi-agent supervisor. Routes queries to specialized SQL analytics or Vector search agents with dynamic fallback to live web grounding.',
        keyChanges: [
          'Engineered lightweight semantic intent router with sub-15ms embedding classification',
          'Separated SQL code generation and Pinecone semantic search into isolated sub-agent runtimes',
          'Implemented confidence score circuit breaker (< 0.72 threshold triggers autonomous web grounding)',
          'Enabled dual-stream token reconciliation for real-time frontend streaming without blocking on citation generation'
        ],
        breakingChanges: [
          '`AgentResponse` schema now returns `citations: CitationMap` instead of raw string arrays.',
          'Removed deprecated `/api/agent/monolith` endpoint. Use `/api/agent/orchestrate` with streaming response headers.'
        ]
      },
      architecture: {
        title: 'Multi-Agent Supervisor & Fallback Topology',
        mermaidCode: `flowchart TD
  UserPrompt["User Prompt"] --> Router["Semantic Intent Classifier"]
  Router -->|"SQL / Relational"| SQLAgent["SQL Analyst Agent"]
  Router -->|"Semantic / Knowledge"| VecAgent["Vector RAG Agent"]
  SQLAgent --> Snowflake[("Snowflake Data Warehouse")]
  VecAgent --> Pinecone[("Pinecone Vector DB")]
  VecAgent -->|"Confidence < 0.72"| Circuit{"Circuit Breaker"}
  Circuit -->|"Low Confidence"| WebAgent["Grounding Web Agent"]
  Circuit -->|"Sufficient Score"| Aggregator["Stream Aggregator & Reconciler"]
  Snowflake --> Aggregator
  Pinecone --> Aggregator
  WebAgent --> Aggregator
  Aggregator --> StreamOutput["Client UI (Real-time Stream)"]`,
        description: 'Hierarchical orchestration architecture: Intent classifier routes upstream queries, while the circuit breaker ensures hallucinations are preempted via autonomous web search.'
      },
      videoScript: {
        title: '2-Minute Technical Demo: Smarter Multi-Agent Orchestration',
        totalDuration: '02:00',
        segments: [
          {
            timestamp: '00:00 - 00:25',
            stage: 'Hook & Monolith Limitations',
            audio: 'Every AI engineer knows the pain: you give your agent a 50-page document index AND a SQL database schema, and it immediately loses its mind and hallucinates queries.',
            visualCue: 'Split screen showing monolithic agent failing with context overflow error vs clean multi-agent execution.'
          },
          {
            timestamp: '00:25 - 01:05',
            stage: 'Intent Routing in Action',
            audio: 'Here is what we built. When you ask "What was our Q3 churn rate compared to competitor pricing?", our semantic supervisor splits the prompt. The math goes straight to our specialized SQL runner, while the market sentiment routes to vector search.',
            visualCue: 'Animated UI highlight showing prompt fanning out into two distinct sub-agent execution logs simultaneously.'
          },
          {
            timestamp: '01:05 - 01:40',
            stage: 'The Circuit Breaker Safety Net',
            audio: 'Now watch what happens when we ask about an event from 3 hours ago that is not in our vector database. Notice the confidence gauge drops to 0.61. Boom! The circuit breaker catches it and triggers live search grounding.',
            visualCue: 'Real-time telemetry showing vector score failing the 0.72 threshold and web grounding agent kicking in automatically.'
          },
          {
            timestamp: '01:40 - 02:00',
            stage: 'Performance Gains & Next Steps',
            audio: 'The results: 40% reduction in token burn and 2.4x faster initial time-to-first-token. Check out the pull request details and try the live playground!',
            visualCue: 'Side-by-side benchmark card showing token savings and latency improvements.'
          }
        ]
      },
      socialPost: {
        twitter: {
          content: `Stop cramming SQL schemas and vector indexes into a single LLM prompt.

We just open-sourced our multi-agent supervisor architecture:

🔀 Sub-15ms semantic router
📊 SQL Agent + Snowflake
🔍 Vector Agent + Pinecone
⚡ <0.72 confidence circuit breaker with live web search
📉 40% lower token burn

Architecture breakdown 👇`,
          charCount: 295,
          hashtags: ['#ai', '#agents', '#rag', '#buildinpublic', '#llm']
        },
        linkedin: {
          hook: 'Why monolithic AI agents fail in production (and how multi-agent routing fixed our latency by 60%):',
          body: 'When building enterprise AI assistants, the instinct is to give one model every tool: database connectors, vector stores, calculators, and API keys.\n\nThe result? Hallucinations, 12,000-token prompt bloat, and astronomical API bills.\n\nWe spent this sprint re-architecting our core agent runtime into a decoupled multi-agent supervisor:\n\n1. Semantic Intent Routing: A miniature classifier analyzes user query topology in 15ms.\n2. Domain-Specific Sub-Agents: SQL queries execute in clean sandboxes without vector baggage; document queries run via Pinecone.\n3. The 0.72 Circuit Breaker: If semantic retrieval confidence drops below 0.72, the pipeline automatically invokes a live grounding agent before answering.\n\nThe outcome? 40% reduction in tokens per session and near-zero hallucination on out-of-distribution questions.',
          takeaways: [
            'Decouple retrieval pipelines from analytical execution pipelines.',
            'Always put an automated confidence circuit breaker between vector search and generation.',
            'Specialize system prompts for each sub-agent rather than using one universal mega-prompt.'
          ],
          callToAction: 'What does your agent orchestrator look like today? Let\'s discuss in the comments!'
        }
      }
    }
  },
  {
    id: 'hackathon-project',
    name: 'Hackathon Project',
    tagline: 'ShipSpeak for Wispr No Hand Challenge',
    iconName: 'Mic',
    voiceTranscript: `Hey team, wrapping up ShipSpeak for the Wispr No Hand Challenge! The vision here is simple: developers spend all their weekend building incredible code at hackathons, but then they run out of energy and submit terrible 2-line pull requests, no architecture diagrams, zero demo scripts, and weak social posts.

With ShipSpeak, you literally just tap your Wispr Flow hotkey, talk for 45 seconds about what you hacked together, drop in your git diff, and boom! In under 4 seconds, ShipSpeak spits out:
One: a production-grade GitHub PR description with breaking change tags.
Two: a live rendered Mermaid architecture diagram that visually illustrates the data flow.
Three: a timed 2-minute hackathon demo video script with exact stage cues.
And four: viral build-in-public posts formatted for both Twitter and LinkedIn.

Everything is voice-editable right inside the cards. If you want to tweak the diagram or tone, you just voice-command it. It completely removes the last-mile cognitive drag for builders!`,
    gitDiff: `diff --git a/app/page.tsx b/app/page.tsx
new file mode 100644
--- /dev/null
+++ b/app/page.tsx
@@ -0,0 +1,38 @@
+import { VoiceInputCenter } from '@/components/InputControlCenter';
+import { BentoGrid } from '@/components/BentoGrid';
+import { Navbar } from '@/components/Navbar';
+
+export default function ShipSpeakApp() {
+  return (
+    <main className="min-h-screen bg-neutral-950 text-neutral-100">
+      <Navbar badge="Built for the Wispr No Hand Challenge" />
+      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
+        <div className="lg:col-span-5">
+          <VoiceInputCenter />
+        </div>
+        <div className="lg:col-span-7">
+          <BentoGrid />
+        </div>
+      </div>
+    </main>
+  );
+}`,
    deliverables: {
      pullRequest: {
        title: 'feat(shipspeak): voice-first last-mile shipping engine for developers and hackathon builders',
        commitMessage: 'feat(core): launch ShipSpeak voice-to-deliverables engine for Wispr No Hand Challenge',
        summary: 'Implements the ShipSpeak voice synthesis dashboard that transforms messy, unstructured audio brain dumps and optional git diffs into four developer-grade shipping artifacts in real time.',
        keyChanges: [
          'Engineered dual-panel dashboard with quick-load judge presets, Wispr Flow indicator, and collapsible git diff drawer',
          'Built responsive 4-card bento grid displaying GitHub PR, Mermaid architecture diagram, 2-min demo script, and social posts',
          'Implemented dedicated client-side Mermaid.js renderer with clean SVG initialization and code/diagram toggle',
          'Added per-card targeted voice-tweak controls and instant one-click copy feedback with clipboard validation'
        ],
        breakingChanges: [
          'Initial release: no backwards compatibility constraints. Requires modern browser with Web Audio and SVG support.'
        ]
      },
      architecture: {
        title: 'ShipSpeak Voice-to-Deliverables Pipeline',
        mermaidCode: `flowchart LR
  Wispr["Wispr Flow Hotkey"] -->|"Voice Brain Dump"| VoiceIn["Audio Transcript Input"]
  Git["Local Git Diff"] -->|"Optional Context"| DiffIn["Collapsible Context Drawer"]
  VoiceIn & DiffIn --> Engine["ShipSpeak Synthesis Engine"]
  Engine -->|"Deliverable 1"| PRCard["GitHub PR & Commit Spec"]
  Engine -->|"Deliverable 2"| DiagCard["Interactive Mermaid Diagram"]
  Engine -->|"Deliverable 3"| ScriptCard["2-Min Timed Demo Video Script"]
  Engine -->|"Deliverable 4"| SocialCard["Twitter & LinkedIn Posts"]
  PRCard & DiagCard & ScriptCard & SocialCard -.->|"Targeted Voice Tweak"| Engine`,
        description: 'End-to-end pipeline: Unstructured voice audio stream and git context synthesized in parallel into 4 developer-grade assets, each with iterative voice refinement.'
      },
      videoScript: {
        title: '2-Minute Hackathon Demo: Never Write a PR Description Again',
        totalDuration: '02:00',
        segments: [
          {
            timestamp: '00:00 - 00:20',
            stage: 'The Hackathon Agony (Hook)',
            audio: 'It is 11:45 AM on Sunday. You have been coding for 36 hours straight. Your project works, but now you have to write a PR, make an architecture diagram, write a demo video script, and post on Twitter. The momentum dies right here.',
            visualCue: 'Fast montage of exhausted developer staring at an empty GitHub PR form and blank video script doc.'
          },
          {
            timestamp: '00:20 - 00:50',
            stage: 'Enter ShipSpeak + Wispr Flow',
            audio: 'Meet ShipSpeak: the voice-first shipping engine built for the Wispr No Hand Challenge. Instead of typing for hours, I just hit my Wispr Flow hotkey and ramble into my microphone about what I built, paste my diff, and hit Generate.',
            visualCue: 'Developer pressing Wispr Flow hotkey; live glowing waveform pulses on the screen as voice fills the transcript.'
          },
          {
            timestamp: '00:50 - 01:30',
            stage: 'The 4-Card Bento Grid Reveal',
            audio: 'Look at the bento grid: Card one gives us a production-grade GitHub PR. Card two compiles a clean, interactive Mermaid architecture flowchart. Card three gives us this exact 2-minute timed video script. And card four drafts our build-in-public announcement.',
            visualCue: 'Camera zooms across the four cards: toggling Mermaid code to diagram, clicking copy with checkmark animation.'
          },
          {
            timestamp: '01:30 - 02:00',
            stage: 'Voice Tweak & Call to Action',
            audio: 'Want to change something? Don\'t touch your keyboard. Just click the voice tweak mic at the bottom of the card, say "Make the tone more punchy," and it updates. Build hands-free. Ship faster with ShipSpeak.',
            visualCue: 'Voice tweak input pulsing; card dynamically updates in real time; closing screen with GitHub repository badge and Wispr logo.'
          }
        ]
      },
      socialPost: {
        twitter: {
          content: `Hackathons shouldn't end with 2 hours of painful documentation.

Introducing ShipSpeak 🚢🎙️ — built for the Wispr No Hand Challenge.

Talk for 45s about what you hacked + drop your git diff:
✨ GitHub PR & commit spec
📊 Interactive Mermaid architecture diagram
⏱️ 2-min timed demo video script
🚀 Twitter & LinkedIn posts

Hands-free shipping 👇`,
          charCount: 297,
          hashtags: ['#WisprNoHandChallenge', '#buildinpublic', '#hackathon', '#voiceai', '#nextjs']
        },
        linkedin: {
          hook: 'The worst part of hackathons isn\'t the bugs — it\'s the last-mile documentation drag:',
          body: 'Every developer knows this feeling: You build something incredible during a 48-hour sprint. But by Sunday morning, your brain is fried. Writing a good pull request, drawing architecture diagrams in Figma, and writing a demo video script feels like torture.\n\nThat is why we built ShipSpeak for the Wispr No Hand Challenge.\n\nShipSpeak is a voice-first last-mile shipping engine. You press your Wispr hotkey, ramble out your raw rational, attach your git diff, and ShipSpeak produces four developer-grade assets in seconds:\n\n1. Structured GitHub PR with breaking changes\n2. Clean Mermaid.js architecture diagrams\n3. 2-minute video demo script with exact timestamp buckets\n4. High-engagement technical social updates',
          takeaways: [
            'Zero keyboard friction for technical documentation.',
            'Voice-driven micro-tweaks for iterative edits without re-prompting.',
            'Engineered for developers who love to build and want to ship faster.'
          ],
          callToAction: 'Check out our open-source repo and interactive playground in the link below!'
        }
      }
    }
  }
];

export function getPresetById(id: string): Preset | undefined {
  return JUDGE_PRESETS.find(preset => preset.id === id);
}

export function getDefaultPreset(): Preset {
  return JUDGE_PRESETS[0];
}
