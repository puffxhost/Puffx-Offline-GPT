# Puffx Ofline GPT V2 — Draft

> **Status: planning draft.** V1 stays the stable version. This document describes the proposed V2 scope; it does not claim the features below are already implemented.

## Goals

- Keep local Ollama chat as the default and preserve V1's simple startup.
- Use the V1 default chat model, `qwen2.5:3b` (~1.9 GB download), for the initial V2 proposal so the core chat model does not add a larger download.
- Let users talk to the assistant in a hands-free, call-like voice mode.
- Add explicit, source-linked web search for questions that need current information.
- Give users a profile/source panel to inspect and refresh developer knowledge.
- Keep V1 and V2 installable separately and publish V2 only after review.

## Proposed V2 features

### 🎙️ Voice chat and voice search

- Add **push-to-talk** and an optional **conversation mode** with turn-taking, mute, stop, and interruption controls.
- Speak prompts into the chat; optionally speak the assistant response aloud.
- Prefer **local speech-to-text and text-to-speech** so voice stays on the user's computer. Keep browser speech services as an opt-in fallback only, with a clear disclosure before microphone use. Local speech model download sizes and supported hardware requirements must be documented separately before release; they are not part of the chat-model size.
- Ask for microphone permission only after the user presses the microphone button. Provide text-only mode for unsupported browsers and accessibility.
- Voice search uses the recognized transcript as the search query and shows the same source links as typed search.

**Implementation decision for the first V2 build:** use adapters for speech recognition and speech synthesis. Ship a local-engine path first; document the model/runtime download and hardware cost. Browser-provided speech can be enabled separately and must explain that processing may leave the device.

### 🔎 Web search with citations

- Keep local chat available without search. Search is an explicit feature and can be disabled.
- Check developer-approved profile pages first for developer questions.
- For broader current-web search, use a configurable search provider (initial proposal: a user-configured SearXNG endpoint); do not scrape arbitrary websites as a hidden side effect.
- Show source title, domain, link, and retrieval time with search-assisted answers.
- Treat page content as untrusted data, ignore instructions found in pages, and distinguish sourced facts from model-generated explanation.
- If search is off, unavailable, or returns weak results, say that the answer may be out of date instead of inventing citations.

### 🪪 Personal workspace name

- Replace the generic sidebar label with the user's preferred name.
- Support both a manual edit control and explicit chat commands such as “call me Alex” or “mujhe Alex bulao.”
- Confirm a rename before returning to normal conversation, update the sidebar avatar/name, and persist the preference only in the current browser.
- Include the preferred name as context for local Ollama responses; do not send it to web search or a cloud service.
- Let users reset the preference from the manual edit control.

### 🧑‍💻 Developer profile panel

- Show the curated profile, allowed source list, each source's last refresh result/time, and a manual **Refresh** control.
- Let the user review proposed profile changes before adding them to local knowledge.
- Keep a small change history with source and timestamp; provide **clear profile data**.
- Continue excluding unrelated sensitive personal details. Do not silently save every fetched page into the profile.

### 📦 Versioning and migration

- Keep V1 on the existing stable branch and release.
- Develop V2 on a separate branch and use separate Docker tags (v2/preview tag) only after the V2 build is reviewed.
- Preserve user chat history where practical; explain any settings or data migration before it happens.
- Do not move latest to V2 until an explicit stable V2 release.

## Privacy and safety requirements

- Local Ollama remains the default model path.
- No microphone capture before user action. Show a recording state and a one-click stop/mute control.
- Disclose whether the selected speech engine is local or browser/cloud provided.
- Send a web query only after the user turns on or requests search; never send full chat history to the search provider.
- Keep search credentials in environment/configuration, never in the browser bundle or repository.
- Restrict fetching to HTTP/HTTPS, bound response sizes and timeouts, validate redirects, and filter unsupported content.
- Do not store raw audio. Keep fetched pages and accepted profile edits local with clear delete controls.
- Keep the preferred workspace name in browser storage and provide a clear reset control.

## Draft delivery plan

1. Add the developer profile status/refresh/review API and a small accessible profile panel.
2. Add a voice toolbar and text-to-speech controls; connect the local speech adapter and document setup.
3. Add explicit search settings/provider configuration, result citations, and transcript-to-search flow.
4. Add V2 setup docs, Docker preview tags, and version-specific upgrade instructions.
5. Review privacy, failure fallbacks, and voice/search behavior before creating a V2 release.

## Review checklist

- [ ] Confirm the first speech runtime and supported platforms.
- [ ] Confirm whether V2's broader search provider should be self-hosted SearXNG or another provider.
- [ ] Implement features incrementally without changing V1 behavior.
- [ ] Add and run implementation checks before release.
- [ ] Publish V2 only after the draft is reviewed.
