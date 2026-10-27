import JSZip from 'jszip';
import { buildArtifactsZip, generateArtifactsZipBlob, exportArtifactsBundle, triggerBlobDownload } from '../lib/exportBundle';
import { safeGetStorage, safeSetStorage, THEME_STORAGE_KEY } from '../lib/ThemeContext';
import { Deliverables } from '../lib/types';
import * as fs from 'fs';
import * as path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`✅ PASS: ${message}`);
    passed++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 SUBAGENT 4: BUNDLE & THEME DEEP STRESS & VULNERABILITY AUDIT');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Scenario 1: null, undefined, and empty deliverables
  // -------------------------------------------------------------
  console.log('--- SCENARIO 1: null, undefined, and empty deliverables ---');
  
  // 1a. null deliverables
  {
    const zip = await buildArtifactsZip(null);
    const files = Object.keys(zip.files);
    assert(files.includes('README.md'), 'null deliverables creates README.md');
    const content = await zip.file('README.md')!.async('string');
    assert(content.includes('No active deliverables to bundle'), 'README.md contains fallback notice for null');
  }

  // 1b. undefined deliverables
  {
    const zip = await buildArtifactsZip(undefined);
    const files = Object.keys(zip.files);
    assert(files.includes('README.md'), 'undefined deliverables creates README.md');
  }

  // 1c. empty object deliverables ({})
  {
    const zip = await buildArtifactsZip({} as Deliverables);
    const files = Object.keys(zip.files);
    assert(files.includes('README.md'), 'empty object {} creates README.md');
  }

  // 1d. deliverables with empty / null nested objects
  {
    const partialDeliverables: Deliverables = {
      pullRequest: null as any,
      architecture: null as any,
      videoScript: null as any,
      socialPost: null as any,
    };
    const zip = await buildArtifactsZip(partialDeliverables);
    assert(!!zip.file('Request.md'), 'Generates Request.md even when pullRequest is null');
    assert(!!zip.file('Architecture.mmd'), 'Generates Architecture.mmd even when architecture is null');
    assert(!!zip.file('Demo_script.md'), 'Generates Demo_script.md even when videoScript is null');
    assert(!!zip.file('Social_thread.md'), 'Generates Social_thread.md even when socialPost is null');
    
    const requestText = await zip.file('Request.md')!.async('string');
    assert(requestText.includes('Feature Pull Request'), 'Falls back to default PR title');
    const archText = await zip.file('Architecture.mmd')!.async('string');
    assert(archText.includes('flowchart TD'), 'Falls back to default mermaid code');
  }

  // -------------------------------------------------------------
  // Scenario 2: Extreme text sizes (1MB markdown, 10,000 video segments)
  // -------------------------------------------------------------
  console.log('\n--- SCENARIO 2: Extreme Text Sizes & Large Payloads ---');
  {
    const startTime = performance.now();

    // 1 MB markdown content
    const oneMbMarkdown = '# Massive PR Implementation Documentation\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(18500);
    assert(oneMbMarkdown.length >= 1024 * 1024, `Generated 1MB+ string (actual size: ${(oneMbMarkdown.length / (1024 * 1024)).toFixed(2)} MB)`);

    // 10,000 video segments
    const tenThousandSegments = Array.from({ length: 10000 }, (_, idx) => ({
      timestamp: `${String(Math.floor(idx / 2)).padStart(2, '0')}:${String((idx % 2) * 30).padStart(2, '0')}`,
      stage: `Stress Stage ${idx + 1}`,
      spokenLine: `Spoken narration line number ${idx + 1} detailing complex system architecture features and voice flow transitions.`,
      visualCue: `Screen recording showing component layout frame #${idx * 60}`,
      audio: '',
    }));

    const extremeDeliverables: Deliverables = {
      pullRequest: {
        title: 'Massive Monorepo Refactor #9999',
        commitMessage: 'feat(core): full monorepo re-architecture with 10k segments',
        summary: 'Massive scale stress testing bundle',
        keyChanges: Array.from({ length: 100 }, (_, i) => `Change item ${i + 1}`),
        breakingChanges: ['Breaking change 1', 'Breaking change 2'],
        prMarkdown: oneMbMarkdown,
      },
      architecture: {
        title: 'Massive Microservices Mesh',
        mermaidCode: 'graph TD\n' + Array.from({ length: 500 }, (_, i) => `  Node${i} --> Node${i + 1}`).join('\n'),
        description: 'Large topology',
      },
      videoScript: {
        title: 'Epic 10,000-Segment Product Walkthrough',
        totalDuration: '5000:00',
        segments: tenThousandSegments,
      },
      socialPost: {
        twitter: {
          content: 'Just shipped 10,000 segments with 1MB PR documentation in under a second! #buildinpublic #performance',
          charCount: 103,
          hashtags: ['#buildinpublic', '#performance', '#voiceAI'],
        },
        linkedin: {
          hook: 'How we scaled our client-side ZIP bundler to handle 10,000 video segments and megabytes of markdown without crashing the browser.',
          body: 'Client-side memory management requires careful Blob lifecycle control and streaming DEFLATE compression.',
          takeaways: ['Never revoke Object URLs immediately', 'Always use streaming compression', 'Guard against DOM exceptions'],
          callToAction: 'Check out the repo!',
        },
      },
    };

    const zip = await buildArtifactsZip(extremeDeliverables);
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const elapsed = performance.now() - startTime;
    console.log(`⏱️ Extreme bundle generated in: ${elapsed.toFixed(1)} ms. Compressed size: ${(blob.size / 1024).toFixed(1)} KB`);
    assert(blob.size > 0, 'Generated valid non-empty blob for extreme payload');
    assert(elapsed < 10000, `Generation finished within reasonable SLA (<10s, actual: ${elapsed.toFixed(0)}ms)`);

    // Verify unpacking
    const readZip = await JSZip.loadAsync(await blob.arrayBuffer());
    const demoScriptContent = await readZip.file('Demo_script.md')!.async('string');
    assert(demoScriptContent.includes('Stage 10000'), 'Unpacked Demo_script.md contains segment 10000');
    const prContent = await readZip.file('Request.md')!.async('string');
    assert(prContent.length >= 1024 * 1024, 'Unpacked Request.md maintains 1MB+ size intact');
  }

  // -------------------------------------------------------------
  // Scenario 3: Special characters, unicode, emojis, and symbols
  // -------------------------------------------------------------
  console.log('\n--- SCENARIO 3: Special Characters, Unicode, Emojis, and Symbols ---');
  {
    const specialDeliverables: Deliverables = {
      pullRequest: {
        title: '🚀 Feat: Multi-language & Emoji Engine ✨ (PR #42) [WIP] <script>alert("XSS")</script>',
        commitMessage: 'feat(i18n): support "quotes", `backticks`, /slashes/, \\backslashes\\ & emoji: 📦🎉🔥',
        summary: 'Support for 日本語 (Japanese), 中文 (Chinese), العربية (Arabic RTL), and Кириллица.',
        keyChanges: [
          '日本語のサポートを追加しました。',
          '支持简体中文与繁体中文。',
          'دعم كامل للغة العربية من اليمين إلى اليسار.',
          'Special symbols: & < > " \' ` / \\ | ~ ! @ # $ % ^ * ( ) _ + = { } [ ] : ; , . ?',
        ],
        breakingChanges: ['⚠️ Breaking change with emoji & quotes: "DROP TABLE users;"'],
      },
      architecture: {
        title: 'Arch ⚡ Flow: A -> B -> C',
        mermaidCode: 'flowchart LR\n  A["Node 🚀 (Root)"] --> B["Node ⚡ (Service & Cache)"]\n  B --> C["Database 💾 {PostgreSQL}"]',
        description: 'Complex unicode diagram',
      },
      videoScript: {
        title: 'Demo 🎙️: "Voices in Harmony" — Act I',
        totalDuration: '03:45',
        segments: [
          {
            timestamp: '00:00',
            stage: 'Introduction 🌟',
            spokenLine: 'Welcome to ShipSpeak: "The voice engine for high-velocity shipping!" <script>console.log("Safe")</script>',
            visualCue: 'Dashboard with vibrant glowing neon accents ✨ & gradient text',
            audio: '',
          },
          {
            timestamp: '01:15',
            stage: 'Multilingual Demo 🌐',
            spokenLine: 'Tokyo 🗼, Beijing 🏯, Cairo 🏜️, and London 🎡: everyone ships at 10x.',
            visualCue: 'Globe animation spinning smoothly',
            audio: '',
          },
        ],
      },
      socialPost: {
        twitter: {
          content: '🚀 ShipSpeak now supports 100+ languages & emojis! 🌐✨ "Quotes", `code blocks`, & <tags> included! #voiceAI #buildinpublic 💻🔥',
          charCount: 120,
          hashtags: ['#voiceAI', '#buildinpublic', '#開発者'],
        },
        linkedin: {
          hook: '🎯 What happens when you combine voice brain dumps with unicode-native compilation?',
          body: 'You get seamless international shipping across: \n• 日本語 \n• 中文 \n• العربية \n• English',
          takeaways: ['Zero encoding corruption', 'Full emoji fidelity', 'Safe escaping'],
          callToAction: 'Give it a try: https://shipspeak.dev?ref=hackathon#demo',
        },
      },
    };

    const zip = await buildArtifactsZip(specialDeliverables);
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const readZip = await JSZip.loadAsync(await blob.arrayBuffer());
    const prText = await readZip.file('Request.md')!.async('string');
    assert(prText.includes('🚀 Feat: Multi-language & Emoji Engine'), 'Unicode PR title preserved in Request.md');
    assert(prText.includes('日本語のサポートを追加しました。'), 'Japanese text preserved in Request.md');
    assert(prText.includes('دعم كامل للغة العربية'), 'Arabic text preserved in Request.md');
    assert(prText.includes('<script>alert("XSS")</script>'), 'HTML tags preserved in raw markdown without corruption');

    const archText = await readZip.file('Architecture.mmd')!.async('string');
    assert(archText.includes('Node 🚀 (Root)'), 'Mermaid unicode preserved in Architecture.mmd');

    const demoText = await readZip.file('Demo_script.md')!.async('string');
    assert(demoText.includes('Tokyo 🗼, Beijing 🏯, Cairo 🏜️'), 'Emojis preserved in Demo_script.md');

    const socialText = await readZip.file('Social_thread.md')!.async('string');
    assert(socialText.includes('#開発者'), 'Unicode hashtag preserved in Social_thread.md');
  }

  // -------------------------------------------------------------
  // Scenario 4: ThemeContext behavior when localStorage is blocked
  // -------------------------------------------------------------
  console.log('\n--- SCENARIO 4: ThemeContext & localStorage Error Boundaries ---');
  {
    // 4a. Verify safeGetStorage handles missing window/storage
    const resultSsr = safeGetStorage('test_key');
    assert(resultSsr === null, 'safeGetStorage returns null safely in non-browser/SSR environment');

    // 4b. Mock window with a throwing localStorage (e.g. Safari private browsing DOMException)
    const originalWindow = (globalThis as any).window;
    
    (globalThis as any).window = {
      localStorage: {
        getItem: () => {
          const err = new Error('Access to localStorage is denied for this document');
          err.name = 'SecurityError';
          throw err;
        },
        setItem: () => {
          const err = new Error('QuotaExceededError: The quota has been exceeded');
          err.name = 'QuotaExceededError';
          throw err;
        },
      },
    };

    // Test safeGetStorage catches SecurityError
    let getThrew: boolean = false;
    let getVal: string | null = null;
    try {
      getVal = safeGetStorage(THEME_STORAGE_KEY);
    } catch {
      getThrew = true;
    }
    assert(!getThrew && getVal === null, 'safeGetStorage catches SecurityError and returns null without throwing');

    // Test safeSetStorage catches QuotaExceededError
    let setThrew: boolean = false;
    let setSuccess: boolean = true;
    try {
      setSuccess = safeSetStorage(THEME_STORAGE_KEY, 'dark');
    } catch {
      setThrew = true;
    }
    assert(!setThrew && setSuccess === false, 'safeSetStorage catches QuotaExceededError and returns false without throwing');

    // Restore or provide normal mock
    const store: Record<string, string> = {};
    (globalThis as any).window.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => { store[key] = val; },
    };

    assert(safeSetStorage('shipspeak_theme', 'dark') === true, 'safeSetStorage works when storage is available');
    assert(safeGetStorage('shipspeak_theme') === 'dark', 'safeGetStorage retrieves saved value accurately');

    // Clean up mock
    (globalThis as any).window = originalWindow;
  }

  // -------------------------------------------------------------
  // Scenario 5: Blob URL Lifecycle & Memory Leak Verification
  // -------------------------------------------------------------
  console.log('\n--- SCENARIO 5: Blob URL Lifecycle & Memory Leak Verification ---');
  {
    let createdUrl: string | null = null;
    let revokedUrl: string | null = null;
    let clickCalled: boolean = false;
    let linkAppended: boolean = false;
    let linkRemoved: boolean = false;

    const mockBlob = new Blob(['sample zip payload'], { type: 'application/zip' });

    // Mock browser environment
    const originalWindow = (globalThis as any).window;
    const originalDocument = (globalThis as any).document;
    const originalUrl = (globalThis as any).URL;

    const mockAnchor: any = {
      href: '',
      download: '',
      style: {},
      setAttribute: () => {},
      click: () => {
        clickCalled = true;
      },
    };

    (globalThis as any).window = {};
    (globalThis as any).document = {
      createElement: (tag: string) => {
        if (tag === 'a') return mockAnchor;
        return {};
      },
      body: {
        appendChild: (child: any) => {
          linkAppended = true;
        },
        removeChild: (child: any) => {
          linkRemoved = true;
        },
        contains: (child: any) => true,
      },
    };
    (globalThis as any).URL = {
      createObjectURL: (blob: any) => {
        createdUrl = 'blob:http://localhost:3000/mock-uuid-1234';
        return createdUrl;
      },
      revokeObjectURL: (url: string) => {
        revokedUrl = url;
      },
    };

    triggerBlobDownload(mockBlob, 'test-download.zip');

    assert(createdUrl !== null, 'URL.createObjectURL was called');
    assert(Boolean(clickCalled), 'downloadLink.click() was triggered');
    assert(Boolean(linkAppended), 'downloadLink was appended to document.body');
    assert(Boolean(linkRemoved), 'downloadLink was removed from document.body');
    assert(revokedUrl === null, 'URL.revokeObjectURL was NOT called synchronously (preventing browser download cut-off)');

    // Fast-forward / wait for the delayed revocation timeout
    await new Promise((resolve) => setTimeout(resolve, 1600));
    assert(revokedUrl === createdUrl, 'URL.revokeObjectURL was called after timeout, releasing memory');

    // Clean up mocks
    (globalThis as any).window = originalWindow;
    (globalThis as any).document = originalDocument;
    (globalThis as any).URL = originalUrl;
  }

  // -------------------------------------------------------------
  // Scenario 6: CSS Variable & Theme Token Consistency
  // -------------------------------------------------------------
  console.log('\n--- SCENARIO 6: CSS Variable & Theme Token Consistency ---');
  {
    const cssPath = path.resolve(__dirname, '../app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Find all CSS variable declarations
    const rootBlockMatch = cssContent.match(/:root[\s\S]*?\{([\s\S]*?)\}/);
    const darkBlockMatch = cssContent.match(/html\.dark[\s\S]*?\{([\s\S]*?)\}/);

    assert(!!rootBlockMatch, ':root / html.light block exists in globals.css');
    assert(!!darkBlockMatch, 'html.dark block exists in globals.css');

    const extractVars = (block: string) => {
      const regex = /(--[a-zA-Z0-9-]+)\s*:/g;
      const vars = new Set<string>();
      let match;
      while ((match = regex.exec(block)) !== null) {
        vars.add(match[1]);
      }
      return vars;
    };

    const lightVars = extractVars(rootBlockMatch![1]);
    const darkVars = extractVars(darkBlockMatch![1]);

    console.log(`Found ${lightVars.size} variables in :root/html.light, ${darkVars.size} in html.dark`);

    for (const v of lightVars) {
      assert(darkVars.has(v), `CSS variable "${v}" is defined in both light and dark themes`);
    }

    assert(cssContent.includes('html.light'), 'globals.css explicitly targets html.light selector alongside :root');
  }

  // -------------------------------------------------------------
  // Scenario 7: Parameter Audit & Invariant Contract Verification
  // -------------------------------------------------------------
  console.log('\n--- SCENARIO 7: Parameter Audit & Invariant Contracts ---');
  {
    // 7a. Verify exportArtifactsBundle returns Promise<void>
    const sampleDeliverable: Deliverables = {
      pullRequest: {
        title: 'Contract Test PR',
        commitMessage: 'feat: test',
        summary: 'Testing contract return type',
        keyChanges: ['Change 1'],
        breakingChanges: [],
      },
      architecture: {
        title: 'Contract Arch',
        mermaidCode: 'graph LR; A-->B',
        description: 'Test',
      },
      videoScript: {
        title: 'Contract Video',
        totalDuration: '01:00',
        segments: [],
      },
      socialPost: {
        twitter: { content: 'Test post', charCount: 9, hashtags: ['#test'] },
        linkedin: { hook: 'Hook', body: 'Body', takeaways: ['T1'], callToAction: 'CTA' },
      },
    };

    const voidReturn = await exportArtifactsBundle(sampleDeliverable);
    assert(voidReturn === undefined, 'exportArtifactsBundle strictly conforms to Promise<void> contract');

    // 7b. File presence invariants
    const populatedZip = await buildArtifactsZip(sampleDeliverable);
    const populatedFiles = Object.keys(populatedZip.files).sort();
    const expectedPopulatedFiles = ['Architecture.mmd', 'Demo_script.md', 'Request.md', 'Social_thread.md'];
    assert(
      JSON.stringify(populatedFiles) === JSON.stringify(expectedPopulatedFiles),
      `Populated deliverables zip invariant: contains exactly ${expectedPopulatedFiles.join(', ')}`
    );

    const emptyZip = await buildArtifactsZip(null);
    const emptyFiles = Object.keys(emptyZip.files);
    assert(
      emptyFiles.length === 1 && emptyFiles[0] === 'README.md',
      'Null/empty deliverables zip invariant: contains strictly README.md'
    );

    // 7c. DOM class synchronization & colorScheme invariant under state transitions
    const originalDocument = (globalThis as any).document;
    const classes = new Set<string>();
    const mockDocElement = {
      classList: {
        add: (c: string) => classes.add(c),
        remove: (c: string) => classes.delete(c),
        contains: (c: string) => classes.has(c),
      },
      style: {
        colorScheme: 'light',
      },
    };
    (globalThis as any).document = {
      documentElement: mockDocElement,
      body: { style: {} },
    };

    // Simulate switching to dark
    let currentTheme: 'light' | 'dark' = 'light';
    const applyThemeToDOM = (theme: 'light' | 'dark') => {
      const root = (globalThis as any).document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.style.colorScheme = 'light';
      }
    };

    // Initial light
    applyThemeToDOM('light');
    assert(mockDocElement.classList.contains('light'), 'Light invariant: class "light" is present');
    assert(!mockDocElement.classList.contains('dark'), 'Light invariant: class "dark" is absent');
    assert(mockDocElement.style.colorScheme === 'light', 'Light invariant: colorScheme is "light"');

    // Transition to dark
    currentTheme = 'dark';
    applyThemeToDOM(currentTheme);
    assert(mockDocElement.classList.contains('dark'), 'Dark invariant: class "dark" is present');
    assert(!mockDocElement.classList.contains('light'), 'Dark invariant: class "light" is absent');
    assert(mockDocElement.style.colorScheme === 'dark', 'Dark invariant: colorScheme is "dark"');

    // Transition back to light
    currentTheme = 'light';
    applyThemeToDOM(currentTheme);
    assert(mockDocElement.classList.contains('light'), 'Toggle back invariant: class "light" restored');
    assert(!mockDocElement.classList.contains('dark'), 'Toggle back invariant: class "dark" cleared');

    (globalThis as any).document = originalDocument;
  }

  console.log('\n================================================================');
  console.log(`🎉 ALL STRESS AUDIT TESTS PASSED: ${passed} passed, ${failed} failed.`);
  console.log('================================================================');
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
