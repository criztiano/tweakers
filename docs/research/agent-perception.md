# How the agent should perceive media — research, 2026-09-21

A decision document. Nothing here is built. Four research tracks ran in
parallel (shipped products, literature, local building blocks, agent design);
this is their synthesis. **The figures are as reported by the sources the
tracks read; none was reproduced here**, and a few speed figures come from
vendor pages or low-trust blogs. Treat numbers as orders of magnitude.

## The question

The agent reads text only. "Cut where the singer comes in", "keep the beach
shots", "trim the dead air" need it to know what is *in* the media, and to
land cuts precisely. Three routes were on the table:

1. **Metadata the app already has** — beat grid, bars, stems.
2. **A media index**, computed once per file — transcript, shots, captions,
   sound events, sections.
3. **Looking / listening on demand**, in a multi-step loop.

Cri's direction: all three, with the agent choosing per request.

## What the research says

**Everyone who ships reads an index.** Premiere's Media Intelligence,
Resolve's IntelliSearch, Final Cut 12, Jumper, Descript's Underlord, Eddie:
all precompute, then search or reason over text. Descript — the closest
product to ours — captions frames into text; its agent never sees pixels.
No shipped product hands raw video to an agent in a loop.

**The index and the on-demand look tie on accuracy; they differ in cost.**
On the hardest long-video benchmark the best index-plus-inspect agent (Deep
Video Discovery) and the best pure on-demand agent (Active Video Perception)
both reach about 74%. On-demand is ~5× faster per query but needs a model
that ingests video natively. Claude does not, so for us the index is the
floor, and the look is a refinement on top. Inside the hybrid, caption
search is worth the most (−12 points without it), frame inspection second
(−8). An agent that picks its own route beat a fixed sequence by 7.5 points.

**Errors are search errors.** On hour-long video, 85% of failures were
looking in the wrong place; 11% were the boundary. Cheap retrieval of a few
candidate windows, then a close look at those, improved results 6.7×.

**No model is frame-accurate, and should not be asked to be.** The best
localizers land within 1–4 s on short clips, worse on long files. Audio
models are far worse at "when" (best ≈31 mIoU). Models are also bad at
*writing* timestamps: selecting a segment beats generating a time.
Signal tools, by contrast, are exact: shot cuts (F1 ≈ 0.92–0.97, to the
frame), word times (tens of ms after alignment), onsets (±50 ms), beats
(±70 ms), song sections (≈60–70% within 0.5 s, fixed by snapping to the
downbeat).

**So precision is a three-step recipe:** the model finds the rough window →
optionally zooms in with denser, time-stamped frames → the *app* snaps to the
nearest hard signal. The model picks a candidate ("start of shot 14", "end
of word 212", "bar 17", "vocal_in #2"); the host computes the time.

**The praised products propose; the complained-about ones overreach.**
Praise goes to finding things and to non-destructive proposals. Complaints:
"success!" after doing nothing, overwriting the user's work, results that
always return *something* even when nothing matches, unpredictable cost.

**Latency.** 1 s keeps flow; 10 s is the limit of attention. Our 4 s single
reply is already in the uneasy zone; a 3–5 pass loop is 12–30 s. A loop is
acceptable only with visible steps ("read the transcript", "looked at 12
frames"), a cancel, and a hard budget — and never as the default path.

**What nobody does well — our opening:** checking a cut by looking at the
frames around it; non-speech sound events ("the singer comes in", "the
drop"); saying honestly "there are no beach shots here".

## Options compared

| | A · Single reply + index | B · Full multi-step loop | C · Router (recommended) |
|---|---|---|---|
| Typical wait | ~4 s | 12–30 s+ | ~4 s; slow only when it chooses to look |
| Accuracy | High where the index covers it; blind beyond it | Highest on visual and long-range asks | Near B where it matters |
| Cost per ask | 1 call | 5–50 calls | 1–3 on average |
| Failure mode | Confident wrong edit | Invented tools, drift, runaway cost, stale state | Wrong route — cheap to recover, escalation is one step |
| Build | Small | Large: state, budgets, mid-run undo | Medium: one escalation rule |

## Recommendation

**C, built in layers, each useful alone.**

1. **Candidates, not times.** Change the editing contract first: the scene
   lists named, typed boundaries; actions take a candidate id; the host
   snaps. This is the largest precision gain and needs no perception at all.
   It also removes today's "one step per verb" limit in most cases.
2. **Route 1 for free.** Bars, beats, and stem events (`vocal_in`,
   `drums_out`, `drop`) derived from the stems Primecut already makes —
   loudness gate + voice detection, snapped to the beat. Seconds per file.
   This alone answers "where the singer comes in", which no product does.
3. **The index (route 2),** computed lazily per signal and cached per source file, in three levels: a header
   (~300 tokens), a section timeline always in the prompt (4–8k tokens per
   hour), and detail (shots, transcript, words) fetched by time range.
   Local stack: ffmpeg loudness/silence, Parakeet or Whisper-MLX for words,
   TransNetV2 for shots, SigLIP2 for frame search, PANNs/CLAP for sound
   tags, allin1 for sections, a small local vision model for captions —
   captions are the heavy step and can run in the background.
   Estimated 3–5 min for a 10-min file; 8–12 min for an hour without
   captions, 15–35 with.
4. **The look (route 3),** as a bounded second pass: the single reply may
   say "I need to see 01:10–01:20"; the host returns one contact sheet
   (time burned into each tile *and* given as text), the agent answers
   again. Hard cap of two or three passes, all actions collected and applied
   once at the end, so one request stays one undo. Shown as it happens;
   cancellable.
5. **Honesty by design:** search results carry a score and a floor, so the
   agent can say "not here"; the host reads back every edit and reports what
   really changed, never trusting "success".

In the kit this is one registry of host tools with a `kind` (read · index ·
perceive · act) and a cost hint in each description — so an image app plugs
in *look*, a synth plugs in *listen*, and the agent core stays the same.

## Decided with Cri, 2026-09-21

### Nothing is indexed until a request needs it

There is no "index the file" step. The index is a set of **independent
signals** — loudness, silence, words, shots, sound tags, sections, stem
events, captions — each computed the first time the agent asks for it, then
cached for good.

- The agent always sees the **menu**: each signal, what it answers, its state
  (`ready` · `not computed`) and its cost ("about 20 s for this file"). Asking
  for a signal is a tool call like any other; the cost hint is how it chooses
  the cheapest route that can answer.
- **Range first.** A signal is computed for the part the request is about —
  the clips on the timeline, a time range — not the whole source, wherever the
  tool allows it (captions, frame search, sound tags do; sections and beat
  grids need the whole track).
- A request that needs no signal costs nothing and stays a ~4 s reply. The
  first request that needs a slow signal waits for it, visibly ("listening to
  the file… 20 s"), with a cancel. Every later request finds it ready.
- Cached by the source file's identity (path + the `revision` Primecut
  already keeps), so a file re-opened next week is still indexed, and a file
  that changed on disk is not trusted.

### The index belongs to the source, never to the edit

An edit must not break the index, and it does not have to, because **the
index never describes the timeline.** It describes the *source file*, in
source time, and the source file does not change when you edit. Primecut is
already non-destructive — slots and removed ranges are source-time ranges —
so the host has the other half for free: the **edit map**, source time ↔
timeline time.

What the agent reads is always a **projection**, made fresh at every ask:
index entries × edit map.

- Remove a chunk → its entries drop out of the projection; everything after
  shifts. Nothing is recomputed. Undo the removal and they are back.
- Move "the beach" earlier → the same entries appear at the new place.
- An entry the cut runs through (a word, a shot, a vocal phrase) is kept and
  marked `partial`, so the agent knows the sentence now starts mid-word.
- Candidates stay valid across edits because they are named in source terms
  ("shot 14", "word 212", "vocal_in #2") — so a follow-up request can still
  say "the same shot as before".
- Structure that depended on order (song sections after a rearrange) keeps
  its labels per piece; the agent is told the order is now the edit's, not
  the song's.

**Where this stops** — the "up to a point":

| Edit | Index |
|---|---|
| Cut, trim, remove, move, reorder, duplicate | Survives whole. Pure projection. |
| Speed / time-stretch by a known factor | Survives: the edit map scales the times. Pitch-sensitive signals (key) are flagged. |
| A new rendered file — stem extraction, Polish, a bounce | A new source, with its own index, computed lazily. It inherits from its parent whatever rendering cannot have changed (words and shots survive a Polish; loudness does not). |
| The file replaced on disk | The `revision` changes: the index is dropped. |

For the kit this means the host contract is two things, not one: **signals**
(source-time, cacheable, host-computed) and an **edit map** (cheap, read at
every ask). The kit does the projection, so every app gets edit-proof
indexing by describing its edits, not by re-indexing.

## Open risks

- **Subscription route and images.** The bridge runs a bare Claude Code turn
  with no tools. Looking means letting that turn read an image file —
  opening, narrowly, what is deliberately closed today. Needs a spike before
  anything depends on it.
- **The index is the accuracy ceiling.** (It no longer goes stale after edits: see the projection above.)
- **DJ sets and strobes** break structure and shot models trained on single
  songs and clean footage: split by track first; merge near-identical shots.
- **Install weight and licences.** allin1 is flaky on macOS (unmerged fix);
  madmom is unmaintained and non-commercial; several vision weights are
  research-only. Fine for a personal tool; a blocker if this ever ships.
- **Sung lyrics transcribe badly** (20–40% word errors on dense mixes).
- No direct study of how long users tolerate an edit command to take, and no
  paper measures the snapping recipe end to end: both are inferred.

## Sources

Products: Adobe Media Intelligence docs; Larry Jordan on IntelliSearch;
Descript (Cognitive Revolution interview, Anthropic case study, Underlord help
and feedback board); ProVideo Coalition on Jumper, FCP 12, Eddie, Quickture;
Twelve Labs × Frame.io; premiere-pro-mcp, fcp-mcp-server, davinci-resolve-mcp.
Literature: Deep Video Discovery (2505.18079), Active Video Perception
(2512.05774), VideoAgent (2403.10517), VideoTree (2405.19209), VideoMind
(2503.13444), TimeLens (2512.14698), NumPro (2411.10332), MeCo (2503.09027),
"Temporal Grounding… is a Search Problem" (2606.12300), TAG-Bench
(2609.01542), SongFormer (2510.02797), LAVE (2402.10294), ExpressEdit
(2403.17693), EditDuet (2509.10761), Unified Agentic Video Editing
(2609.12769). Guidance: Anthropic — Building effective agents, Writing tools
for agents, Effective context engineering, Advanced tool use; Claude vision
docs; Nielsen on response times. Tools: parakeet-mlx, WhisperX, TransNetV2,
PySceneDetect, SigLIP2, mlx-vlm/Qwen3-VL, allin1 (+PR 39), Beat This!,
Silero VAD, PANNs, CLAP.
